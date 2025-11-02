"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Calendar } from "lucide-react";
import AIMealPlanGenerator from "@/components/ai-meal-plan-generator";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Ingredient {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  kcal: number;
  servingSize: number;
  unit: string;
}

interface Meal {
  ingredientId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  quantity: string;
  notes: string;
}

interface Day {
  notes: string;
  meals: Meal[];
}

export default function MealPlanCreation() {
  const [members, setMembers] = useState<Member[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    userId: "",
    startDate: "",
    notes: "",
  });

  const [days, setDays] = useState<Day[]>(
    Array(7)
      .fill(null)
      .map(() => ({
        notes: "",
        meals: [],
      }))
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, ingredientsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/ingredients"),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (ingredientsRes.ok) {
        const ingredientsData = await ingredientsRes.json();
        setIngredients(ingredientsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addMeal = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].meals.push({
      ingredientId: "",
      mealType: "breakfast",
      quantity: "",
      notes: "",
    });
    setDays(newDays);
  };

  const removeMeal = (dayIndex: number, mealIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].meals.splice(mealIndex, 1);
    setDays(newDays);
  };

  const updateMeal = (
    dayIndex: number,
    mealIndex: number,
    field: keyof Meal,
    value: string
  ) => {
    const newDays = [...days];
    newDays[dayIndex].meals[mealIndex][field] = value as any;
    setDays(newDays);
  };

  const updateDayNotes = (dayIndex: number, notes: string) => {
    const newDays = [...days];
    newDays[dayIndex].notes = notes;
    setDays(newDays);
  };

  const handleAIPlanGenerated = (aiPlan: Array<{
    dayNumber: number;
    meals: Array<{
      mealType: "breakfast" | "lunch" | "dinner" | "snack";
      ingredients: Array<{
        ingredientId: string;
        ingredientName: string;
        quantity: number;
      }>;
      notes: string;
    }>;
    notes: string;
  }>) => {
    // Convert AI plan to our format - flatten multiple ingredients into separate meal entries
    const newDays = aiPlan.map((day) => ({
      notes: day.notes,
      meals: day.meals.flatMap((meal) =>
        meal.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          mealType: meal.mealType,
          quantity: ing.quantity.toString(),
          notes: meal.notes,
        }))
      ),
    }));

    // Ensure we have exactly 7 days
    while (newDays.length < 7) {
      newDays.push({ notes: "", meals: [] });
    }

    setDays(newDays.slice(0, 7));
  };

  const calculateDayMacros = (day: Day) => {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalKcal = 0;

    day.meals.forEach((meal) => {
      const ingredient = ingredients.find((i) => i.id === meal.ingredientId);
      if (ingredient && meal.quantity) {
        const multiplier = parseFloat(meal.quantity) / ingredient.servingSize;
        totalProtein += ingredient.protein * multiplier;
        totalCarbs += ingredient.carbs * multiplier;
        totalFat += ingredient.fat * multiplier;
        totalKcal += ingredient.kcal * multiplier;
      }
    });

    return { totalProtein, totalCarbs, totalFat, totalKcal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.startDate || !formData.name) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          days: days.map((day) => ({
            notes: day.notes,
            meals: day.meals.filter(
              (meal) => meal.ingredientId && meal.quantity
            ),
          })),
        }),
      });

      if (response.ok) {
        alert("Meal plan created successfully!");
        // Reset form
        setFormData({
          name: "",
          description: "",
          userId: "",
          startDate: "",
          notes: "",
        });
        setDays(
          Array(7)
            .fill(null)
            .map(() => ({
              notes: "",
              meals: [],
            }))
        );
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create meal plan");
      }
    } catch (error) {
      console.error("Error creating meal plan:", error);
      alert("Failed to create meal plan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Meal Plan</h1>
        <p className="text-muted-foreground mt-2">
          Create a 7-day meal plan for a member
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>Basic information about the meal plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">Member *</Label>
                <Select
                  value={formData.userId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, userId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Plan Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {days.map((day, dayIndex) => {
          const macros = calculateDayMacros(day);
          return (
            <Card key={dayIndex}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Day {dayIndex + 1}</CardTitle>
                    <CardDescription>
                      Totals: {macros.totalProtein.toFixed(1)}g protein,{" "}
                      {macros.totalCarbs.toFixed(1)}g carbs,{" "}
                      {macros.totalFat.toFixed(1)}g fat,{" "}
                      {macros.totalKcal.toFixed(0)} kcal
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addMeal(dayIndex)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Meal
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Day Notes</Label>
                  <Textarea
                    value={day.notes}
                    onChange={(e) => updateDayNotes(dayIndex, e.target.value)}
                    placeholder="Any special notes for this day..."
                  />
                </div>

                {day.meals.map((meal, mealIndex) => (
                  <div
                    key={mealIndex}
                    className="border p-4 rounded-md space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Meal {mealIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMeal(dayIndex, mealIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Meal Type</Label>
                        <Select
                          value={meal.mealType}
                          onValueChange={(value) =>
                            updateMeal(dayIndex, mealIndex, "mealType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Ingredient</Label>
                        <Select
                          value={meal.ingredientId}
                          onValueChange={(value) =>
                            updateMeal(dayIndex, mealIndex, "ingredientId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ingredient" />
                          </SelectTrigger>
                          <SelectContent>
                            {ingredients.map((ingredient) => (
                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                {ingredient.name} ({ingredient.servingSize}
                                {ingredient.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Quantity (in ingredient's unit)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={meal.quantity}
                          onChange={(e) =>
                            updateMeal(
                              dayIndex,
                              mealIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 150"
                        />
                      </div>

                      <div>
                        {meal.ingredientId && meal.quantity && (
                          <div className="pt-6">
                            {(() => {
                              const ingredient = ingredients.find(
                                (i) => i.id === meal.ingredientId
                              );
                              if (ingredient) {
                                const multiplier =
                                  parseFloat(meal.quantity) /
                                  ingredient.servingSize;
                                const p = ingredient.protein * multiplier;
                                const c = ingredient.carbs * multiplier;
                                const f = ingredient.fat * multiplier;
                                const k = ingredient.kcal * multiplier;
                                return (
                                  <p className="text-sm text-muted-foreground">
                                    {p.toFixed(1)}g P, {c.toFixed(1)}g C,{" "}
                                    {f.toFixed(1)}g F, {k.toFixed(0)} kcal
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Meal Notes</Label>
                      <Input
                        value={meal.notes}
                        onChange={(e) =>
                          updateMeal(dayIndex, mealIndex, "notes", e.target.value)
                        }
                        placeholder="e.g., cook with olive oil"
                      />
                    </div>
                  </div>
                ))}

                {day.meals.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No meals added yet. Click "Add Meal" to start.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Meal Plan"}
          </Button>
        </div>
      </form>

      {/* AI Generator Section */}
      <div className="mt-8">
        <AIMealPlanGenerator onPlanGenerated={handleAIPlanGenerated} />
      </div>
    </div>
  );
}

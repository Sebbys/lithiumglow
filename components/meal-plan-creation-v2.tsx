"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, X, Edit, Trash2, Calendar, Sparkles } from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  type: string;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  unit: string;
}

// Helper to calculate kcal from macros
const calculateKcal = (protein: number, carbs: number, fat: number) => {
  return (protein * 4) + (carbs * 4) + (fat * 9);
};

interface MealIngredient {
  ingredientId: string;
  quantity: string;
  preparationNote: string;
}

interface ComposedMeal {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  mealName: string;
  ingredients: MealIngredient[];
  notes: string;
}

interface Day {
  notes: string;
  meals: ComposedMeal[];
}

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function MealPlanCreationV2() {
  const [members, setMembers] = useState<Member[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    description: "",
    startDate: "",
    status: "draft" as const,
  });

  const [days, setDays] = useState<Day[]>(
    Array.from({ length: 7 }, () => ({
      notes: "",
      meals: [],
    }))
  );

  // Dialog states
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);
  const [mealForm, setMealForm] = useState<ComposedMeal>({
    mealType: "breakfast",
    mealName: "",
    ingredients: [],
    notes: "",
  });

  const [aiForm, setAiForm] = useState({
    targetCalories: "",
    targetProtein: "",
    targetCarbs: "",
    targetFat: "",
    dietaryPreferences: "",
    allergies: "",
  });

  useEffect(() => {
    Promise.all([fetchMembers(), fetchIngredients()]).finally(() => setLoading(false));
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members");
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients");
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  const handleAddMeal = () => {
    setEditingMealIndex(null);
    setMealForm({
      mealType: "breakfast",
      mealName: "",
      ingredients: [],
      notes: "",
    });
    setMealDialogOpen(true);
  };

  const handleEditMeal = (mealIndex: number) => {
    setEditingMealIndex(mealIndex);
    setMealForm({ ...days[currentDay].meals[mealIndex] });
    setMealDialogOpen(true);
  };

  const handleDeleteMeal = (mealIndex: number) => {
    if (confirm("Are you sure you want to delete this meal?")) {
      const newDays = [...days];
      newDays[currentDay].meals.splice(mealIndex, 1);
      setDays(newDays);
    }
  };

  const handleSaveMeal = () => {
    if (!mealForm.mealName || mealForm.ingredients.length === 0) {
      alert("Please provide a meal name and at least one ingredient");
      return;
    }

    const newDays = [...days];
    if (editingMealIndex !== null) {
      newDays[currentDay].meals[editingMealIndex] = { ...mealForm };
    } else {
      newDays[currentDay].meals.push({ ...mealForm });
    }
    setDays(newDays);
    setMealDialogOpen(false);
  };

  const handleAddIngredientToMeal = () => {
    setMealForm({
      ...mealForm,
      ingredients: [
        ...mealForm.ingredients,
        { ingredientId: "", quantity: "", preparationNote: "" },
      ],
    });
  };

  const handleRemoveIngredientFromMeal = (index: number) => {
    const newIngredients = [...mealForm.ingredients];
    newIngredients.splice(index, 1);
    setMealForm({ ...mealForm, ingredients: newIngredients });
  };

  const handleIngredientChange = (
    index: number,
    field: keyof MealIngredient,
    value: string
  ) => {
    const newIngredients = [...mealForm.ingredients];
    newIngredients[index][field] = value;
    setMealForm({ ...mealForm, ingredients: newIngredients });
  };

  const calculateMealMacros = (meal: ComposedMeal) => {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    meal.ingredients.forEach((mealIng) => {
      const ingredient = ingredients.find((i) => i.id === mealIng.ingredientId);
      if (ingredient && mealIng.quantity) {
        const multiplier = parseFloat(mealIng.quantity) / ingredient.servingSize;
        totalProtein += ingredient.protein * multiplier;
        totalCarbs += ingredient.carbs * multiplier;
        totalFat += ingredient.fat * multiplier;
      }
    });

    const totalKcal = calculateKcal(totalProtein, totalCarbs, totalFat);
    return { totalProtein, totalCarbs, totalFat, totalKcal };
  };

  const calculateDayMacros = (day: Day) => {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    day.meals.forEach((meal) => {
      const macros = calculateMealMacros(meal);
      totalProtein += macros.totalProtein;
      totalCarbs += macros.totalCarbs;
      totalFat += macros.totalFat;
    });

    const totalKcal = calculateKcal(totalProtein, totalCarbs, totalFat);
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
      const response = await fetch("/api/meal-plans/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          days: days.map((day) => ({
            notes: day.notes,
            meals: day.meals.filter((meal) => meal.ingredients.length > 0),
          })),
        }),
      });

      if (response.ok) {
        alert("Meal plan created successfully!");
        window.location.href = "/nutritionist";
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

  const getIngredientsByType = (type: string) => {
    return ingredients.filter((i) => i.type === type);
  };

  const handleGenerateAI = async () => {
    if (!aiForm.targetCalories || !aiForm.targetProtein || !aiForm.targetCarbs || !aiForm.targetFat) {
      alert("Please fill in all macro targets");
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch("/api/meal-plans/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCalories: parseInt(aiForm.targetCalories),
          targetProtein: parseInt(aiForm.targetProtein),
          targetCarbs: parseInt(aiForm.targetCarbs),
          targetFat: parseInt(aiForm.targetFat),
          dietaryPreferences: aiForm.dietaryPreferences || undefined,
          allergies: aiForm.allergies || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate meal plan");
      }

      const data = await response.json();
      
      // Map AI response to our days structure
      const generatedDays = data.mealPlan.map((day: any) => ({
        notes: day.notes || "",
        meals: day.meals.map((meal: any) => ({
          mealType: meal.mealType,
          mealName: meal.mealName,
          ingredients: meal.ingredients.map((ing: any) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity.toString(),
            preparationNote: ing.preparationNote || "",
          })),
          notes: meal.notes || "",
        })),
      }));

      setDays(generatedDays);
      setAiDialogOpen(false);
      alert("AI meal plan generated successfully!");
    } catch (error) {
      console.error("Error generating AI meal plan:", error);
      alert(error instanceof Error ? error.message : "Failed to generate meal plan");
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const dayMacros = calculateDayMacros(days[currentDay]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create 7-Day Meal Plan
          </CardTitle>
          <CardDescription>
            Build meal plans with composed meals like "Chicken Soba Veggie Bowl"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">Select Member *</Label>
                <Select
                  value={formData.userId}
                  onValueChange={(value) => setFormData({ ...formData, userId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a member" />
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
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Weight Loss - Week 1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Overall plan description..."
              />
            </div>

            {/* AI Generator Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setAiDialogOpen(true)}
                className="w-full max-w-md"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate with AI
              </Button>
            </div>



            {/* Days Tabs */}
            <Tabs value={currentDay.toString()} onValueChange={(v) => setCurrentDay(parseInt(v))}>
              <TabsList className="grid w-full grid-cols-7">
                {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"].map((day, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    {day}
                  </TabsTrigger>
                ))}
              </TabsList>

              {days.map((day, dayIndex) => (
                  <TabsContent key={dayIndex} value={dayIndex.toString()} className="space-y-4">
                    {/* Day Header with Macros */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Day {dayIndex + 1}</h3>
                      <div className="text-sm text-muted-foreground">
                        Totals: {dayMacros.totalProtein.toFixed(1)}g protein, {dayMacros.totalCarbs.toFixed(1)}g carbs, {dayMacros.totalFat.toFixed(1)}g fat, {dayMacros.totalKcal.toFixed(0)} kcal
                      </div>
                    </div>                    {/* Day Notes */}
                    <div>
                      <Label htmlFor={`day-notes-${dayIndex}`}>Day Notes</Label>
                      <Textarea
                        id={`day-notes-${dayIndex}`}
                        value={day.notes}
                        onChange={(e) => {
                          const newDays = [...days];
                          newDays[dayIndex].notes = e.target.value;
                          setDays(newDays);
                        }}
                        placeholder="Any special notes for this day..."
                        rows={2}
                      />
                    </div>

                    {/* Meals */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-base">Meals</Label>
                        <Button type="button" onClick={handleAddMeal} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Meal
                        </Button>
                      </div>

                      {day.meals.map((meal, mealIndex) => {
                        const macros = calculateMealMacros(meal);
                        return (
                          <Card key={mealIndex} className="relative">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{meal.mealName}</CardTitle>
                                  <CardDescription className="mt-1">
                                    <span className="capitalize font-medium">{meal.mealType}</span>
                                  </CardDescription>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditMeal(mealIndex)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteMeal(mealIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <div className="text-sm font-medium mb-2">Ingredients:</div>
                                  <ul className="space-y-1">
                                    {meal.ingredients.map((ing, ingIndex) => {
                                      const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
                                      return (
                                        <li key={ingIndex} className="text-sm">
                                          {ing.preparationNote && (
                                            <span className="text-muted-foreground">{ing.preparationNote} </span>
                                          )}
                                          {ingredient?.name} ({ing.quantity}
                                          {ingredient?.unit})
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                                {meal.notes && (
                                  <div className="text-sm text-muted-foreground italic border-t pt-2">
                                    {meal.notes}
                                  </div>
                                )}
                                <div className="flex gap-4 text-sm border-t pt-2">
                                  <span>P: {macros.totalProtein.toFixed(1)}g</span>
                                  <span>C: {macros.totalCarbs.toFixed(1)}g</span>
                                  <span>F: {macros.totalFat.toFixed(1)}g</span>
                                  <span className="font-medium">{macros.totalKcal.toFixed(0)} kcal</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
            </Tabs>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Meal Plan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Meal Dialog */}
      <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMealIndex !== null ? "Edit Meal" : "Add Meal"}
            </DialogTitle>
            <DialogDescription>
              Create a composed meal like "Chicken Soba Veggie Bowl" with multiple ingredients
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mealName">Meal Name *</Label>
                <Input
                  id="mealName"
                  value={mealForm.mealName}
                  onChange={(e) => setMealForm({ ...mealForm, mealName: e.target.value })}
                  placeholder="e.g., Chicken Soba Veggie Bowl"
                />
              </div>
              <div>
                <Label htmlFor="mealType">Meal Type *</Label>
                <Select
                  value={mealForm.mealType}
                  onValueChange={(value: any) => setMealForm({ ...mealForm, mealType: value })}
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
            </div>

            <div>
              <Label htmlFor="mealNotes">Preparation Notes</Label>
              <Textarea
                id="mealNotes"
                value={mealForm.notes}
                onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                placeholder="Overall preparation instructions or serving suggestions..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-base">Ingredients</Label>
                <Button type="button" onClick={handleAddIngredientToMeal} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>

              <div className="space-y-2">
                {mealForm.ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-2 items-end p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1 grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Label className="text-xs">Ingredient</Label>
                        <Select
                          value={ing.ingredientId}
                          onValueChange={(value) =>
                            handleIngredientChange(index, "ingredientId", value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select ingredient" />
                          </SelectTrigger>
                          <SelectContent>
                            {["protein", "carbs", "vegetables", "fruits", "fats", "dairy", "legumes", "dressing"].map(
                              (type) => {
                                const typeIngredients = getIngredientsByType(type);
                                if (typeIngredients.length === 0) return null;
                                return (
                                  <div key={type}>
                                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                                      {type}
                                    </div>
                                    {typeIngredients.map((ingredient) => (
                                      <SelectItem key={ingredient.id} value={ingredient.id}>
                                        {ingredient.name}
                                      </SelectItem>
                                    ))}
                                  </div>
                                );
                              }
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={ing.quantity}
                          onChange={(e) =>
                            handleIngredientChange(index, "quantity", e.target.value)
                          }
                          placeholder="100"
                          className="h-9"
                        />
                      </div>
                      <div className="col-span-5">
                        <Label className="text-xs">Preparation</Label>
                        <Input
                          value={ing.preparationNote}
                          onChange={(e) =>
                            handleIngredientChange(index, "preparationNote", e.target.value)
                          }
                          placeholder="e.g., Baked, Roasted, Steamed"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveIngredientFromMeal(index)}
                      className="h-9 w-9 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setMealDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveMeal}>
                {editingMealIndex !== null ? "Update Meal" : "Add Meal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generator Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Meal Plan Generator
            </DialogTitle>
            <DialogDescription>
              Generate a 7-day meal plan based on macro targets
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetCalories">Target Calories *</Label>
                <Input
                  id="targetCalories"
                  type="number"
                  value={aiForm.targetCalories}
                  onChange={(e) => setAiForm({ ...aiForm, targetCalories: e.target.value })}
                  placeholder="2000"
                />
              </div>
              <div>
                <Label htmlFor="targetProtein">Target Protein (g) *</Label>
                <Input
                  id="targetProtein"
                  type="number"
                  value={aiForm.targetProtein}
                  onChange={(e) => setAiForm({ ...aiForm, targetProtein: e.target.value })}
                  placeholder="150"
                />
              </div>
              <div>
                <Label htmlFor="targetCarbs">Target Carbs (g) *</Label>
                <Input
                  id="targetCarbs"
                  type="number"
                  value={aiForm.targetCarbs}
                  onChange={(e) => setAiForm({ ...aiForm, targetCarbs: e.target.value })}
                  placeholder="200"
                />
              </div>
              <div>
                <Label htmlFor="targetFat">Target Fat (g) *</Label>
                <Input
                  id="targetFat"
                  type="number"
                  value={aiForm.targetFat}
                  onChange={(e) => setAiForm({ ...aiForm, targetFat: e.target.value })}
                  placeholder="60"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
              <Input
                id="dietaryPreferences"
                value={aiForm.dietaryPreferences}
                onChange={(e) => setAiForm({ ...aiForm, dietaryPreferences: e.target.value })}
                placeholder="e.g., low-carb, high-protein"
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies / Avoid</Label>
              <Input
                id="allergies"
                value={aiForm.allergies}
                onChange={(e) => setAiForm({ ...aiForm, allergies: e.target.value })}
                placeholder="e.g., dairy, nuts"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setAiDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleGenerateAI} disabled={aiGenerating}>
                {aiGenerating ? "Generating..." : "Generate Plan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

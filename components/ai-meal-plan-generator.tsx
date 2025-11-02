"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIGeneratedIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
}

interface AIGeneratedMeal {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  ingredients: AIGeneratedIngredient[];
  notes: string;
}

interface AIGeneratedDay {
  dayNumber: number;
  meals: AIGeneratedMeal[];
  notes: string;
}

interface AIMealPlanGeneratorProps {
  onPlanGenerated: (plan: AIGeneratedDay[]) => void;
}

export default function AIMealPlanGenerator({ onPlanGenerated }: AIMealPlanGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    targetCalories: "2000",
    targetProtein: "150",
    targetCarbs: "200",
    targetFat: "65",
    dietaryPreferences: "",
    allergies: "",
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/meal-plans/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate meal plan");
      }

      setSuccess(
        `✨ AI generated a 7-day meal plan using ${data.ingredientsUsed} ingredients!`
      );
      onPlanGenerated(data.mealPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate meal plan");
    } finally {
      setLoading(false);
    }
  };

  const calculateKcal = () => {
    const protein = parseFloat(formData.targetProtein) || 0;
    const carbs = parseFloat(formData.targetCarbs) || 0;
    const fat = parseFloat(formData.targetFat) || 0;
    return Math.round(protein * 4 + carbs * 4 + fat * 9);
  };

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Meal Plan Generator</CardTitle>
        </div>
        <CardDescription>
          Let AI create a healthy and tasty 7-day meal plan based on your targets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetCalories">Target Calories (per day)</Label>
              <Input
                id="targetCalories"
                type="number"
                step="50"
                value={formData.targetCalories}
                onChange={(e) =>
                  setFormData({ ...formData, targetCalories: e.target.value })
                }
                required
              />
            </div>
            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                From macros: {calculateKcal()} kcal
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="targetProtein">Protein (g/day)</Label>
              <Input
                id="targetProtein"
                type="number"
                step="5"
                value={formData.targetProtein}
                onChange={(e) =>
                  setFormData({ ...formData, targetProtein: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="targetCarbs">Carbs (g/day)</Label>
              <Input
                id="targetCarbs"
                type="number"
                step="5"
                value={formData.targetCarbs}
                onChange={(e) =>
                  setFormData({ ...formData, targetCarbs: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="targetFat">Fat (g/day)</Label>
              <Input
                id="targetFat"
                type="number"
                step="5"
                value={formData.targetFat}
                onChange={(e) =>
                  setFormData({ ...formData, targetFat: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dietaryPreferences">
              Dietary Preferences (optional)
            </Label>
            <Input
              id="dietaryPreferences"
              placeholder="e.g., vegetarian, low-carb, high-protein"
              value={formData.dietaryPreferences}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dietaryPreferences: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="allergies">Allergies/Restrictions (optional)</Label>
            <Textarea
              id="allergies"
              placeholder="e.g., dairy-free, nut allergy, gluten-free"
              value={formData.allergies}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-600">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Meal Plan
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            AI will create a balanced 7-day meal plan using available ingredients.
            This may take 10-30 seconds.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

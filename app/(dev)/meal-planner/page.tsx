import { MealGeneratorForm } from "@/components/ai-meal-generator-form";

export default function MealPlannerPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Weekly Meal Planner</h1>
          <p className="text-muted-foreground">
            Generate a personalized 7-day meal plan based on your macro targets and preferences
          </p>
        </div>
        
        <MealGeneratorForm />
      </div>
    </div>
  );
}

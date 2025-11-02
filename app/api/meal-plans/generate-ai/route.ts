import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { ingredient, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MiniMaxClient } from "@/lib/minimax-client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only nutritionists and admins can use AI generation
    if (session.user.role !== "nutritionist" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only nutritionists can use AI meal plan generation" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      dietaryPreferences,
      allergies,
    } = body;

    // Validate required fields
    if (
      !targetCalories ||
      !targetProtein ||
      !targetCarbs ||
      !targetFat
    ) {
      return NextResponse.json(
        {
          error:
            "Target calories, protein, carbs, and fat are required",
        },
        { status: 400 }
      );
    }

    // Get all available ingredients
    const ingredients = await db.select().from(ingredient);

    if (ingredients.length === 0) {
      return NextResponse.json(
        {
          error:
            "No ingredients available. Please add ingredients first.",
        },
        { status: 400 }
      );
    }

    // Initialize MiniMax client
    const minimax = new MiniMaxClient();

    // Generate meal plan using AI
    const result = await minimax.generateMealPlan({
      targetCalories: parseFloat(targetCalories),
      targetProtein: parseFloat(targetProtein),
      targetCarbs: parseFloat(targetCarbs),
      targetFat: parseFloat(targetFat),
      dietaryPreferences,
      allergies,
      availableIngredients: ingredients,
    });

    // Validate that all ingredient IDs exist
    const ingredientIds = new Set(ingredients.map((i) => i.id));
    const invalidMeals: string[] = [];

    result.mealPlan.forEach((day) => {
      day.meals.forEach((meal) => {
        meal.ingredients.forEach((ing) => {
          if (!ingredientIds.has(ing.ingredientId)) {
            invalidMeals.push(
              `Day ${day.dayNumber}, ${meal.mealType} (${meal.mealName}): ingredient ID ${ing.ingredientId}`
            );
          }
        });
      });
    });

    if (invalidMeals.length > 0) {
      console.error("AI generated invalid ingredient IDs:", invalidMeals);
      return NextResponse.json(
        {
          error:
            "AI generated meal plan with invalid ingredients. Please try again.",
          details: invalidMeals,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mealPlan: result.mealPlan,
      reasoning: result.reasoning,
      ingredientsUsed: ingredients.length,
    });
  } catch (error) {
    console.error("Error generating AI meal plan:", error);
    return NextResponse.json(
      {
        error: "Failed to generate meal plan",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { mealPlan, mealPlanDay, mealPlanDayMeal, mealPlanDayMealIngredient, ingredient, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

// GET single meal plan with all days and ingredients
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get meal plan
    const [plan] = await db
      .select()
      .from(mealPlan)
      .where(eq(mealPlan.id, id))
      .limit(1);

    if (!plan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (
      plan.userId !== session.user.id &&
      plan.nutritionistId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to view this meal plan" },
        { status: 403 }
      );
    }

    // Get all days for this plan
    const days = await db
      .select()
      .from(mealPlanDay)
      .where(eq(mealPlanDay.mealPlanId, id))
      .orderBy(mealPlanDay.dayNumber);

    // Get composed meals for each day
    const daysWithMeals = await Promise.all(
      days.map(async (day) => {
        const meals = await db
          .select()
          .from(mealPlanDayMeal)
          .where(eq(mealPlanDayMeal.mealPlanDayId, day.id));

        // Get ingredients for each meal
        const mealsWithIngredients = await Promise.all(
          meals.map(async (meal) => {
            const ingredients = await db
              .select({
                id: mealPlanDayMealIngredient.id,
                quantity: mealPlanDayMealIngredient.quantity,
                preparationNote: mealPlanDayMealIngredient.preparationNote,
                ingredient: {
                  id: ingredient.id,
                  name: ingredient.name,
                  role: ingredient.role,
                  category: ingredient.category,
                  protein: ingredient.protein,
                  carbs: ingredient.carbs,
                  fat: ingredient.fat,
                  sugar: ingredient.sugar,
                  fiber: ingredient.fiber,
                  kcal: ingredient.kcal,
                  servingSizeG: ingredient.servingSizeG,
                  servingLabel: ingredient.servingLabel,
                },
              })
              .from(mealPlanDayMealIngredient)
              .leftJoin(
                ingredient,
                eq(mealPlanDayMealIngredient.ingredientId, ingredient.id)
              )
              .where(eq(mealPlanDayMealIngredient.mealId, meal.id));

            // Calculate macros for each ingredient based on quantity
            const ingredientsWithMacros = ingredients.map((item) => {
              if (item.ingredient) {
                const multiplier = item.quantity / item.ingredient.servingSizeG;
                const protein = item.ingredient.protein * multiplier;
                const carbs = item.ingredient.carbs * multiplier;
                const fat = item.ingredient.fat * multiplier;
                // Prefer scaling kcal directly from per-serving kcal to avoid rounding differences
                const kcal = item.ingredient.kcal * multiplier;

                return {
                  ...item,
                  calculatedMacros: {
                    protein,
                    carbs,
                    fat,
                    kcal,
                  },
                };
              }
              return item;
            });

            return {
              ...meal,
              ingredients: ingredientsWithMacros,
            };
          })
        );

        return {
          ...day,
          meals: mealsWithIngredients,
        };
      })
    );

    // Get user and nutritionist info
    const [memberInfo] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, plan.userId))
      .limit(1);

    const [nutritionistInfo] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, plan.nutritionistId))
      .limit(1);

    return NextResponse.json({
      ...plan,
      member: memberInfo,
      nutritionist: nutritionistInfo,
      days: daysWithMeals,
    });
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plan" },
      { status: 500 }
    );
  }
}

// PATCH update meal plan status or details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, status, notes } = body;

    // Get meal plan to check permissions
    const [plan] = await db
      .select()
      .from(mealPlan)
      .where(eq(mealPlan.id, id))
      .limit(1);

    if (!plan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }

    // Only nutritionist who created it or admin can update
    if (
      plan.nutritionistId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Only the nutritionist who created this plan can update it" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const [updatedPlan] = await db
      .update(mealPlan)
      .set(updateData)
      .where(eq(mealPlan.id, id))
      .returning();

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error updating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to update meal plan" },
      { status: 500 }
    );
  }
}

// DELETE meal plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get meal plan to check permissions
    const [plan] = await db
      .select()
      .from(mealPlan)
      .where(eq(mealPlan.id, id))
      .limit(1);

    if (!plan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }

    // Only nutritionist who created it or admin can delete
    if (
      plan.nutritionistId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Only the nutritionist who created this plan can delete it" },
        { status: 403 }
      );
    }

    await db.delete(mealPlan).where(eq(mealPlan.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    return NextResponse.json(
      { error: "Failed to delete meal plan" },
      { status: 500 }
    );
  }
}

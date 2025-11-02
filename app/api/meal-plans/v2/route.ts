import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { 
  mealPlan, 
  mealPlanDay, 
  mealPlanDayMeal, 
  mealPlanDayMealIngredient,
  ingredient
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || (session.user.role !== "nutritionist" && session.user.role !== "admin")) {
      return NextResponse.json(
        { error: "Unauthorized - nutritionist access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, name, description, startDate, status, days } = body;

    // Validation
    if (!userId || !name || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields: userId, name, startDate" },
        { status: 400 }
      );
    }

    if (!Array.isArray(days) || days.length !== 7) {
      return NextResponse.json(
        { error: "Must provide exactly 7 days" },
        { status: 400 }
      );
    }

    // Validate meals structure
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const day = days[dayIndex];
      
      if (!Array.isArray(day.meals)) {
        return NextResponse.json(
          { error: `Day ${dayIndex + 1}: meals must be an array` },
          { status: 400 }
        );
      }

      for (let mealIndex = 0; mealIndex < day.meals.length; mealIndex++) {
        const meal = day.meals[mealIndex];

        if (!meal.mealName || !meal.mealType) {
          return NextResponse.json(
            { error: `Day ${dayIndex + 1}, Meal ${mealIndex + 1}: mealName and mealType required` },
            { status: 400 }
          );
        }

        if (!Array.isArray(meal.ingredients) || meal.ingredients.length === 0) {
          return NextResponse.json(
            { error: `Day ${dayIndex + 1}, Meal ${mealIndex + 1}: must have at least one ingredient` },
            { status: 400 }
          );
        }

        for (let ingIndex = 0; ingIndex < meal.ingredients.length; ingIndex++) {
          const ingredient = meal.ingredients[ingIndex];
          
          if (!ingredient.ingredientId || !ingredient.quantity) {
            return NextResponse.json(
              { 
                error: `Day ${dayIndex + 1}, Meal ${mealIndex + 1}, Ingredient ${ingIndex + 1}: ingredientId and quantity required` 
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Create meal plan
    const planStartDate = new Date(startDate);
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planEndDate.getDate() + 6); // 7-day plan

    const [plan] = await db
      .insert(mealPlan)
      .values({
        userId,
        name,
        description: description || null,
        startDate: planStartDate,
        endDate: planEndDate,
        status: status || "draft",
        nutritionistId: session.user.id,
        createdAt: new Date(),
      })
      .returning();

    // Create days and meals
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayData = days[dayIndex];
      
      const dayDate = new Date(planStartDate);
      dayDate.setDate(dayDate.getDate() + dayIndex);

      const [planDay] = await db
        .insert(mealPlanDay)
        .values({
          mealPlanId: plan.id,
          dayNumber: dayIndex + 1,
          date: dayDate,
          notes: dayData.notes || null,
          createdAt: new Date(),
        })
        .returning();

      // Create meals for this day
      for (const mealData of dayData.meals) {
        const [meal] = await db
          .insert(mealPlanDayMeal)
          .values({
            mealPlanDayId: planDay.id,
            mealType: mealData.mealType,
            mealName: mealData.mealName,
            notes: mealData.notes || null,
            createdAt: new Date(),
          })
          .returning();

        // Add ingredients to this meal
        const ingredientValues = mealData.ingredients.map((ing: any) => ({
          mealId: meal.id,
          ingredientId: ing.ingredientId,
          quantity: parseFloat(ing.quantity),
          preparationNote: ing.preparationNote || null,
          createdAt: new Date(),
        }));

        await db.insert(mealPlanDayMealIngredient).values(ingredientValues);
      }
    }

    return NextResponse.json({
      success: true,
      mealPlanId: plan.id,
      message: "Meal plan created successfully with composed meals",
    });

  } catch (error) {
    console.error("Error creating meal plan v2:", error);
    return NextResponse.json(
      { error: "Failed to create meal plan", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("id");

    if (!planId) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    // Fetch meal plan with nested structure
    const [plan] = await db
      .select()
      .from(mealPlan)
      .where(eq(mealPlan.id, planId))
      .limit(1);

    if (!plan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }

    // Check authorization
    const isNutritionist = session.user.role === "nutritionist" || session.user.role === "admin";
    const isOwner = plan.userId === session.user.id;

    if (!isNutritionist && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch days
    const planDays = await db
      .select()
      .from(mealPlanDay)
      .where(eq(mealPlanDay.mealPlanId, planId))
      .orderBy(mealPlanDay.dayNumber);

    // Fetch meals for all days
    const daysWithMeals = await Promise.all(
      planDays.map(async (day) => {
        const meals = await db
          .select()
          .from(mealPlanDayMeal)
          .where(eq(mealPlanDayMeal.mealPlanDayId, day.id));

        // Fetch ingredients for each meal
        const mealsWithIngredients = await Promise.all(
          meals.map(async (meal) => {
            const ingredients = await db
              .select({
                id: mealPlanDayMealIngredient.id,
                ingredientId: mealPlanDayMealIngredient.ingredientId,
                quantity: mealPlanDayMealIngredient.quantity,
                preparationNote: mealPlanDayMealIngredient.preparationNote,
                ingredient: {
                  name: ingredient.name,
                  type: ingredient.type,
                  protein: ingredient.protein,
                  carbs: ingredient.carbs,
                  fat: ingredient.fat,
                  servingSize: ingredient.servingSize,
                  unit: ingredient.unit,
                },
              })
              .from(mealPlanDayMealIngredient)
              .leftJoin(ingredient, eq(ingredient.id, mealPlanDayMealIngredient.ingredientId))
              .where(eq(mealPlanDayMealIngredient.mealId, meal.id));

            return {
              ...meal,
              ingredients,
            };
          })
        );

        return {
          ...day,
          meals: mealsWithIngredients,
        };
      })
    );

    return NextResponse.json({
      plan,
      days: daysWithMeals,
    });

  } catch (error) {
    console.error("Error fetching meal plan v2:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plan" },
      { status: 500 }
    );
  }
}

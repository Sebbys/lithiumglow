import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { mealPlan, mealPlanDay, mealPlanDayMeal, mealPlanDayMealIngredient, user, ingredient } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

// GET all meal plans (nutritionist sees all their created plans, members see their own)
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let plans;
    if (session.user.role === "nutritionist" || session.user.role === "admin") {
      // Nutritionists see all plans they created
      plans = await db
        .select({
          mealPlan: mealPlan,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(mealPlan)
        .leftJoin(user, eq(mealPlan.userId, user.id))
        .where(eq(mealPlan.nutritionistId, session.user.id))
        .orderBy(desc(mealPlan.createdAt));
    } else {
      // Members see only their own plans
      plans = await db
        .select({
          mealPlan: mealPlan,
          nutritionist: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(mealPlan)
        .leftJoin(user, eq(mealPlan.nutritionistId, user.id))
        .where(eq(mealPlan.userId, session.user.id))
        .orderBy(desc(mealPlan.createdAt));
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plans" },
      { status: 500 }
    );
  }
}

// POST create new meal plan with 7 days
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only nutritionists and admins can create meal plans
    if (session.user.role !== "nutritionist" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only nutritionists can create meal plans" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, userId, startDate, notes, days } = body;

    // Validate required fields
    if (!name || !userId || !startDate) {
      return NextResponse.json(
        { error: "Name, userId, and startDate are required" },
        { status: 400 }
      );
    }

    // Calculate end date (7 days from start)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // 7 days total

    // Create meal plan
    const [newMealPlan] = await db
      .insert(mealPlan)
      .values({
        name,
        description: description || null,
        userId,
        nutritionistId: session.user.id,
        startDate: start,
        endDate: end,
        notes: notes || null,
        status: "draft",
      })
      .returning();

    // Create 7 days if provided
    if (days && Array.isArray(days)) {
      for (let i = 0; i < Math.min(days.length, 7); i++) {
        const dayDate = new Date(start);
        dayDate.setDate(dayDate.getDate() + i);

        const [newDay] = await db
          .insert(mealPlanDay)
          .values({
            mealPlanId: newMealPlan.id,
            dayNumber: i + 1,
            date: dayDate,
            notes: days[i].notes || null,
          })
          .returning();

        // Add composed meals
        if (days[i].meals && Array.isArray(days[i].meals)) {
          for (const mealData of days[i].meals) {
            if (mealData.mealName && mealData.mealType && mealData.ingredients?.length > 0) {
              const [newMeal] = await db.insert(mealPlanDayMeal).values({
                mealPlanDayId: newDay.id,
                mealType: mealData.mealType,
                mealName: mealData.mealName,
                notes: mealData.notes || null,
              }).returning();

              // Add ingredients to the meal
              const ingredientValues = mealData.ingredients.map((ing: any) => ({
                mealId: newMeal.id,
                ingredientId: ing.ingredientId,
                quantity: parseFloat(ing.quantity),
                preparationNote: ing.preparationNote || null,
              }));

              await db.insert(mealPlanDayMealIngredient).values(ingredientValues);
            }
          }
        }
      }
    }

    return NextResponse.json(newMealPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to create meal plan" },
      { status: 500 }
    );
  }
}

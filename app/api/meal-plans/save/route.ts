import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { mealPlan, mealPlanDay, mealPlanDayMeal, mealPlanDayMealIngredient, ingredient as ingredientTable, user as userTable } from "@/db/schema";
import { getUser } from "@/lib/auth-utils";

// Expected payload shape (minimal):
// {
//   name?: string,
//   notes?: string,
//   startDate?: string, // ISO; defaults to today
//   days: Array<{
//     day: number,
//     meals: {
//       breakfast: { names: string[] },
//       lunch: { names: string[] },
//       dinner: { names: string[] }
//     }
//   }>
// }

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: enforce member role, but allow nutritionist/admin too
    const allowedRoles = new Set(["member", "nutritionist", "admin"]);
    if (!allowedRoles.has((user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, notes, startDate, days } = body || {};

    if (!Array.isArray(days) || days.length === 0) {
      return NextResponse.json({ error: "days array is required" }, { status: 400 });
    }

    const planName = name || `Weekly Plan ${new Date().toISOString().slice(0, 10)}`;
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + (days.length - 1));

    // Load ingredients once and map by lowercase name
    const allIngredients = await db.select().from(ingredientTable);
    const byName = new Map<string, (typeof allIngredients)[number]>();
    for (const ing of allIngredients) byName.set((ing.name || "").toLowerCase(), ing);

    const missing: string[] = [];

    const result = await db.transaction(async (tx) => {
      const [mp] = await tx.insert(mealPlan).values({
        name: planName,
        description: notes || null,
        userId: user.id,
        nutritionistId: user.id, // Assumption: self-authored plan; adjust if a separate nutritionist exists
        startDate: start,
        endDate: end,
        status: "active",
        notes: notes || null,
      }).returning();

      for (const d of days) {
        const dayNumber = d.day;
        const date = new Date(start);
        date.setDate(start.getDate() + (dayNumber - 1));

        const [mpd] = await tx.insert(mealPlanDay).values({
          mealPlanId: mp.id,
          dayNumber,
          date,
          notes: null,
        }).returning();

        const slots = ["breakfast", "lunch", "dinner"] as const;
        for (const slot of slots) {
          const meal = d.meals?.[slot];
          if (!meal) continue;
          const names: string[] = Array.isArray(meal.names) ? meal.names : [];
          const mealName = names.join(", ");

          const [mpm] = await tx.insert(mealPlanDayMeal).values({
            mealPlanDayId: mpd.id,
            mealType: slot,
            mealName: mealName || `${String(slot)} composed meal`,
            notes: null,
          }).returning();

          for (const nm of names) {
            const ing = byName.get((nm || "").toLowerCase());
            if (!ing) {
              missing.push(nm);
              continue;
            }
            await tx.insert(mealPlanDayMealIngredient).values({
              mealId: mpm.id,
              ingredientId: ing.id,
              quantity: 1.0, // Assumption: 1 serving; adjust later if quantities are introduced
              preparationNote: null,
            });
          }
        }
      }

      return mp.id;
    });

    return NextResponse.json({ mealPlanId: result, missing }, { status: 201 });
  } catch (err) {
    console.error("Error saving meal plan:", err);
    return NextResponse.json({ error: "Failed to save meal plan" }, { status: 500 });
  }
}

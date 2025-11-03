import { db } from "@/db/drizzle";
import { ingredient } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unstable_noStore } from "next/cache";
import { randomUUID } from "crypto";

// Only for admin use
export async function POST(request: NextRequest) {
  unstable_noStore();

  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body as { action?: string };

    if (action === "clear") {
      // Delete all existing ingredients (will fail if referenced by FK with RESTRICT)
      try {
        await db.delete(ingredient);
        return NextResponse.json({ message: "✅ All ingredients cleared" });
      } catch (e) {
        return NextResponse.json(
          { error: "Failed to clear ingredients. Ensure no meal plans reference them.", details: (e as Error).message },
          { status: 400 }
        );
      }
    }

    if (action === "upsert") {
      const ingredientData: any[] = Array.isArray(body.ingredients)
        ? body.ingredients
        : [];

      let inserted = 0;
      let updated = 0;
      const errors: Array<{ name: string; error: string }> = [];

      for (const raw of ingredientData) {
        try {
          const name: string = (raw.name || "").trim();
          if (!name) {
            errors.push({ name: String(raw.name ?? ""), error: "Missing name" });
            continue;
          }

          const role: string = raw.role || raw.ingredient_role || "other";
          const category: string = raw.category || inferCategoryFromRole(role) || "other";

          const protein = num(raw.protein, 0);
          const carbs = num(raw.carbs, 0);
          const fat = num(raw.fat, 0);
          const sugar = num(raw.sugar, 0);
          const fiber = num(raw.fiber, 0);
          const kcal = num(raw.kcal, protein * 4 + carbs * 4 + fat * 9);

          const servingSizeG = num(raw.servingSizeG, 100);
          const servingLabel: string = raw.servingLabel || `${servingSizeG}g`;
          const pricePerServing = num(raw.pricePerServing, 0);

          const mealTypes: string[] = arr(raw.mealTypes);
          const cuisine: string[] = arr(raw.cuisine, ["universal"]);
          const dietTags: string[] = arr(raw.dietTags);
          const allergens: string[] = arr(raw.allergens);

          const status: string = raw.status || "active";

          // Upsert by name (first match)
          const existing = await db
            .select({ id: ingredient.id })
            .from(ingredient)
            .where(eq(ingredient.name, name))
            .limit(1);

          const values = {
            id: existing[0]?.id || randomUUID(),
            name,
            role,
            category,
            protein,
            carbs,
            fat,
            sugar,
            fiber,
            kcal,
            servingSizeG,
            servingLabel,
            pricePerServing,
            mealTypes,
            cuisine,
            dietTags,
            allergens,
            status,
          } as typeof ingredient.$inferInsert;

          if (existing.length > 0) {
            await db
              .update(ingredient)
              .set(values)
              .where(eq(ingredient.id, existing[0].id));
            updated++;
          } else {
            await db.insert(ingredient).values(values);
            inserted++;
          }
        } catch (e) {
          errors.push({ name: String(raw?.name ?? ""), error: (e as Error).message });
        }
      }

      return NextResponse.json({
        message: `✅ Upsert completed: ${inserted} inserted, ${updated} updated${errors.length ? ", with errors" : ""}.`,
        inserted,
        updated,
        errors: errors.length ? errors : undefined,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in ingredient upsert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helpers
function num(v: any, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function arr(v: any, fallback: string[] = []): string[] {
  if (!v) return fallback;
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {}
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return fallback;
}

function inferCategoryFromRole(role: string): string {
  const r = (role || "").toLowerCase();
  if (r.includes("protein")) return "protein";
  if (r.includes("carb")) return "carb";
  if (r.includes("leafy") || r.includes("veggie") || r.includes("vegetable")) return "veggie";
  if (r.includes("fat")) return "fat";
  if (r.includes("dressing") || r.includes("sauce")) return "dressing";
  if (r.includes("topping") || r.includes("garnish")) return "topping";
  return "other";
}

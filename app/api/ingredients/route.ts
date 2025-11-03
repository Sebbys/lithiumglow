import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { ingredient } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET all ingredients
export async function GET() {
  try {
    const ingredients = await db
      .select()
      .from(ingredient)
      .orderBy(desc(ingredient.createdAt));

    // Calculate kcal for each ingredient
    const ingredientsWithKcal = ingredients.map((ing) => ({
      ...ing,
      kcal: ing.protein * 4 + ing.carbs * 4 + ing.fat * 9,
    }));

    return NextResponse.json(ingredientsWithKcal);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

// POST create new ingredient
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is nutritionist or admin
    if (session.user.role !== "nutritionist" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only nutritionists and admins can create ingredients" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name: string = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Macros
    const protein = toNum(body.protein, 0);
    const carbs = toNum(body.carbs, 0);
    const fat = toNum(body.fat, 0);
    const sugar = toNum(body.sugar, 0);
    const fiber = toNum(body.fiber, 0);
    const kcal = toNum(body.kcal, protein * 4 + carbs * 4 + fat * 9);

    // Serving and pricing
    const servingSizeG = toNum(body.servingSizeG, 100);
    const servingLabel: string = body.servingLabel || `${servingSizeG}g`;
    const pricePerServing = Math.max(0, Math.round(toNum(body.pricePerServing, 0)));

    // Classification & tags
    const role: string = body.role || body.ingredient_role || "other";
    const category: string = body.category || inferCategoryFromRole(role) || "other";
    const mealTypes: string[] = toArr(body.mealTypes);
    const cuisine: string[] = toArr(body.cuisine, ["universal"]);
    const dietTags: string[] = toArr(body.dietTags);
    const allergens: string[] = toArr(body.allergens);
    const status: string = body.status || "active";

    const [newIngredient] = await db
      .insert(ingredient)
      .values({
        id: randomUUID(),
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
      })
      .returning();

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to create ingredient" },
      { status: 500 }
    );
  }
}

// Helpers
function toNum(v: any, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function toArr(v: any, fallback: string[] = []): string[] {
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

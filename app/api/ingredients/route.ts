import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { ingredient } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

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
    const { name, description, protein, carbs, fat, servingSize, unit } = body;

    // Validate required fields
    if (!name || protein === undefined || carbs === undefined || fat === undefined) {
      return NextResponse.json(
        { error: "Name, protein, carbs, and fat are required" },
        { status: 400 }
      );
    }

    const [newIngredient] = await db
      .insert(ingredient)
      .values({
        name,
        description: description || null,
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        servingSize: servingSize ? parseFloat(servingSize) : 100,
        unit: unit || "g",
        createdBy: session.user.id,
      })
      .returning();

    // Calculate kcal
    const ingredientWithKcal = {
      ...newIngredient,
      kcal: newIngredient.protein * 4 + newIngredient.carbs * 4 + newIngredient.fat * 9,
    };

    return NextResponse.json(ingredientWithKcal, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to create ingredient" },
      { status: 500 }
    );
  }
}

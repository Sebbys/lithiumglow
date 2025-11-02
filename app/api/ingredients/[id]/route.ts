import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { ingredient } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

// GET single ingredient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [ingredientData] = await db
      .select()
      .from(ingredient)
      .where(eq(ingredient.id, id))
      .limit(1);

    if (!ingredientData) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Calculate kcal
    const ingredientWithKcal = {
      ...ingredientData,
      kcal: ingredientData.protein * 4 + ingredientData.carbs * 4 + ingredientData.fat * 9,
    };

    return NextResponse.json(ingredientWithKcal);
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredient" },
      { status: 500 }
    );
  }
}

// PATCH update ingredient
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

    // Check if user is nutritionist or admin
    if (session.user.role !== "nutritionist" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only nutritionists and admins can update ingredients" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, protein, carbs, fat, servingSize, unit } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (protein !== undefined) updateData.protein = parseFloat(protein);
    if (carbs !== undefined) updateData.carbs = parseFloat(carbs);
    if (fat !== undefined) updateData.fat = parseFloat(fat);
    if (servingSize !== undefined) updateData.servingSize = parseFloat(servingSize);
    if (unit !== undefined) updateData.unit = unit;

    const [updatedIngredient] = await db
      .update(ingredient)
      .set(updateData)
      .where(eq(ingredient.id, id))
      .returning();

    if (!updatedIngredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Calculate kcal
    const ingredientWithKcal = {
      ...updatedIngredient,
      kcal: updatedIngredient.protein * 4 + updatedIngredient.carbs * 4 + updatedIngredient.fat * 9,
    };

    return NextResponse.json(ingredientWithKcal);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to update ingredient" },
      { status: 500 }
    );
  }
}

// DELETE ingredient
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

    // Check if user is nutritionist or admin
    if (session.user.role !== "nutritionist" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only nutritionists and admins can delete ingredients" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await db.delete(ingredient).where(eq(ingredient.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return NextResponse.json(
      { error: "Failed to delete ingredient" },
      { status: 500 }
    );
  }
}

import { db } from "@/db/drizzle";
import { ingredient, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unstable_noStore } from "next/cache";

// Only for admin use
export async function POST(request: NextRequest) {
  unstable_noStore();

  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "clear") {
      // Delete all existing ingredients
      await db.delete(ingredient);
      return NextResponse.json({ message: "✅ All ingredients cleared" });
    }

    if (action === "upsert") {
      // Get admin user for createdBy
      const adminUsers = await db
        .select()
        .from(user)
        .where(eq(user.role, "admin"))
        .limit(1);

      const createdById = adminUsers[0]?.id || session.user.id;

      const ingredientData = body.ingredients || [];

      const typeMap: Record<string, "protein" | "carbs" | "vegetables" | "fruits" | "fats" | "dairy" | "legumes" | "dressing" | "other"> = {
        protein: "protein",
        carbs: "carbs",
        vegetables: "vegetables",
        fruits: "fruits",
        fat: "fats",
        fats: "fats",
        dairy: "dairy",
        legumes: "legumes",
        dressing: "dressing",
        fermented: "dressing",
        topping: "other",
      };

      let inserted = 0;
      for (const ing of ingredientData) {
        const type = typeMap[ing.category] || "other";

        await db
          .insert(ingredient)
          .values({
            name: ing.name,
            description: `${ing.ingredient_role} - ${ing.cuisine?.join(", ") || ""}`,
            type,
            protein: ing.protein || 0,
            carbs: ing.carbs || 0,
            fat: ing.fat || 0,
            servingSize: 100,
            unit: "g",
            createdBy: createdById,
          })
          .catch((err) => {
            console.error(`Failed to insert ${ing.name}:`, err);
          });

        inserted++;
      }

      return NextResponse.json({
        message: `✅ Successfully upserted ${inserted} ingredients!`,
        count: inserted,
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

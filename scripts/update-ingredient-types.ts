import { db } from "@/db/drizzle";
import { ingredient } from "@/db/schema";
import { eq } from "drizzle-orm";

const ingredientTypeMapping: Record<string, "protein" | "carbs" | "vegetables" | "fruits" | "fats" | "dairy" | "legumes" | "dressing"> = {
  // Proteins
  "Chicken Breast": "protein",
  "Salmon Fillet": "protein",
  "Eggs": "protein",
  "Tofu": "protein",
  
  // Dairy
  "Greek Yogurt": "dairy",
  "Milk": "dairy",
  "Almond Milk": "dairy",
  "Cottage Cheese": "dairy",
  
  // Carbs
  "Brown Rice": "carbs",
  "Sweet Potato": "carbs",
  "Oatmeal": "carbs",
  "Quinoa": "carbs",
  "Whole Wheat Bread": "carbs",
  
  // Vegetables
  "Broccoli": "vegetables",
  "Spinach": "vegetables",
  "Kale": "vegetables",
  "Bell Peppers": "vegetables",
  "Carrots": "vegetables",
  
  // Fruits
  "Banana": "fruits",
  "Apple": "fruits",
  "Blueberries": "fruits",
  "Strawberries": "fruits",
  "Avocado": "fats", // Avocado is technically a fruit but better categorized as fat
  
  // Fats
  "Almonds": "fats",
  "Walnuts": "fats",
  "Peanut Butter": "fats",
  
  // Dressing
  "Olive Oil": "dressing",
  
  // Legumes
  "Black Beans": "legumes",
  "Chickpeas": "legumes",
  "Lentils": "legumes",
};

async function updateIngredientTypes() {
  console.log("Starting ingredient type update...");

  try {
    const allIngredients = await db.select().from(ingredient);
    console.log(`Found ${allIngredients.length} ingredients`);

    let updated = 0;
    for (const ing of allIngredients) {
      const type = ingredientTypeMapping[ing.name];
      if (type) {
        await db
          .update(ingredient)
          .set({ type })
          .where(eq(ingredient.id, ing.id));
        console.log(`✓ Updated ${ing.name} -> ${type}`);
        updated++;
      } else {
        console.log(`⚠️  No type mapping for: ${ing.name} (keeping as 'other')`);
      }
    }

    console.log(`\n✅ Successfully updated ${updated} ingredients!`);
  } catch (error) {
    console.error("❌ Error updating ingredient types:", error);
    process.exit(1);
  }
}

updateIngredientTypes();

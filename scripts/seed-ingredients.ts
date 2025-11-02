import { db } from "@/db/drizzle";
import { ingredient, user } from "@/db/schema";
import { eq, or } from "drizzle-orm";

const ingredientsData = [
  // Proteins
  {
    name: "Chicken Breast",
    description: "Lean protein source, boneless skinless chicken breast",
    type: "protein" as const,
    protein: 31.0,
    carbs: 0.0,
    fat: 3.6,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Salmon Fillet",
    description: "Rich in omega-3 fatty acids, wild-caught salmon",
    type: "protein" as const,
    protein: 20.0,
    carbs: 0.0,
    fat: 13.0,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Eggs",
    description: "Whole eggs, excellent source of complete protein",
    type: "protein" as const,
    protein: 13.0,
    carbs: 1.1,
    fat: 11.0,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Greek Yogurt",
    description: "Low-fat Greek yogurt, high in protein",
    type: "dairy" as const,
    protein: 10.0,
    carbs: 3.6,
    fat: 0.4,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Tofu",
    description: "Firm tofu, plant-based protein",
    type: "protein" as const,
    protein: 8.0,
    carbs: 1.9,
    fat: 4.8,
    servingSize: 100,
    unit: "g",
  },

  // Carbohydrates
  {
    name: "Brown Rice",
    description: "Cooked brown rice, whole grain",
    type: "carbs" as const,
    protein: 2.6,
    carbs: 23.0,
    fat: 0.9,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Sweet Potato",
    description: "Baked sweet potato with skin",
    type: "carbs" as const,
    protein: 2.0,
    carbs: 20.0,
    fat: 0.2,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Oatmeal",
    description: "Rolled oats, cooked",
    type: "carbs" as const,
    protein: 2.4,
    carbs: 12.0,
    fat: 1.4,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Quinoa",
    description: "Cooked quinoa, complete protein grain",
    type: "carbs" as const,
    protein: 4.4,
    carbs: 21.3,
    fat: 1.9,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Whole Wheat Bread",
    description: "Whole grain bread slice",
    type: "carbs" as const,
    protein: 9.0,
    carbs: 41.0,
    fat: 3.4,
    servingSize: 100,
    unit: "g",
  },

  // Vegetables
  {
    name: "Broccoli",
    description: "Steamed broccoli florets",
    type: "vegetables" as const,
    protein: 2.8,
    carbs: 7.0,
    fat: 0.4,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Spinach",
    description: "Fresh raw spinach leaves",
    type: "vegetables" as const,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Kale",
    description: "Raw kale leaves, nutrient dense",
    type: "vegetables" as const,
    protein: 4.3,
    carbs: 8.8,
    fat: 0.9,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Bell Peppers",
    description: "Mixed color bell peppers",
    type: "vegetables" as const,
    protein: 1.0,
    carbs: 6.0,
    fat: 0.3,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Carrots",
    description: "Raw carrots",
    type: "vegetables" as const,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    servingSize: 100,
    unit: "g",
  },

  // Fruits
  {
    name: "Banana",
    description: "Fresh banana, energy-rich fruit",
    type: "fruits" as const,
    protein: 1.1,
    carbs: 23.0,
    fat: 0.3,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Apple",
    description: "Fresh apple with skin",
    type: "fruits" as const,
    protein: 0.3,
    carbs: 14.0,
    fat: 0.2,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Blueberries",
    description: "Fresh blueberries, antioxidant-rich",
    type: "fruits" as const,
    protein: 0.7,
    carbs: 14.5,
    fat: 0.3,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Strawberries",
    description: "Fresh strawberries",
    type: "fruits" as const,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Avocado",
    description: "Fresh avocado, healthy fats",
    type: "fats" as const,
    protein: 2.0,
    carbs: 9.0,
    fat: 15.0,
    servingSize: 100,
    unit: "g",
  },

  // Healthy Fats
  {
    name: "Almonds",
    description: "Raw almonds, nutrient dense nuts",
    type: "fats" as const,
    protein: 21.0,
    carbs: 22.0,
    fat: 49.0,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Walnuts",
    description: "Raw walnuts, omega-3 rich",
    type: "fats" as const,
    protein: 15.0,
    carbs: 14.0,
    fat: 65.0,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Olive Oil",
    description: "Extra virgin olive oil",
    type: "dressing" as const,
    protein: 0.0,
    carbs: 0.0,
    fat: 100.0,
    servingSize: 15,
    unit: "ml",
  },
  {
    name: "Peanut Butter",
    description: "Natural peanut butter, no added sugar",
    type: "fats" as const,
    protein: 25.0,
    carbs: 20.0,
    fat: 50.0,
    servingSize: 100,
    unit: "g",
  },

  // Dairy & Alternatives
  {
    name: "Milk",
    description: "Low-fat cow milk",
    type: "dairy" as const,
    protein: 3.4,
    carbs: 5.0,
    fat: 1.0,
    servingSize: 100,
    unit: "ml",
  },
  {
    name: "Almond Milk",
    description: "Unsweetened almond milk",
    type: "dairy" as const,
    protein: 0.5,
    carbs: 0.5,
    fat: 1.1,
    servingSize: 100,
    unit: "ml",
  },
  {
    name: "Cottage Cheese",
    description: "Low-fat cottage cheese",
    type: "dairy" as const,
    protein: 11.0,
    carbs: 3.4,
    fat: 4.3,
    servingSize: 100,
    unit: "g",
  },

  // Legumes
  {
    name: "Black Beans",
    description: "Cooked black beans",
    type: "legumes" as const,
    protein: 8.9,
    carbs: 23.7,
    fat: 0.5,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Chickpeas",
    description: "Cooked chickpeas (garbanzo beans)",
    type: "legumes" as const,
    protein: 8.9,
    carbs: 27.4,
    fat: 2.6,
    servingSize: 100,
    unit: "g",
  },
  {
    name: "Lentils",
    description: "Cooked lentils, fiber-rich",
    type: "legumes" as const,
    protein: 9.0,
    carbs: 20.0,
    fat: 0.4,
    servingSize: 100,
    unit: "g",
  },
];

async function seedIngredients() {
  console.log("Starting ingredient seeding...");

  try {
    // Find a nutritionist or admin user
    const [nutritionistUser] = await db
      .select()
      .from(user)
      .where(or(eq(user.role, "nutritionist"), eq(user.role, "admin")))
      .limit(1);

    if (!nutritionistUser) {
      console.error(
        "❌ No nutritionist or admin user found. Please create one first."
      );
      process.exit(1);
    }

    console.log(`✓ Found user: ${nutritionistUser.name} (${nutritionistUser.role})`);

    // Check if ingredients already exist
    const existingIngredients = await db.select().from(ingredient).limit(1);

    if (existingIngredients.length > 0) {
      console.log("⚠️  Ingredients already exist. Skipping seed...");
      console.log(
        "   To re-seed, delete existing ingredients from the database first."
      );
      process.exit(0);
    }

    // Insert all ingredients
    let successCount = 0;
    for (const ingredientData of ingredientsData) {
      try {
        await db.insert(ingredient).values({
          ...ingredientData,
          createdBy: nutritionistUser.id,
        });
        successCount++;
        console.log(`✓ Added: ${ingredientData.name}`);
      } catch (error) {
        console.error(`✗ Failed to add ${ingredientData.name}:`, error);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Successfully seeded ${successCount} ingredients!`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error seeding ingredients:", error);
    process.exit(1);
  }
}

seedIngredients()
  .then(() => {
    console.log("✓ Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

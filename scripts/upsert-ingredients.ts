import { db } from "@/db/drizzle";
import { ingredient, user } from "@/db/schema";
import { eq } from "drizzle-orm";

// First, get a system user or admin for createdBy field
async function getSystemUser() {
  const adminUser = await db
    .select()
    .from(user)
    .where(eq(user.role, "admin"))
    .limit(1);

  if (adminUser.length > 0) {
    return adminUser[0].id;
  }

  // Fallback: create a system user
  const [newUser] = await db
    .insert(user)
    .values({
      name: "System",
      email: "system@omni.local",
      role: "admin",
    })
    .returning();

  return newUser.id;
}

// Parse ingredient data
interface IngredientData {
  name: string;
  price: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  category: string;
  ingredient_role: string;
  meal_types: string[];
  cuisine: string[];
  diet_tags: string[];
  allergens: string[];
}

const ingredientData: IngredientData[] = [
  // PROTEINS
  { name: "Premium NZ tenderloin steak - grass-fed (100g)", price: 140.0, protein: 28.0, carbs: 0.0, fat: 4.5, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["dinner"], cuisine: ["western","american"], diet_tags: ["omnivore"], allergens: [] },
  { name: "Premium NZ sirloin steak - grass-fed (100g)", price: 80.0, protein: 27.0, carbs: 0.0, fat: 9.0, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["dinner"], cuisine: ["western","american"], diet_tags: ["omnivore"], allergens: [] },
  { name: "Premium grass-fed beef patty - inc nutrient dense organs (100g)", price: 60.0, protein: 19.1, carbs: 5.23, fat: 19.85, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["western","american"], diet_tags: ["omnivore"], allergens: [] },
  { name: "Sous vide chicken breast (100g)", price: 40.0, protein: 31.0, carbs: 0.0, fat: 3.6, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore"], allergens: [] },
  { name: "Grilled chicken breast (100g)", price: 40.0, protein: 31.0, carbs: 0.0, fat: 4.5, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore"], allergens: [] },
  { name: "Grilled chicken thigh (100g)", price: 35.0, protein: 19.0, carbs: 0.0, fat: 5.0, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore"], allergens: [] },
  { name: "Grilled salmon fillet (100g)", price: 100.0, protein: 20.0, carbs: 0.0, fat: 13.0, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["western","japanese","mediterranean"], diet_tags: ["omnivore","pescatarian"], allergens: ["fish"] },
  { name: "Sustainable line caught yellow fin tuna (100g)", price: 60.0, protein: 24.0, carbs: 0.0, fat: 0.6, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["japanese","mediterranean","italian"], diet_tags: ["omnivore","pescatarian"], allergens: ["fish"] },
  { name: "Grilled barramundi (100g)", price: 55.0, protein: 23.3, carbs: 0.0, fat: 2.2, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["western","asian","mediterranean"], diet_tags: ["omnivore","pescatarian"], allergens: ["fish"] },
  { name: "Grilled tiger prawns (100g)", price: 65.0, protein: 23.3, carbs: 0.2, fat: 0.9, sugar: 0, fiber: 0, category: "protein", ingredient_role: "secondary_protein", meal_types: ["lunch","dinner"], cuisine: ["asian","mediterranean","italian"], diet_tags: ["omnivore","pescatarian"], allergens: ["shellfish"] },
  { name: "Organic farmed eggs (scrambled) (100g)", price: 20.0, protein: 13.6, carbs: 1.1, fat: 10.8, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["breakfast"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegetarian"], allergens: ["egg"] },
  { name: "Spiced chickpea falafels (100g)", price: 30.0, protein: 7.1, carbs: 25.8, fat: 17.9, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","middle_eastern"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Cottage cheese (100g)", price: 55.0, protein: 11.0, carbs: 3.4, fat: 4.3, sugar: 3.0, fiber: 0, category: "protein", ingredient_role: "secondary_protein", meal_types: ["breakfast"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegetarian"], allergens: ["dairy"] },
  { name: "BBQ tempeh (100g)", price: 15.0, protein: 19.0, carbs: 9.5, fat: 11.0, sugar: 0, fiber: 2.0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["indonesian","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["soy"] },
  { name: "Grilled halloumi (100g)", price: 55.0, protein: 22.0, carbs: 2.2, fat: 26.3, sugar: 0, fiber: 0, category: "protein", ingredient_role: "secondary_protein", meal_types: ["breakfast","lunch","dinner"], cuisine: ["mediterranean","greek"], diet_tags: ["omnivore","pescatarian","vegetarian"], allergens: ["dairy"] },
  { name: "Tofu (firm) (100g)", price: 15.0, protein: 14.0, carbs: 1.9, fat: 8.0, sugar: 0, fiber: 0, category: "protein", ingredient_role: "base_protein", meal_types: ["lunch","dinner"], cuisine: ["japanese","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["soy"] },

  // CARBS
  { name: "Baked sweet potato (100g)", price: 15.0, protein: 2.3, carbs: 17.4, fat: 7.2, sugar: 0, fiber: 1.4, category: "carbs", ingredient_role: "base_carb", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Red rice (100g)", price: 12.0, protein: 2.6, carbs: 23.0, fat: 0.9, sugar: 0, fiber: 1.4, category: "carbs", ingredient_role: "base_carb", meal_types: ["lunch","dinner"], cuisine: ["indonesian","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "White rice (100g)", price: 10.0, protein: 2.3, carbs: 28.0, fat: 0.2, sugar: 0, fiber: 0.3, category: "carbs", ingredient_role: "base_carb", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Cauliflower rice (100g)", price: 15.0, protein: 1.8, carbs: 5.4, fat: 3.0, sugar: 0, fiber: 2.4, category: "carbs", ingredient_role: "base_carb", meal_types: ["lunch","dinner"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Quinoa tabouleh (100g)", price: 25.0, protein: 2.9, carbs: 13.6, fat: 5.1, sugar: 0, fiber: 2.4, category: "carbs", ingredient_role: "base_carb", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","middle_eastern"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Quinoa (60g)", price: 15.0, protein: 8.0, carbs: 38.0, fat: 3.5, sugar: 0, fiber: 3.0, category: "carbs", ingredient_role: "base_carb", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Lentils (60g)", price: 15.0, protein: 15.0, carbs: 34.0, fat: 0.7, sugar: 0, fiber: 12.0, category: "legumes", ingredient_role: "secondary_protein", meal_types: ["lunch","dinner"], cuisine: ["indian","middle_eastern","mediterranean"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Gluten free pasta (100g)", price: 30.0, protein: 3.9, carbs: 33.5, fat: 0.5, sugar: 0, fiber: 1.5, category: "carbs", ingredient_role: "base_carb", meal_types: ["lunch","dinner"], cuisine: ["italian","mediterranean"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Soba noodles (100g)", price: 35.0, protein: 5.4, carbs: 31.3, fat: 0.7, sugar: 0, fiber: 2.0, category: "carbs", ingredient_role: "base_carb", meal_types: ["lunch","dinner"], cuisine: ["japanese","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Grilled sourdough (rye or classic) (80g)", price: 15.0, protein: 7.2, carbs: 41.4, fat: 0.8, sugar: 0, fiber: 2.4, category: "carbs", ingredient_role: "base_carb", meal_types: ["breakfast"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegetarian"], allergens: ["gluten"] },
  { name: "Super fiber flaxseed bread (80g)", price: 25.0, protein: 6.3, carbs: 10.0, fat: 20.0, sugar: 0, fiber: 3.8, category: "carbs", ingredient_role: "base_carb", meal_types: ["breakfast"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Roasted baby potatoes (100g)", price: 10.0, protein: 2.1, carbs: 20.0, fat: 5.0, sugar: 0, fiber: 2.1, category: "carbs", ingredient_role: "base_carb", meal_types: ["lunch","dinner"], cuisine: ["western","mediterranean"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Chickpeas (60g)", price: 15.0, protein: 5.1, carbs: 17.6, fat: 1.6, sugar: 0, fiber: 4.6, category: "legumes", ingredient_role: "secondary_protein", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","middle_eastern"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Oats (40g)", price: 10.0, protein: 5.3, carbs: 27.0, fat: 3.2, sugar: 0, fiber: 4.0, category: "carbs", ingredient_role: "base_carb", meal_types: ["breakfast"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },

  // VEGETABLES
  { name: "Sauteed broccoli (60g)", price: 15.0, protein: 1.7, carbs: 2.9, fat: 6.2, sugar: 0, fiber: 1.2, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Chunky avocado (60g)", price: 15.0, protein: 1.1, carbs: 5.0, fat: 12.5, sugar: 0, fiber: 3.5, category: "fats", ingredient_role: "fat_source", meal_types: ["breakfast","lunch","dinner"], cuisine: ["western","mexican","universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Sautéed garlic mushrooms (60g)", price: 10.0, protein: 2.1, carbs: 2.7, fat: 3.5, sugar: 0, fiber: 0.8, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Roasted bell peppers in extra virgin olive oil (50g)", price: 20.0, protein: 0.5, carbs: 2.8, fat: 4.3, sugar: 0, fiber: 0.9, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","italian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Romaine lettuce (20g)", price: 8.0, protein: 0.2, carbs: 0.4, fat: 0.05, sugar: 0, fiber: 0.2, category: "vegetables", ingredient_role: "leafy_green", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Shaved red cabbage (20g)", price: 5.0, protein: 0.2, carbs: 0.4, fat: 0.05, sugar: 0, fiber: 0.2, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Raw chopped Kale (15g)", price: 8.0, protein: 0.5, carbs: 1.2, fat: 0.1, sugar: 0, fiber: 0.4, category: "vegetables", ingredient_role: "leafy_green", meal_types: ["lunch","dinner"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Rucola (20g)", price: 8.0, protein: 0.5, carbs: 0.7, fat: 0.1, sugar: 0, fiber: 0.3, category: "vegetables", ingredient_role: "leafy_green", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","italian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Fresh spinach (20g)", price: 15.0, protein: 0.6, carbs: 0.8, fat: 0.1, sugar: 0, fiber: 0.5, category: "vegetables", ingredient_role: "leafy_green", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Sautéed Spinach (20g)", price: 15.0, protein: 0.8, carbs: 1.1, fat: 6.7, sugar: 0, fiber: 0.6, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Sautéed bok choy (30g)", price: 10.0, protein: 0.9, carbs: 1.0, fat: 1.0, sugar: 0, fiber: 0.3, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Sliced cucumber (40g)", price: 10.0, protein: 0.3, carbs: 1.5, fat: 0.0, sugar: 0, fiber: 0.5, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Grilled zucchini (80g)", price: 15.0, protein: 1.0, carbs: 2.8, fat: 1.0, sugar: 0, fiber: 0.8, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","italian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Grilled eggplant (80g)", price: 10.0, protein: 0.6, carbs: 4.9, fat: 1.0, sugar: 0, fiber: 2.0, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","asian","italian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Sautéed corn (50g)", price: 8.0, protein: 1.6, carbs: 10.1, fat: 2.8, sugar: 0, fiber: 1.2, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["american","mexican"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Blanched edamame (50g)", price: 8.0, protein: 4.6, carbs: 4.1, fat: 2.3, sugar: 0, fiber: 2.2, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["japanese","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["soy"] },
  { name: "Raw cherry tomato (40g)", price: 15.0, protein: 0.4, carbs: 1.6, fat: 0.1, sugar: 0, fiber: 0.5, category: "vegetables", ingredient_role: "vegetable", meal_types: ["lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Black olives (20g)", price: 20.0, protein: 0.2, carbs: 1.1, fat: 4.1, sugar: 0, fiber: 0.8, category: "vegetables", ingredient_role: "topping", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","italian","greek"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Pinto beans (60g)", price: 20.0, protein: 5.7, carbs: 17.3, fat: 0.4, sugar: 0, fiber: 4.5, category: "legumes", ingredient_role: "secondary_protein", meal_types: ["lunch","dinner"], cuisine: ["mexican"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },

  // TOPPINGS & NUTS
  { name: "Spiced sunflowers seeds (5g)", price: 5.0, protein: 0.9, carbs: 1.1, fat: 2.4, sugar: 0, fiber: 0.6, category: "other", ingredient_role: "topping", meal_types: ["breakfast","lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Pumpkin seeds (5g)", price: 5.0, protein: 1.4, carbs: 1.1, fat: 2.3, sugar: 0, fiber: 0.3, category: "other", ingredient_role: "topping", meal_types: ["breakfast","lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Almonds (20g)", price: 15.0, protein: 4.2, carbs: 4.0, fat: 10.1, sugar: 0, fiber: 2.2, category: "other", ingredient_role: "topping", meal_types: ["breakfast","lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["tree_nut"] },
  { name: "Cashews (20g)", price: 20.0, protein: 3.6, carbs: 6.1, fat: 8.8, sugar: 0, fiber: 0.5, category: "other", ingredient_role: "topping", meal_types: ["lunch","dinner"], cuisine: ["asian","indian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["tree_nut"] },
  { name: "Walnuts (20g)", price: 20.0, protein: 3.0, carbs: 2.8, fat: 13.1, sugar: 0, fiber: 1.4, category: "other", ingredient_role: "topping", meal_types: ["breakfast","lunch","dinner"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["tree_nut"] },
  { name: "Pecans (20g)", price: 30.0, protein: 1.9, carbs: 2.8, fat: 14.7, sugar: 0, fiber: 1.9, category: "other", ingredient_role: "topping", meal_types: ["breakfast","lunch","dinner"], cuisine: ["western","american"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["tree_nut"] },
  { name: "Blueberries (30g)", price: 15.0, protein: 0.2, carbs: 4.3, fat: 0.1, sugar: 3.0, fiber: 0.6, category: "fruits", ingredient_role: "topping", meal_types: ["breakfast"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Pomegranate (15g)", price: 10.0, protein: 0.2, carbs: 2.8, fat: 0.0, sugar: 2.0, fiber: 0, category: "fruits", ingredient_role: "topping", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","middle_eastern"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Chia seeds (5g)", price: 5.0, protein: 1.0, carbs: 2.0, fat: 1.5, sugar: 0, fiber: 1.9, category: "other", ingredient_role: "topping", meal_types: ["breakfast"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Flaxseeds (10g)", price: 5.0, protein: 1.8, carbs: 2.9, fat: 4.3, sugar: 0, fiber: 2.7, category: "other", ingredient_role: "topping", meal_types: ["breakfast"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Brazilian nuts (30g)", price: 45.0, protein: 4.3, carbs: 3.6, fat: 20.0, sugar: 0, fiber: 2.3, category: "other", ingredient_role: "topping", meal_types: ["breakfast","lunch","dinner"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["tree_nut"] },
  { name: "Nutritional yeast (10g)", price: 10.0, protein: 5.0, carbs: 3.0, fat: 0.5, sugar: 0, fiber: 2.0, category: "other", ingredient_role: "topping", meal_types: ["lunch","dinner"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },

  // DAIRY & FATS
  { name: "Greek yogurt (50g)", price: 25.0, protein: 4.5, carbs: 2.3, fat: 2.6, sugar: 0, fiber: 0, category: "dairy", ingredient_role: "dressing_sauce", meal_types: ["breakfast"], cuisine: ["mediterranean","greek"], diet_tags: ["omnivore","pescatarian","vegetarian"], allergens: ["dairy"] },
  { name: "Coconut yogurt (50g)", price: 25.0, protein: 0.3, carbs: 1.8, fat: 3.2, sugar: 0, fiber: 0, category: "dairy", ingredient_role: "dressing_sauce", meal_types: ["breakfast"], cuisine: ["universal"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["coconut"] },
  { name: "Feta (20g)", price: 20.0, protein: 3.9, carbs: 0.8, fat: 4.2, sugar: 0, fiber: 0, category: "dairy", ingredient_role: "topping", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","greek"], diet_tags: ["omnivore","pescatarian","vegetarian"], allergens: ["dairy"] },
  { name: "Cashew feta (20g)", price: 20.0, protein: 2.6, carbs: 3.1, fat: 6.3, sugar: 0, fiber: 0.6, category: "dairy", ingredient_role: "topping", meal_types: ["lunch","dinner"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["tree_nut"] },
  { name: "Unsalted butter (20g)", price: 20.0, protein: 0.06, carbs: 0.18, fat: 8.2, sugar: 0, fiber: 0, category: "fats", ingredient_role: "fat_source", meal_types: ["breakfast"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegetarian"], allergens: ["dairy"] },

  // FERMENTED & GARNISHES
  { name: "Beetroot sauerkraut (30g)", price: 10.0, protein: 0.4, carbs: 2.2, fat: 0.1, sugar: 0, fiber: 0.7, category: "dressing", ingredient_role: "garnish", meal_types: ["lunch","dinner"], cuisine: ["eastern_european"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Kimchi (40g)", price: 10.0, protein: 0.8, carbs: 5.0, fat: 0.2, sugar: 0, fiber: 0.8, category: "dressing", ingredient_role: "garnish", meal_types: ["lunch","dinner"], cuisine: ["korean"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["soy"] },
  { name: "Pickled kombu seaweed (10g)", price: 5.0, protein: 0.1, carbs: 2.0, fat: 0.0, sugar: 0, fiber: 0.1, category: "dressing", ingredient_role: "garnish", meal_types: ["lunch","dinner"], cuisine: ["japanese","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Sumac onions (10g)", price: 5.0, protein: 0.1, carbs: 1.0, fat: 0.0, sugar: 0, fiber: 0.1, category: "dressing", ingredient_role: "garnish", meal_types: ["lunch","dinner"], cuisine: ["middle_eastern"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Turmeric pickled papaya (20g)", price: 5.0, protein: 0.2, carbs: 4.4, fat: 1.4, sugar: 0, fiber: 0.4, category: "dressing", ingredient_role: "garnish", meal_types: ["lunch","dinner"], cuisine: ["indonesian","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Pickled ginger (10g)", price: 5.0, protein: 0.1, carbs: 0.5, fat: 0.0, sugar: 0, fiber: 0.1, category: "dressing", ingredient_role: "garnish", meal_types: ["lunch","dinner"], cuisine: ["japanese","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },

  // DRESSINGS & SAUCES
  { name: "Harissa (30g)", price: 15.0, protein: 0.5, carbs: 2.5, fat: 4.5, sugar: 0, fiber: 0.6, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["north_african","middle_eastern"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Peri peri (30g)", price: 15.0, protein: 0.3, carbs: 1.7, fat: 0.1, sugar: 0, fiber: 0.3, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["portuguese","african"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Miso dressing (30g)", price: 15.0, protein: 0.7, carbs: 3.5, fat: 1.8, sugar: 0, fiber: 0.2, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["japanese","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["soy"] },
  { name: "Red pepper relish (30g)", price: 15.0, protein: 0.3, carbs: 2.0, fat: 0.3, sugar: 0, fiber: 0.4, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["western","american"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Yakiniku BBQ sauce (30g)", price: 15.0, protein: 0.9, carbs: 7.9, fat: 0.2, sugar: 0, fiber: 0.1, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["japanese","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["soy"] },
  { name: "Wafu miso Dressing (30g)", price: 15.0, protein: 0.3, carbs: 1.6, fat: 11.1, sugar: 0, fiber: 0.1, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["japanese","asian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["soy"] },
  { name: "Whipped green moringa tahini dressing (30g)", price: 15.0, protein: 1.1, carbs: 1.8, fat: 7.5, sugar: 0, fiber: 0.7, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["middle_eastern"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["sesame"] },
  { name: "Coconut raita (30g)", price: 15.0, protein: 0.1, carbs: 0.5, fat: 0.9, sugar: 0, fiber: 0.1, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["indian"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["coconut"] },
  { name: "Sumac dressing (30g)", price: 10.0, protein: 0.0, carbs: 1.4, fat: 13.4, sugar: 0, fiber: 0, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["middle_eastern"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: [] },
  { name: "Honey and mustard olive oil dressing (30g)", price: 10.0, protein: 0.1, carbs: 1.5, fat: 13.3, sugar: 0, fiber: 0.1, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["western"], diet_tags: ["omnivore","pescatarian","vegetarian"], allergens: [] },
  { name: "Classic Hummus (50g)", price: 25.0, protein: 3.08, carbs: 9.01, fat: 3.38, sugar: 0, fiber: 3.03, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["mediterranean","middle_eastern"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["sesame"] },
  { name: "Mediterranean Herbs Hummus (50g)", price: 30.0, protein: 3.18, carbs: 9.31, fat: 4.18, sugar: 0, fiber: 3.23, category: "dressing", ingredient_role: "dressing_sauce", meal_types: ["lunch","dinner"], cuisine: ["mediterranean"], diet_tags: ["omnivore","pescatarian","vegan","vegetarian"], allergens: ["sesame"] },
];

async function main() {
  try {
    console.log("🗑️  Deleting all existing ingredients...");
    await db.delete(ingredient);
    console.log("✅ Ingredients cleared");

    const createdById = await getSystemUser();
    console.log(`📝 Using user ID: ${createdById}`);

    console.log("📥 Upserting 70+ ingredients...");

    // Map ingredient types
    const typeMap: Record<string, "protein" | "carbs" | "vegetables" | "fruits" | "fats" | "dairy" | "legumes" | "dressing" | "other"> = {
      "protein": "protein",
      "carbs": "carbs",
      "vegetables": "vegetables",
      "fruits": "fruits",
      "fat": "fats",
      "fats": "fats",
      "dairy": "dairy",
      "legumes": "legumes",
      "dressing": "dressing",
      "fermented": "dressing",
      "topping": "other",
    };

    for (const ing of ingredientData) {
      const type = typeMap[ing.category] || "other";
      
      await db.insert(ingredient).values({
        name: ing.name,
        description: `${ing.ingredient_role} - ${ing.cuisine.join(", ")}`,
        type,
        protein: ing.protein,
        carbs: ing.carbs,
        fat: ing.fat,
        servingSize: 100,
        unit: "g",
        createdBy: createdById,
      });
    }

    console.log(`✅ Successfully upserted ${ingredientData.length} ingredients!`);
  } catch (error) {
    console.error("❌ Error upserting ingredients:", error);
    process.exit(1);
  }
}

main();

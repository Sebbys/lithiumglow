# Ingredient Type System & Multiple Ingredients per Meal Update

## Changes Made

### 1. Database Schema Updates

**File: `db/schema.ts`**
- Added `type` field to `ingredient` table with enum values:
  - `protein` - Protein sources (chicken, fish, eggs, tofu)
  - `carbs` - Carbohydrate sources (rice, bread, potatoes)
  - `vegetables` - Vegetable sources (broccoli, spinach, kale)
  - `fruits` - Fruit sources (banana, apple, berries)
  - `fats` - Healthy fat sources (nuts, avocado)
  - `dairy` - Dairy and alternatives (milk, yogurt, cheese)
  - `legumes` - Beans and lentils
  - `dressing` - Oils and dressings
  - `other` - Default category

**Migration:**
- Ran `npm run db:push` to add the new column
- Created script `scripts/update-ingredient-types.ts` to categorize existing 30 ingredients
- Successfully updated all ingredients with appropriate types

### 2. AI Meal Plan Generation - Multiple Ingredients per Meal

**Previous Structure (Single Ingredient per Meal):**
```json
{
  "meals": [
    {
      "mealType": "breakfast",
      "ingredientId": "id",
      "ingredientName": "Chicken Breast",
      "quantity": 150,
      "notes": "Grilled"
    }
  ]
}
```

**New Structure (Multiple Ingredients per Meal):**
```json
{
  "meals": [
    {
      "mealType": "breakfast",
      "ingredients": [
        {
          "ingredientId": "id1",
          "ingredientName": "Eggs",
          "quantity": 100
        },
        {
          "ingredientId": "id2",
          "ingredientName": "Whole Wheat Bread",
          "quantity": 60
        },
        {
          "ingredientId": "id3",
          "ingredientName": "Spinach",
          "quantity": 50
        }
      ],
      "notes": "Scrambled eggs with toast and sautéed spinach"
    }
  ]
}
```

**Files Modified:**

1. **`lib/minimax-client.ts`**
   - Updated `generateMealPlan()` method signature to include `type` field in ingredients
   - Changed AI prompt to request multiple ingredients per meal
   - Grouped ingredients by type in prompt for better AI understanding
   - Improved JSON parsing with better error handling:
     - Extract JSON from markdown
     - Fix trailing commas
     - Validate required fields
     - Better error messages with raw content logging

2. **`components/ai-meal-plan-generator.tsx`**
   - Updated TypeScript interfaces:
     ```typescript
     interface AIGeneratedIngredient {
       ingredientId: string;
       ingredientName: string;
       quantity: number;
     }
     
     interface AIGeneratedMeal {
       mealType: "breakfast" | "lunch" | "dinner" | "snack";
       ingredients: AIGeneratedIngredient[];  // Changed from single to array
       notes: string;
     }
     ```

3. **`components/meal-plan-creation.tsx`**
   - Updated `handleAIPlanGenerated()` to flatten multiple ingredients:
     ```typescript
     meals: day.meals.flatMap((meal) =>
       meal.ingredients.map((ing) => ({
         ingredientId: ing.ingredientId,
         mealType: meal.mealType,
         quantity: ing.quantity.toString(),
         notes: meal.notes,
       }))
     )
     ```
   - This converts AI's grouped meal structure to the existing flat storage format

4. **`app/api/meal-plans/generate-ai/route.ts`**
   - Updated ingredient ID validation to handle nested ingredients array:
     ```typescript
     meal.ingredients.forEach((ing) => {
       if (!ingredientIds.has(ing.ingredientId)) {
         invalidMeals.push(`Day ${day.dayNumber}, ${meal.mealType}: ${ing.ingredientName}`);
       }
     });
     ```

### 3. Ingredients Management UI Updates

**File: `components/ingredients-management.tsx`**
- Added `type` field to Ingredient interface
- Added type field to form with dropdown selector
- Display ingredient type as a badge on cards
- Updated form submission to include type
- Updated edit functionality to populate type field

**UI Changes:**
- Type selector dropdown with clear categories
- Visual badge showing ingredient type on each card
- Better organization and categorization

### 4. JSON Parsing Improvements

**Problem:** AI was generating malformed JSON with unterminated strings

**Solutions Implemented:**
1. Simplified AI system prompt
2. Emphasized "ONLY valid JSON" output
3. Added JSON extraction from markdown code blocks
4. Fixed trailing commas automatically
5. Better error logging showing first 500 chars of problematic JSON
6. Validate required fields before returning

### 5. New Scripts

**`scripts/update-ingredient-types.ts`**
- One-time migration script to categorize existing ingredients
- Maps ingredient names to appropriate types
- Successfully updated all 30 seeded ingredients

**`scripts/seed-ingredients.ts`**
- Updated with `type` field for each ingredient
- Uses TypeScript `as const` for type safety

## How It Works Now

### Meal Plan Creation Flow

1. **Nutritionist uses AI Generator:**
   - Sets macro targets (calories, protein, carbs, fat)
   - Optionally adds dietary preferences and allergies
   - Clicks "Generate with AI"

2. **AI Processing:**
   - Receives grouped ingredients by type (protein, carbs, vegetables, etc.)
   - Generates 7-day plan with 3-4 meals per day
   - Each meal includes 2-5 ingredients from different categories
   - Example: Breakfast = Eggs (protein) + Whole Wheat Bread (carbs) + Spinach (vegetables) + Olive Oil (dressing)

3. **Response Handling:**
   - API validates all ingredient IDs exist
   - Frontend flattens the grouped structure
   - Populates the 7-day form with individual ingredient entries
   - Nutritionist can review and modify before saving

### Ingredient Categorization

Ingredients are now organized by type/source:
- **Protein sources:** Build and repair tissues
- **Carb sources:** Energy and fiber
- **Vegetables:** Vitamins, minerals, fiber
- **Fruits:** Quick energy, antioxidants
- **Healthy fats:** Satiety, nutrient absorption
- **Dairy:** Calcium and protein
- **Legumes:** Plant protein and fiber
- **Dressing/Oils:** Flavor and healthy fats

This allows the AI to:
- Create balanced meals with variety
- Combine complementary ingredients
- Hit macro targets more accurately
- Generate more realistic, enjoyable meals

## Testing

Run the app and test:
1. Navigate to `/nutritionist/ingredients` - verify type badges show
2. Create/edit ingredient - verify type dropdown works
3. Navigate to `/nutritionist/meal-plans/create`
4. Use AI generator with targets like:
   - Calories: 2000
   - Protein: 150g
   - Carbs: 200g
   - Fat: 65g
5. Verify generated meals have multiple ingredients per slot
6. Check that macros are balanced across the day

## Error Fixed

**Original Error:**
```
Error generating meal plan: SyntaxError: Unterminated string in JSON at position 4181 (line 118 column 41)
```

**Root Causes:**
1. AI generating overly long notes with unescaped newlines
2. Complex JSON structure with nested objects
3. Markdown code block wrappers

**Fixes Applied:**
1. Simplified prompt to request concise notes (under 50 chars)
2. Improved JSON cleanup regex patterns
3. Extract JSON content from markdown blocks
4. Fix trailing commas
5. Better validation with clear error messages

## Database State

All 30 ingredients now have types:
- 4 proteins (chicken, salmon, eggs, tofu)
- 5 carbs (rice, potato, oatmeal, quinoa, bread)
- 5 vegetables (broccoli, spinach, kale, peppers, carrots)
- 4 fruits (banana, apple, blueberries, strawberries)
- 4 fats (avocado, almonds, walnuts, peanut butter)
- 4 dairy (yogurt, milk, almond milk, cottage cheese)
- 3 legumes (black beans, chickpeas, lentils)
- 1 dressing (olive oil)

Ready for production use!

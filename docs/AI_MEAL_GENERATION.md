# AI Meal Plan Generation with MiniMax M2

This feature uses the MiniMax M2 AI model to automatically generate healthy and tasty 7-day meal plans based on nutritional targets.

## Setup

### 1. Get MiniMax API Key

1. Visit [MiniMax Platform](https://platform.minimax.io/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key

### 2. Configure Environment Variable

Add your MiniMax API key to your `.env` file:

```env
MINIMAX_API_KEY=your_minimax_api_key_here
```

### 3. Seed Ingredients Database

Before using AI generation, you need to populate the ingredients database:

```bash
npm run db:seed-ingredients
```

This will add 30 common healthy ingredients including:
- **Proteins**: Chicken, Salmon, Eggs, Greek Yogurt, Tofu
- **Carbs**: Brown Rice, Sweet Potato, Oatmeal, Quinoa, Whole Wheat Bread
- **Vegetables**: Broccoli, Spinach, Kale, Bell Peppers, Carrots
- **Fruits**: Banana, Apple, Blueberries, Strawberries, Avocado
- **Healthy Fats**: Almonds, Walnuts, Olive Oil, Peanut Butter
- **Dairy**: Milk, Almond Milk, Cottage Cheese
- **Legumes**: Black Beans, Chickpeas, Lentils

## How It Works

### AI Integration

The system uses MiniMax M2's Anthropic-compatible API:

1. **Model**: MiniMax-M2
2. **Base URL**: `https://api.minimax.io/anthropic`
3. **Features Used**:
   - Text generation
   - Reasoning (thinking) blocks
   - JSON structured output

### Meal Plan Generation Process

1. **Input**: Nutritionist provides:
   - Daily calorie target
   - Macro targets (protein, carbs, fat)
   - Optional dietary preferences
   - Optional allergies/restrictions

2. **AI Processing**:
   - Receives list of all available ingredients with nutritional info
   - Analyzes macro targets and constraints
   - Creates balanced, varied 7-day meal plan
   - Ensures realistic portions and meal combinations

3. **Output**: Structured meal plan with:
   - 7 days of meals
   - 3-4 meals per day (breakfast, lunch, dinner, snack)
   - Specific ingredients and quantities
   - Preparation notes
   - Daily totals that match targets (±10%)

## Usage

### For Nutritionists

1. Navigate to `/nutritionist/meal-plans/create`
2. Scroll down to the "AI Meal Plan Generator" section
3. Enter target macros:
   - Target Calories (e.g., 2000)
   - Protein (e.g., 150g)
   - Carbs (e.g., 200g)
   - Fat (e.g., 65g)
4. Optionally add:
   - Dietary preferences (e.g., "vegetarian", "high-protein")
   - Allergies (e.g., "dairy-free", "nut allergy")
5. Click "Generate AI Meal Plan"
6. Wait 10-30 seconds for AI to create the plan
7. Review the generated plan
8. Fill in member details and submit to create

### API Endpoint

**POST** `/api/meal-plans/generate-ai`

**Request Body:**
```json
{
  "targetCalories": 2000,
  "targetProtein": 150,
  "targetCarbs": 200,
  "targetFat": 65,
  "dietaryPreferences": "high-protein",
  "allergies": "dairy-free"
}
```

**Response:**
```json
{
  "mealPlan": [
    {
      "dayNumber": 1,
      "meals": [
        {
          "mealType": "breakfast",
          "ingredientId": "uuid",
          "ingredientName": "Oatmeal",
          "quantity": 80,
          "notes": "Cook with water, top with berries"
        }
      ],
      "notes": "High protein day to start the week"
    }
  ],
  "reasoning": "AI's thought process (optional)",
  "ingredientsUsed": 30
}
```

## AI Prompt Engineering

The system uses carefully crafted prompts to ensure quality output:

### System Prompt
- Defines role as expert nutritionist
- Sets output format (JSON)
- Provides guidelines for variety and balance
- Emphasizes realistic portions

### User Prompt
- Includes specific macro targets
- Lists all available ingredients with full nutritional info
- Adds dietary preferences and restrictions
- Requests varied, tasty meals

## Features

### 🎯 Smart Macro Targeting
- AI aims to hit targets within 10% margin
- Balances macros across the day
- Considers meal timing and energy needs

### 🍽️ Meal Variety
- Uses different ingredients across days
- Prevents meal monotony
- Creates interesting food combinations

### 🥗 Realistic Portions
- Generates practical serving sizes
- Considers typical meal compositions
- Accounts for ingredient serving units

### 💡 Nutritional Intelligence
- Prioritizes nutrient-dense foods
- Balances macros with micronutrients
- Suggests complementary ingredients

### 🚫 Dietary Restrictions
- Respects allergies and intolerances
- Accommodates dietary preferences
- Filters incompatible ingredients

## Troubleshooting

### "MINIMAX_API_KEY is not set"
- Make sure you've added `MINIMAX_API_KEY` to your `.env` file
- Restart your development server after adding the key

### "No ingredients available"
- Run `npm run db:seed-ingredients` to populate the database
- Ensure at least one nutritionist/admin user exists

### "Failed to generate meal plan"
- Check your internet connection
- Verify API key is valid
- Check MiniMax API status
- Review server logs for detailed error messages

### AI generates invalid ingredient IDs
- This is rare but can happen
- The API will reject invalid plans
- Try generating again
- Consider adding more ingredients to the database

## Cost Considerations

- MiniMax M2 charges per token
- Each meal plan generation uses ~2000-3000 tokens
- Monitor your usage in MiniMax dashboard
- Consider implementing rate limiting for production

## Advanced Usage

### Custom AI Suggestions

You can also use the AI to improve existing meals:

```typescript
import { MiniMaxClient } from "@/lib/minimax-client";

const minimax = new MiniMaxClient();

const suggestions = await minimax.suggestMealImprovements({
  currentMeal: {
    ingredients: [
      { name: "Chicken Breast", quantity: 150, protein: 46.5, carbs: 0, fat: 5.4 }
    ],
    mealType: "lunch"
  },
  targetMacros: { protein: 40, carbs: 50, fat: 15 },
  availableIngredients: ingredients
});
```

## Best Practices

1. **Seed Ingredients First**: Always populate ingredients before using AI
2. **Set Realistic Targets**: AI works best with achievable macro goals
3. **Review Generated Plans**: Always review AI output before assigning to members
4. **Add More Ingredients**: More ingredients = more variety and better plans
5. **Save API Key Securely**: Never commit API keys to version control

## Future Enhancements

- [ ] Real-time streaming of meal plan generation
- [ ] AI-powered recipe suggestions
- [ ] Meal prep instructions
- [ ] Shopping list generation
- [ ] Seasonal ingredient preferences
- [ ] Cultural cuisine preferences
- [ ] Meal timing optimization
- [ ] Bulk meal plan generation

## Technical Details

### MiniMax M2 Model Capabilities
- Context window: Large (supports full ingredient lists)
- Response quality: High (produces coherent, practical meal plans)
- JSON support: Excellent (reliable structured output)
- Reasoning: Includes thinking blocks for transparency

### API Implementation
- Uses Anthropic-compatible endpoint
- Handles streaming and non-streaming responses
- Includes error handling and validation
- Validates ingredient IDs before returning

### Security
- API key stored in environment variables
- Role-based access control (nutritionist/admin only)
- Input validation on all parameters
- Rate limiting recommended for production

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review MiniMax documentation: https://platform.minimax.io/docs
3. Check server logs for detailed errors
4. Verify all prerequisites are met

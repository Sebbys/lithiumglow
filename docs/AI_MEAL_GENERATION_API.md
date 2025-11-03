# AI Meal Generation API

This API generates healthy, balanced meals based on the Harvard Healthy Eating Plate guidelines with whole-number servings only (no half portions).

## Endpoint

```
POST /api/ai/generate-meal
```

## Request Body

```json
{
  "targetCalories": 2000,
  "mealType": "lunch",
  "dietTags": ["omnivore"],
  "cuisinePreference": "mediterranean",
  "servingsOnly": true
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `targetCalories` | number | ✅ | Target total calories for the meal |
| `mealType` | string | ✅ | One of: `breakfast`, `lunch`, `dinner`, `snack` |
| `dietTags` | string[] | ❌ | Dietary preferences (default: `["omnivore"]`) |
| `cuisinePreference` | string | ❌ | Preferred cuisine (default: `universal`) |
| `servingsOnly` | boolean | ❌ | Only use whole servings (default: `true`) |

#### Supported Diet Tags
- `omnivore` - All foods
- `pescatarian` - No meat, but fish allowed
- `vegetarian` - No meat or fish
- `vegan` - No animal products
- `keto` - High fat, low carb
- `paleo` - Whole foods
- `gluten-free` - No gluten
- `dairy-free` - No dairy

#### Supported Cuisines
- `universal` - Mix of all
- `western` - American/European
- `asian` - Pan-Asian
- `mediterranean` - Mediterranean region
- `indian` - Indian subcontinent
- `mexican` - Mexican
- `japanese` - Japanese
- `middle_eastern` - Middle East
- `korean` - Korean
- `indonesian` - Indonesian
- `portuguese` - Portuguese
- `american` - American
- `greek` - Greek
- `italian` - Italian
- `african` - African
- `eastern_european` - Eastern European
- `north_african` - North African

## Response

```json
{
  "components": [
    {
      "ingredient": {
        "id": "uuid",
        "name": "Grilled salmon fillet (100g)",
        "type": "protein"
      },
      "servings": 2,
      "quantity": 200,
      "macros": {
        "protein": 40.0,
        "carbs": 0.0,
        "fat": 26.0,
        "calories": 532
      }
    },
    {
      "ingredient": {
        "id": "uuid",
        "name": "Roasted bell peppers in extra virgin olive oil (50g)",
        "type": "vegetables"
      },
      "servings": 3,
      "quantity": 150,
      "macros": {
        "protein": 1.5,
        "carbs": 8.4,
        "fat": 12.9,
        "calories": 129
      }
    }
  ],
  "totalMacros": {
    "protein": 45.2,
    "carbs": 78.3,
    "fat": 65.1,
    "calories": 1015
  },
  "targetMacros": {
    "protein": 46.88,
    "carbs": 80.0,
    "fat": 66.67,
    "calories": 1400
  },
  "deviationPercentage": {
    "protein": -3.6,
    "carbs": -2.1,
    "fat": -2.4,
    "calories": -2.5
  },
  "plateComposition": "2x Grilled salmon fillet (100g), 3x Roasted bell peppers in extra virgin olive oil (50g), 1x Red rice (100g), 1x Greek yogurt (50g), 1x Unsalted butter (20g)",
  "isHealthyPlate": true
}
```

## Harvard Healthy Eating Plate Distribution

The meal generation follows these proportions:

| Component | % of Calories | Function |
|-----------|---------------|----------|
| Vegetables | ~25% | Fiber, nutrients, volume |
| Fruits | ~15% | Natural sugars, fiber, antioxidants |
| Whole Grains | ~25% | Complex carbs, sustained energy |
| Protein | ~25% | Muscle maintenance, satiety |
| Healthy Oils | ~10% | Fat-soluble vitamins, energy |

## Key Features

✅ **Whole Servings Only** - No half portions, realistic for restaurants
✅ **±5% Macro Tolerance** - Allows natural food variation
✅ **Real Foods** - Never nonsensical combinations
✅ **Balanced Nutrition** - Follows Harvard nutrition guidelines
✅ **Dietary Compliance** - Respects allergies and preferences
✅ **Calorie Accurate** - Targets specified calorie amounts

## Examples

### Example 1: Mediterranean Lunch (2000 cal)

```bash
curl -X POST http://localhost:3000/api/ai/generate-meal \
  -H "Content-Type: application/json" \
  -d '{
    "targetCalories": 2000,
    "mealType": "lunch",
    "dietTags": ["omnivore"],
    "cuisinePreference": "mediterranean"
  }'
```

### Example 2: Vegan Dinner (1800 cal)

```bash
curl -X POST http://localhost:3000/api/ai/generate-meal \
  -H "Content-Type: application/json" \
  -d '{
    "targetCalories": 1800,
    "mealType": "dinner",
    "dietTags": ["vegan"],
    "cuisinePreference": "universal"
  }'
```

### Example 3: High-Protein Breakfast (500 cal)

```bash
curl -X POST http://localhost:3000/api/ai/generate-meal \
  -H "Content-Type: application/json" \
  -d '{
    "targetCalories": 500,
    "mealType": "breakfast",
    "dietTags": ["omnivore"],
    "servingsOnly": true
  }'
```

## Notes

- **isHealthyPlate**: Returns `true` if all macros are within ±5% of target
- **servings**: Always a whole number (1, 2, 3, etc.)
- **quantity**: servings × serving_size (in grams)
- **deviationPercentage**: Shows how far from target macros; negative = under, positive = over

# AI JSON Parsing Fixes

## Problem
AI-generated meal plans were being truncated, causing JSON parsing errors like:
```
Expected ',' or ']' after array element in JSON at position 4964
```

## Root Cause
The AI response was hitting the token limit (max_tokens: 3000), causing the JSON to be cut off mid-structure.

## Solutions Applied

### 1. Increased Token Limit
**Before:** `max_tokens: 3000`
**After:** `max_tokens: 8000`

This allows the AI to complete the full 7-day meal plan with multiple ingredients per meal.

### 2. Auto-Fix Incomplete JSON
Added bracket counting and auto-completion:
```typescript
// Count brackets
const openBraces = (textContent.match(/\{/g) || []).length;
const closeBraces = (textContent.match(/\}/g) || []).length;

// Add missing closing brackets
if (openBraces !== closeBraces) {
  const missing = openBraces - closeBraces;
  for (let i = 0; i < missing; i++) {
    textContent += '}';
  }
}
```

### 3. Enhanced Error Logging
Now logs:
- First 1000 characters of response
- Last 500 characters of response
- Total content length
- Position of last `}` and `]`
- Bracket/brace counts

This helps diagnose truncation issues quickly.

### 4. Simplified AI Prompt
- Reduced note length requirement (30 chars vs 50 chars)
- Clearer structure example (compact format)
- Explicit "NO trailing commas" instruction
- Emphasis on closing all brackets

### 5. Reduced Temperature
**Before:** `temperature: 0.8`
**After:** `temperature: 0.7`

More focused output, less creative variation, more consistent JSON structure.

## Testing

If you still encounter errors:

1. **Check the console logs** for:
   - "JSON appears incomplete!" warning
   - Bracket counts (should be equal)
   - Content length (should be under token limit)

2. **Try reducing complexity:**
   - Use fewer dietary preferences
   - Simplify allergy restrictions
   - Request fewer meals per day

3. **Check API limits:**
   - Verify MiniMax API token limits
   - Check if model supports 8000 tokens
   - Review API usage/rate limits

## Expected Output Structure

```json
{
  "mealPlan": [
    {
      "dayNumber": 1,
      "meals": [
        {
          "mealType": "breakfast",
          "ingredients": [
            {"ingredientId": "uuid", "ingredientName": "Eggs", "quantity": 100},
            {"ingredientId": "uuid", "ingredientName": "Bread", "quantity": 60}
          ],
          "notes": "Scrambled with toast"
        }
      ],
      "notes": "High protein day"
    }
  ]
}
```

## If Problems Persist

1. Try the `/api/meal-plans/generate-ai` endpoint with fewer days
2. Use streaming if MiniMax supports it
3. Split into multiple API calls (e.g., 3-4 days at a time)
4. Consider alternative models with higher token limits

## Success Indicators

✅ Full 7 days generated
✅ 3-4 meals per day
✅ 2-4 ingredients per meal
✅ No JSON parsing errors
✅ All brackets closed
✅ Total response under 8000 tokens

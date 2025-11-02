# Quick Start: AI-Powered Nutritionist Feature

## 🚀 Getting Started in 5 Minutes

### Step 1: Set Up Environment Variables

Add to your `.env` file:
```env
MINIMAX_API_KEY=your_api_key_here
```

Get your API key from: https://platform.minimax.io/

### Step 2: Seed the Ingredients Database

```bash
npm run db:seed-ingredients
```

This adds 30 healthy ingredients to your database.

### Step 3: Create a Nutritionist User

Update a user's role in your database:
```sql
UPDATE "user" SET role = 'nutritionist' WHERE email = 'your-email@example.com';
```

### Step 4: Start Using the Feature

1. Sign in as the nutritionist user
2. Navigate to `/nutritionist`
3. Try these features:
   - **Manage Ingredients**: `/nutritionist/ingredients`
   - **Create Meal Plans**: `/nutritionist/meal-plans/create`
   - **AI Generation**: Use the AI generator on the meal plan creation page

## 🎯 Quick Test

### Manual Meal Plan
1. Go to `/nutritionist/meal-plans/create`
2. Select a member
3. Fill in plan details
4. Manually add meals for 7 days
5. Submit

### AI-Generated Meal Plan
1. Go to `/nutritionist/meal-plans/create`
2. Scroll to "AI Meal Plan Generator"
3. Enter targets:
   - Calories: 2000
   - Protein: 150g
   - Carbs: 200g
   - Fat: 65g
4. Click "Generate AI Meal Plan"
5. Wait ~15 seconds
6. Review generated plan
7. Select member and submit

## 📊 Features Overview

### ✅ Implemented
- ✅ Ingredient database with macros
- ✅ CRUD operations for ingredients
- ✅ Manual meal plan creation (7 days)
- ✅ AI-powered meal plan generation
- ✅ Real-time macro calculations
- ✅ Role-based access control
- ✅ 30 pre-seeded healthy ingredients

### 🔧 Database Schema
- `ingredient` - Food items with nutritional data
- `mealPlan` - 7-day plans for members
- `mealPlanDay` - Individual days (1-7)
- `mealPlanDayIngredient` - Meals with ingredients

### 🤖 AI Capabilities
- Generates complete 7-day meal plans
- Hits macro targets (±10% accuracy)
- Creates varied, interesting meals
- Respects dietary restrictions
- Uses only available ingredients
- Provides preparation notes

## 📝 Common Commands

```bash
# Seed ingredients
npm run db:seed-ingredients

# Push database changes
npm run db:push

# Open database studio
npm run db:studio

# Start development server
npm run dev
```

## 🎨 UI Routes

- `/nutritionist` - Dashboard
- `/nutritionist/ingredients` - Manage ingredients
- `/nutritionist/meal-plans/create` - Create meal plans

## 🔑 API Endpoints

### Ingredients
- `GET /api/ingredients` - List all
- `POST /api/ingredients` - Create
- `GET /api/ingredients/[id]` - Get one
- `PATCH /api/ingredients/[id]` - Update
- `DELETE /api/ingredients/[id]` - Delete

### Meal Plans
- `GET /api/meal-plans` - List all
- `POST /api/meal-plans` - Create
- `GET /api/meal-plans/[id]` - Get details
- `PATCH /api/meal-plans/[id]` - Update
- `DELETE /api/meal-plans/[id]` - Delete
- `POST /api/meal-plans/generate-ai` - AI generation

### Members
- `GET /api/members` - List members (nutritionist only)

## 💡 Tips

1. **Start with Ingredients**: Always seed or create ingredients first
2. **Use AI for Speed**: AI can create a full 7-day plan in seconds
3. **Review AI Output**: Always check AI-generated plans before assigning
4. **Add More Ingredients**: More variety = better meal plans
5. **Set Realistic Targets**: AI works best with achievable goals

## 🐛 Troubleshooting

### No ingredients showing?
```bash
npm run db:seed-ingredients
```

### API key error?
Check `.env` file has `MINIMAX_API_KEY`

### Not authorized?
Make sure user role is `nutritionist` or `admin`

### AI generation fails?
- Check internet connection
- Verify API key is valid
- Check MiniMax dashboard for quota

## 📚 Full Documentation

- [Nutritionist Feature](./NUTRITIONIST_FEATURE.md) - Complete feature docs
- [AI Meal Generation](./AI_MEAL_GENERATION.md) - AI integration details

## 🎉 You're Ready!

Start creating healthy meal plans for your members with the power of AI! 🚀

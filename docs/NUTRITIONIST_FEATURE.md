# Nutritionist Feature Implementation Summary

## Overview
This implementation adds a complete nutritionist system to the application, allowing nutritionists to create and manage ingredients, and design personalized 7-day meal plans for members.

## Database Schema Changes

### New Tables Added

#### 1. `ingredient` Table
- `id` (uuid, primary key)
- `name` (text, required)
- `description` (text, optional)
- `protein` (real, required) - grams per serving
- `carbs` (real, required) - grams per serving
- `fat` (real, required) - grams per serving
- `servingSize` (real, default 100) - serving size in grams/ml
- `unit` (text, default 'g') - unit of measurement (g, ml, piece, etc.)
- `createdBy` (uuid, references user.id)
- `createdAt`, `updatedAt` (timestamps)

**Note:** Kcal is calculated automatically: `(protein * 4) + (carbs * 4) + (fat * 9)`

#### 2. `mealPlan` Table
- `id` (uuid, primary key)
- `name` (text, required)
- `description` (text, optional)
- `userId` (uuid, references user.id) - the member receiving the plan
- `nutritionistId` (uuid, references user.id) - the nutritionist who created it
- `startDate` (timestamp, required)
- `endDate` (timestamp, required)
- `status` (enum: 'draft', 'active', 'completed', 'cancelled')
- `notes` (text, optional)
- `createdAt`, `updatedAt` (timestamps)

#### 3. `mealPlanDay` Table
- `id` (uuid, primary key)
- `mealPlanId` (uuid, references mealPlan.id)
- `dayNumber` (integer, 1-7)
- `date` (timestamp)
- `notes` (text, optional)
- `createdAt`, `updatedAt` (timestamps)

#### 4. `mealPlanDayIngredient` Table
- `id` (uuid, primary key)
- `mealPlanDayId` (uuid, references mealPlanDay.id)
- `ingredientId` (uuid, references ingredient.id)
- `mealType` (enum: 'breakfast', 'lunch', 'dinner', 'snack')
- `quantity` (real) - quantity in ingredient's unit
- `notes` (text, optional)
- `createdAt` (timestamp)

### User Role Update
- Added `nutritionist` to the user role enum (member, admin, nutritionist)

## API Routes

### Ingredient Management
- `GET /api/ingredients` - List all ingredients with calculated kcal
- `POST /api/ingredients` - Create new ingredient (nutritionist/admin only)
- `GET /api/ingredients/[id]` - Get single ingredient
- `PATCH /api/ingredients/[id]` - Update ingredient (nutritionist/admin only)
- `DELETE /api/ingredients/[id]` - Delete ingredient (nutritionist/admin only)

### Meal Plan Management
- `GET /api/meal-plans` - List meal plans (nutritionists see their created plans, members see their own)
- `POST /api/meal-plans` - Create new meal plan with 7 days (nutritionist/admin only)
- `GET /api/meal-plans/[id]` - Get detailed meal plan with all days and ingredients
- `PATCH /api/meal-plans/[id]` - Update meal plan (creator only)
- `DELETE /api/meal-plans/[id]` - Delete meal plan (creator only)

### Member Management
- `GET /api/members` - List all members (nutritionist/admin only)

## UI Components

### 1. Ingredients Management (`/nutritionist/ingredients`)
- View all ingredients in a grid layout
- Create new ingredients with nutritional info
- Edit existing ingredients
- Delete ingredients
- Real-time kcal calculation display
- Support for different units (g, ml, piece, cup, tbsp, tsp)

### 2. Meal Plan Creation (`/nutritionist/meal-plans/create`)
- Select a member from dropdown
- Set plan name, description, start date
- Create 7-day meal plan structure
- Add multiple meals per day
- Select meal type (breakfast, lunch, dinner, snack)
- Choose ingredients from database
- Set quantity per ingredient
- Real-time macro calculation per meal and per day
- Add notes for each day and meal

### 3. Nutritionist Dashboard (`/nutritionist`)
- Overview of available features
- Quick access to ingredients management
- Quick access to meal plan creation
- Getting started guide

## Features

### Automatic Calculations
- **Kcal per ingredient**: Automatically calculated using the formula (protein × 4) + (carbs × 4) + (fat × 9)
- **Meal macros**: When creating meal plans, macros are calculated based on quantity relative to serving size
- **Daily totals**: Sum of all meals for the day displayed at day level

### Authorization
- Only users with `nutritionist` or `admin` role can:
  - Create/edit/delete ingredients
  - Create/edit/delete meal plans
  - View members list
- Members can only view their own meal plans
- Nutritionists can only edit/delete meal plans they created

### Data Validation
- Required fields enforced on both frontend and backend
- Numeric validation for macros and quantities
- Proper error handling with user-friendly messages

## How to Use

### For Nutritionists:

1. **Add Ingredients First**
   - Navigate to `/nutritionist/ingredients`
   - Click "Add Ingredient"
   - Fill in name, serving size, unit, and macros (protein, carbs, fat)
   - Kcal is calculated automatically
   - Save the ingredient

2. **Create Meal Plans**
   - Navigate to `/nutritionist/meal-plans/create`
   - Select a member from the dropdown
   - Enter plan name and start date
   - For each of the 7 days:
     - Click "Add Meal" to add meals
     - Select meal type (breakfast, lunch, dinner, snack)
     - Choose an ingredient
     - Enter the quantity
     - View real-time macro calculations
   - Submit to create the plan

### For Admins:
- To create a nutritionist user, update a user's role in the database to `nutritionist`
- SQL example: `UPDATE "user" SET role = 'nutritionist' WHERE email = 'nutritionist@example.com'`

## File Structure

```
db/
  schema.ts                                    # Updated with new tables

app/
  api/
    ingredients/
      route.ts                                 # GET all, POST create
      [id]/route.ts                           # GET, PATCH, DELETE single
    meal-plans/
      route.ts                                 # GET all, POST create
      [id]/route.ts                           # GET, PATCH, DELETE single
    members/
      route.ts                                 # GET all members
  nutritionist/
    page.tsx                                   # Dashboard
    ingredients/
      page.tsx                                 # Ingredients management page
    meal-plans/
      create/
        page.tsx                               # Meal plan creation page

components/
  ingredients-management.tsx                   # Ingredients UI component
  meal-plan-creation.tsx                      # Meal plan creation UI component
```

## Next Steps (Future Enhancements)

1. **Meal Plan Viewing**
   - Create page for members to view their assigned meal plans
   - Calendar view of meal plans
   - Progress tracking

2. **Meal Plan Templates**
   - Save meal plans as templates
   - Duplicate existing plans for new members

3. **Advanced Features**
   - Shopping list generation from meal plans
   - Recipe management with multiple ingredients
   - Meal swap suggestions
   - Export meal plans to PDF
   - Mobile-friendly meal plan viewer

4. **Analytics**
   - Member compliance tracking
   - Popular ingredients report
   - Nutritional trends

## Testing

To test the implementation:

1. Create or update a user with role `nutritionist`
2. Sign in as that user
3. Navigate to `/nutritionist`
4. Create some ingredients
5. Create a meal plan for a member
6. Verify calculations are correct

## Notes

- All database migrations have been applied successfully
- Role-based access control is implemented on all routes
- Kcal calculations use the standard 4-4-9 formula
- Cascading deletes are configured for data integrity

-- Seed data for ingredients table
-- Common healthy ingredients with their nutritional values per 100g/100ml serving

-- Proteins
INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Chicken Breast', 
  'Lean protein source, boneless skinless chicken breast',
  31.0, 
  0.0, 
  3.6,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Salmon Fillet', 
  'Rich in omega-3 fatty acids, wild-caught salmon',
  20.0, 
  0.0, 
  13.0,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Eggs', 
  'Whole eggs, excellent source of complete protein',
  13.0, 
  1.1, 
  11.0,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Greek Yogurt', 
  'Low-fat Greek yogurt, high in protein',
  10.0, 
  3.6, 
  0.4,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Tofu', 
  'Firm tofu, plant-based protein',
  8.0, 
  1.9, 
  4.8,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

-- Carbohydrates
INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Brown Rice', 
  'Cooked brown rice, whole grain',
  2.6, 
  23.0, 
  0.9,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Sweet Potato', 
  'Baked sweet potato with skin',
  2.0, 
  20.0, 
  0.2,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Oatmeal', 
  'Rolled oats, cooked',
  2.4, 
  12.0, 
  1.4,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Quinoa', 
  'Cooked quinoa, complete protein grain',
  4.4, 
  21.3, 
  1.9,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Whole Wheat Bread', 
  'Whole grain bread slice',
  9.0, 
  41.0, 
  3.4,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

-- Vegetables
INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Broccoli', 
  'Steamed broccoli florets',
  2.8, 
  7.0, 
  0.4,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Spinach', 
  'Fresh raw spinach leaves',
  2.9, 
  3.6, 
  0.4,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Kale', 
  'Raw kale leaves, nutrient dense',
  4.3, 
  8.8, 
  0.9,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Bell Peppers', 
  'Mixed color bell peppers',
  1.0, 
  6.0, 
  0.3,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Carrots', 
  'Raw carrots',
  0.9, 
  9.6, 
  0.2,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

-- Fruits
INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Banana', 
  'Fresh banana, energy-rich fruit',
  1.1, 
  23.0, 
  0.3,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Apple', 
  'Fresh apple with skin',
  0.3, 
  14.0, 
  0.2,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Blueberries', 
  'Fresh blueberries, antioxidant-rich',
  0.7, 
  14.5, 
  0.3,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Strawberries', 
  'Fresh strawberries',
  0.7, 
  7.7, 
  0.3,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Avocado', 
  'Fresh avocado, healthy fats',
  2.0, 
  9.0, 
  15.0,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

-- Healthy Fats
INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Almonds', 
  'Raw almonds, nutrient dense nuts',
  21.0, 
  22.0, 
  49.0,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Walnuts', 
  'Raw walnuts, omega-3 rich',
  15.0, 
  14.0, 
  65.0,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Olive Oil', 
  'Extra virgin olive oil',
  0.0, 
  0.0, 
  100.0,
  15,
  'ml',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Peanut Butter', 
  'Natural peanut butter, no added sugar',
  25.0, 
  20.0, 
  50.0,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

-- Dairy & Alternatives
INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Milk', 
  'Low-fat cow milk',
  3.4, 
  5.0, 
  1.0,
  100,
  'ml',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Almond Milk', 
  'Unsweetened almond milk',
  0.5, 
  0.5, 
  1.1,
  100,
  'ml',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Cottage Cheese', 
  'Low-fat cottage cheese',
  11.0, 
  3.4, 
  4.3,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

-- Legumes
INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Black Beans', 
  'Cooked black beans',
  8.9, 
  23.7, 
  0.5,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Chickpeas', 
  'Cooked chickpeas (garbanzo beans)',
  8.9, 
  27.4, 
  2.6,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

INSERT INTO ingredient (name, description, protein, carbs, fat, serving_size, unit, created_by)
SELECT 
  'Lentils', 
  'Cooked lentils, fiber-rich',
  9.0, 
  20.0, 
  0.4,
  100,
  'g',
  (SELECT id FROM "user" WHERE role IN ('nutritionist', 'admin') LIMIT 1);

import type { MenuItem } from "./types"

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Grilled Chicken Power Bowl",
    description: "Grilled chicken breast with quinoa, roasted vegetables, and tahini dressing",
    price: 12.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Bowls",
    baseMacros: {
      protein: 45,
      carbs: 52,
      fats: 18,
      calories: 540,
    },
    customOptions: [
      {
        name: "Choose Your Base",
        choices: [
          { label: "Quinoa", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Brown Rice", macroAdjustment: { protein: -2, carbs: 8, fats: -1, calories: 25 } },
          { label: "Mixed Greens", macroAdjustment: { protein: -3, carbs: -45, fats: 0, calories: -180 } },
        ],
      },
      {
        name: "Protein Size",
        choices: [
          { label: "Regular (6oz)", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Large (9oz)", price: 3.0, macroAdjustment: { protein: 18, carbs: 0, fats: 3, calories: 100 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Add Avocado",
        price: 2.5,
        macroAdjustment: { protein: 2, carbs: 9, fats: 15, calories: 160 },
      },
      {
        name: "Extra Vegetables",
        price: 1.5,
        macroAdjustment: { protein: 2, carbs: 8, fats: 0, calories: 40 },
      },
    ],
  },
  {
    id: "2",
    name: "Salmon Poke Bowl",
    description: "Fresh salmon with sushi rice, edamame, cucumber, and spicy mayo",
    price: 14.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Bowls",
    baseMacros: {
      protein: 38,
      carbs: 58,
      fats: 22,
      calories: 580,
    },
    customOptions: [
      {
        name: "Choose Your Base",
        choices: [
          { label: "Sushi Rice", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Brown Rice", macroAdjustment: { protein: 1, carbs: -2, fats: 1, calories: 5 } },
          { label: "Mixed Greens", macroAdjustment: { protein: -2, carbs: -50, fats: 0, calories: -200 } },
        ],
      },
      {
        name: "Protein Size",
        choices: [
          { label: "Regular (4oz)", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Large (6oz)", price: 4.0, macroAdjustment: { protein: 19, carbs: 0, fats: 11, calories: 165 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Add Avocado",
        price: 2.5,
        macroAdjustment: { protein: 2, carbs: 9, fats: 15, calories: 160 },
      },
      {
        name: "Extra Edamame",
        price: 2.0,
        macroAdjustment: { protein: 8, carbs: 10, fats: 4, calories: 100 },
      },
    ],
  },
  {
    id: "3",
    name: "Mediterranean Wrap",
    description: "Grilled chicken, hummus, feta, tomatoes, and cucumber in a whole wheat wrap",
    price: 10.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Wraps",
    baseMacros: {
      protein: 35,
      carbs: 42,
      fats: 16,
      calories: 450,
    },
    customOptions: [
      {
        name: "Choose Your Protein",
        choices: [
          { label: "Grilled Chicken", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Falafel", macroAdjustment: { protein: -10, carbs: 12, fats: 8, calories: 50 } },
          { label: "Grilled Shrimp", price: 2.5, macroAdjustment: { protein: 5, carbs: 0, fats: -4, calories: -10 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Feta",
        price: 1.5,
        macroAdjustment: { protein: 4, carbs: 1, fats: 6, calories: 75 },
      },
      {
        name: "Add Olives",
        price: 1.0,
        macroAdjustment: { protein: 0, carbs: 2, fats: 5, calories: 50 },
      },
    ],
  },
  {
    id: "4",
    name: "Kale Caesar Salad",
    description: "Massaged kale, parmesan, croutons, and light caesar dressing",
    price: 9.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Salads",
    baseMacros: {
      protein: 12,
      carbs: 28,
      fats: 14,
      calories: 280,
    },
    customOptions: [
      {
        name: "Add Protein",
        choices: [
          { label: "No Protein", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Grilled Chicken", price: 4.0, macroAdjustment: { protein: 30, carbs: 0, fats: 5, calories: 165 } },
          { label: "Grilled Salmon", price: 6.0, macroAdjustment: { protein: 28, carbs: 0, fats: 12, calories: 220 } },
          { label: "Tofu", price: 3.0, macroAdjustment: { protein: 15, carbs: 4, fats: 8, calories: 140 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Parmesan",
        price: 1.5,
        macroAdjustment: { protein: 5, carbs: 1, fats: 7, calories: 85 },
      },
      {
        name: "Add Avocado",
        price: 2.5,
        macroAdjustment: { protein: 2, carbs: 9, fats: 15, calories: 160 },
      },
    ],
  },
  {
    id: "5",
    name: "Steak Burrito Bowl",
    description: "Seasoned steak with cilantro lime rice, black beans, and pico de gallo",
    price: 13.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Bowls",
    baseMacros: {
      protein: 42,
      carbs: 65,
      fats: 20,
      calories: 620,
    },
    customOptions: [
      {
        name: "Choose Your Base",
        choices: [
          { label: "Cilantro Lime Rice", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Brown Rice", macroAdjustment: { protein: 1, carbs: -3, fats: 1, calories: 0 } },
          { label: "Lettuce", macroAdjustment: { protein: -3, carbs: -55, fats: -2, calories: -240 } },
        ],
      },
      {
        name: "Protein Size",
        choices: [
          { label: "Regular (5oz)", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          {
            label: "Double Meat (10oz)",
            price: 5.0,
            macroAdjustment: { protein: 42, carbs: 0, fats: 20, calories: 310 },
          },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Add Guacamole",
        price: 2.5,
        macroAdjustment: { protein: 2, carbs: 9, fats: 15, calories: 160 },
      },
      {
        name: "Extra Cheese",
        price: 1.5,
        macroAdjustment: { protein: 6, carbs: 1, fats: 9, calories: 110 },
      },
      {
        name: "Add Sour Cream",
        price: 1.0,
        macroAdjustment: { protein: 1, carbs: 2, fats: 5, calories: 60 },
      },
    ],
  },
  {
    id: "6",
    name: "Thai Peanut Noodle Bowl",
    description: "Rice noodles with vegetables, tofu, and spicy peanut sauce",
    price: 11.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Bowls",
    baseMacros: {
      protein: 18,
      carbs: 68,
      fats: 22,
      calories: 550,
    },
    customOptions: [
      {
        name: "Choose Your Protein",
        choices: [
          { label: "Tofu", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Chicken", price: 2.0, macroAdjustment: { protein: 15, carbs: 0, fats: -3, calories: 50 } },
          { label: "Shrimp", price: 3.5, macroAdjustment: { protein: 18, carbs: 0, fats: -8, calories: 20 } },
        ],
      },
      {
        name: "Spice Level",
        choices: [
          { label: "Mild", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Medium", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Spicy", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Peanut Sauce",
        price: 1.5,
        macroAdjustment: { protein: 4, carbs: 6, fats: 12, calories: 140 },
      },
      {
        name: "Add Egg",
        price: 2.0,
        macroAdjustment: { protein: 6, carbs: 1, fats: 5, calories: 70 },
      },
    ],
  },
  {
    id: "7",
    name: "Greek Salad",
    description: "Mixed greens, tomatoes, cucumber, olives, feta, and red wine vinaigrette",
    price: 8.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Salads",
    baseMacros: {
      protein: 8,
      carbs: 18,
      fats: 16,
      calories: 250,
    },
    customOptions: [
      {
        name: "Add Protein",
        choices: [
          { label: "No Protein", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Grilled Chicken", price: 4.0, macroAdjustment: { protein: 30, carbs: 0, fats: 5, calories: 165 } },
          { label: "Falafel", price: 3.5, macroAdjustment: { protein: 12, carbs: 18, fats: 10, calories: 200 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Feta",
        price: 1.5,
        macroAdjustment: { protein: 4, carbs: 1, fats: 6, calories: 75 },
      },
      {
        name: "Add Hummus",
        price: 2.0,
        macroAdjustment: { protein: 3, carbs: 12, fats: 8, calories: 120 },
      },
    ],
  },
  {
    id: "8",
    name: "Turkey Club Wrap",
    description: "Sliced turkey, bacon, lettuce, tomato, and avocado mayo in a spinach wrap",
    price: 11.49,
    image: "/placeholder.svg?height=300&width=400",
    category: "Wraps",
    baseMacros: {
      protein: 32,
      carbs: 38,
      fats: 18,
      calories: 440,
    },
    customOptions: [
      {
        name: "Choose Your Wrap",
        choices: [
          { label: "Spinach Wrap", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Whole Wheat Wrap", macroAdjustment: { protein: 1, carbs: 2, fats: 0, calories: 10 } },
          { label: "Lettuce Wrap", macroAdjustment: { protein: -4, carbs: -35, fats: -3, calories: -180 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Bacon",
        price: 2.0,
        macroAdjustment: { protein: 6, carbs: 0, fats: 8, calories: 100 },
      },
      {
        name: "Add Cheese",
        price: 1.5,
        macroAdjustment: { protein: 6, carbs: 1, fats: 9, calories: 110 },
      },
    ],
  },
  {
    id: "9",
    name: "Chocolate Protein Smoothie",
    description: "Muscle support, sustained fuel, extra energy, mood & brain boosting",
    price: 7.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Smoothies",
    baseMacros: {
      protein: 45,
      carbs: 35,
      fats: 6,
      calories: 370,
    },
    customOptions: [
      {
        name: "Base Protein",
        choices: [
          { label: "Chocolate Whey", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          {
            label: "Chocolate Isolate",
            price: 1.5,
            macroAdjustment: { protein: 5, carbs: -3, fats: -2, calories: -5 },
          },
          {
            label: "Vanilla Whey",
            macroAdjustment: { protein: 0, carbs: -2, fats: 0, calories: -8 },
          },
          {
            label: "Vanilla Isolate",
            price: 1.5,
            macroAdjustment: { protein: 5, carbs: -5, fats: -2, calories: -13 },
          },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Scoop",
        maxQuantity: 5,
        choices: [
          {
            label: "None",
            price: 0,
            macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 },
          },
          {
            label: "Chocolate Whey",
            price: 4.0,
            macroAdjustment: { protein: 25, carbs: 3, fats: 2, calories: 130 },
          },
          {
            label: "Vanilla Whey",
            price: 4.0,
            macroAdjustment: { protein: 25, carbs: 3, fats: 2, calories: 130 },
          },
          {
            label: "Chocolate Isolate",
            price: 5.5,
            macroAdjustment: { protein: 30, carbs: 1, fats: 1, calories: 130 },
            description: "Less lactose, carbs & fat",
          },
          {
            label: "Vanilla Isolate",
            price: 5.5,
            macroAdjustment: { protein: 30, carbs: 1, fats: 1, calories: 130 },
            description: "Less lactose, carbs & fat",
          },
          {
            label: "Vegan Protein",
            price: 5.5,
            macroAdjustment: { protein: 22, carbs: 5, fats: 3, calories: 135 },
            description: "Plant-based option",
          },
        ],
      },
      {
        name: "Add Peanut Butter",
        price: 1.5,
        macroAdjustment: { protein: 4, carbs: 6, fats: 8, calories: 100 },
      },
      {
        name: "Add Chia Seeds",
        price: 1.0,
        macroAdjustment: { protein: 2, carbs: 6, fats: 4, calories: 60 },
      },
    ],
  },
  {
    id: "11",
    name: "Mocha Muscle Smoothie",
    description: "Muscle support, sustained fuel, extra energy, mood & brain boosting",
    price: 9.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Smoothies",
    baseMacros: {
      protein: 45,
      carbs: 48,
      fats: 6,
      calories: 430,
    },
    customOptions: [
      {
        name: "Base Protein",
        choices: [
          { label: "Chocolate Whey", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          {
            label: "Chocolate Isolate",
            price: 1.5,
            macroAdjustment: { protein: 5, carbs: -3, fats: -2, calories: -5 },
          },
          {
            label: "Vanilla Whey",
            macroAdjustment: { protein: 0, carbs: -2, fats: 0, calories: -8 },
          },
          {
            label: "Vanilla Isolate",
            price: 1.5,
            macroAdjustment: { protein: 5, carbs: -5, fats: -2, calories: -13 },
          },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Scoop",
        maxQuantity: 5,
        choices: [
          {
            label: "None",
            price: 0,
            macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 },
          },
          {
            label: "Chocolate Whey",
            price: 4.0,
            macroAdjustment: { protein: 25, carbs: 3, fats: 2, calories: 130 },
          },
          {
            label: "Vanilla Whey",
            price: 4.0,
            macroAdjustment: { protein: 25, carbs: 3, fats: 2, calories: 130 },
          },
          {
            label: "Chocolate Isolate",
            price: 5.5,
            macroAdjustment: { protein: 30, carbs: 1, fats: 1, calories: 130 },
            description: "Less lactose, carbs & fat",
          },
          {
            label: "Vanilla Isolate",
            price: 5.5,
            macroAdjustment: { protein: 30, carbs: 1, fats: 1, calories: 130 },
            description: "Less lactose, carbs & fat",
          },
          {
            label: "Vegan Protein",
            price: 5.5,
            macroAdjustment: { protein: 22, carbs: 5, fats: 3, calories: 135 },
            description: "Plant-based option",
          },
        ],
      },
      {
        name: "Add Peanut Butter",
        price: 1.5,
        macroAdjustment: { protein: 4, carbs: 6, fats: 8, calories: 100 },
      },
      {
        name: "Add Chia Seeds",
        price: 1.0,
        macroAdjustment: { protein: 2, carbs: 6, fats: 4, calories: 60 },
      },
    ],
  },
  {
    id: "12",
    name: "Green Power Smoothie",
    description: "Energy boost, detox support, immune system enhancement, digestive health",
    price: 6.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Smoothies",
    baseMacros: {
      protein: 8,
      carbs: 42,
      fats: 3,
      calories: 220,
    },
    customOptions: [
      {
        name: "Base Protein",
        choices: [
          { label: "No Protein", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          {
            label: "Vanilla Whey",
            price: 2.0,
            macroAdjustment: { protein: 25, carbs: 3, fats: 2, calories: 130 },
          },
          {
            label: "Vanilla Isolate",
            price: 3.5,
            macroAdjustment: { protein: 30, carbs: 1, fats: 1, calories: 130 },
          },
          {
            label: "Vegan Protein",
            price: 3.5,
            macroAdjustment: { protein: 22, carbs: 5, fats: 3, calories: 135 },
          },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Scoop",
        maxQuantity: 5,
        choices: [
          {
            label: "None",
            price: 0,
            macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 },
          },
          {
            label: "Vanilla Whey",
            price: 4.0,
            macroAdjustment: { protein: 25, carbs: 3, fats: 2, calories: 130 },
          },
          {
            label: "Vanilla Isolate",
            price: 5.5,
            macroAdjustment: { protein: 30, carbs: 1, fats: 1, calories: 130 },
            description: "Less lactose, carbs & fat",
          },
          {
            label: "Vegan Protein",
            price: 5.5,
            macroAdjustment: { protein: 22, carbs: 5, fats: 3, calories: 135 },
            description: "Plant-based option",
          },
        ],
      },
      {
        name: "Add Spirulina",
        price: 1.5,
        macroAdjustment: { protein: 4, carbs: 2, fats: 1, calories: 30 },
      },
      {
        name: "Add Flax Seeds",
        price: 1.0,
        macroAdjustment: { protein: 2, carbs: 3, fats: 4, calories: 55 },
      },
    ],
  },
  {
    id: "12",
    name: "Spicy Tuna Rice Bowl",
    description: "Seared ahi tuna with jasmine rice, sriracha mayo, and Asian slaw",
    price: 15.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Bowls",
    baseMacros: {
      protein: 42,
      carbs: 55,
      fats: 20,
      calories: 560,
    },
    customOptions: [
      {
        name: "Spice Level",
        choices: [
          { label: "Mild", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Medium", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Extra Spicy", macroAdjustment: { protein: 0, carbs: 1, fats: 1, calories: 10 } },
        ],
      },
      {
        name: "Protein Size",
        choices: [
          { label: "Regular (5oz)", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Large (7oz)", price: 4.5, macroAdjustment: { protein: 20, carbs: 0, fats: 8, calories: 140 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Add Seaweed Salad",
        price: 2.0,
        macroAdjustment: { protein: 1, carbs: 7, fats: 0, calories: 35 },
      },
      {
        name: "Extra Avocado",
        price: 2.5,
        macroAdjustment: { protein: 2, carbs: 9, fats: 15, calories: 160 },
      },
    ],
  },
  {
    id: "13",
    name: "BBQ Pulled Chicken Wrap",
    description: "Slow-cooked chicken in BBQ sauce with coleslaw in a spinach wrap",
    price: 11.49,
    image: "/placeholder.svg?height=300&width=400",
    category: "Wraps",
    baseMacros: {
      protein: 38,
      carbs: 48,
      fats: 14,
      calories: 460,
    },
    customOptions: [
      {
        name: "Wrap Type",
        choices: [
          { label: "Spinach Wrap", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Whole Wheat", macroAdjustment: { protein: 2, carbs: 3, fats: 0, calories: 20 } },
          { label: "Low-Carb Wrap", macroAdjustment: { protein: 5, carbs: -30, fats: 2, calories: -100 } },
        ],
      },
      {
        name: "Sauce Amount",
        choices: [
          { label: "Light", macroAdjustment: { protein: 0, carbs: -5, fats: 0, calories: -20 } },
          { label: "Regular", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Extra", price: 0.5, macroAdjustment: { protein: 0, carbs: 8, fats: 1, calories: 40 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Add Cheese",
        price: 1.5,
        macroAdjustment: { protein: 7, carbs: 1, fats: 9, calories: 110 },
      },
      {
        name: "Extra Chicken",
        price: 3.5,
        macroAdjustment: { protein: 20, carbs: 0, fats: 3, calories: 110 },
      },
    ],
  },
  {
    id: "14",
    name: "Asian Beef Stir-Fry Bowl",
    description: "Lean beef strips with mixed vegetables, teriyaki sauce over brown rice",
    price: 13.49,
    image: "/placeholder.svg?height=300&width=400",
    category: "Bowls",
    baseMacros: {
      protein: 40,
      carbs: 60,
      fats: 16,
      calories: 540,
    },
    customOptions: [
      {
        name: "Choose Your Base",
        choices: [
          { label: "Brown Rice", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "White Rice", macroAdjustment: { protein: -1, carbs: 5, fats: 0, calories: 15 } },
          { label: "Cauliflower Rice", macroAdjustment: { protein: -2, carbs: -48, fats: 0, calories: -190 } },
          { label: "Noodles", price: 1.0, macroAdjustment: { protein: 3, carbs: 10, fats: 2, calories: 70 } },
        ],
      },
      {
        name: "Protein Size",
        choices: [
          { label: "Regular (5oz)", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Large (8oz)", price: 4.0, macroAdjustment: { protein: 24, carbs: 0, fats: 10, calories: 180 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Add Egg",
        price: 1.5,
        macroAdjustment: { protein: 6, carbs: 1, fats: 5, calories: 70 },
      },
      {
        name: "Extra Vegetables",
        price: 2.0,
        macroAdjustment: { protein: 2, carbs: 8, fats: 0, calories: 40 },
      },
      {
        name: "Add Cashews",
        price: 1.5,
        macroAdjustment: { protein: 3, carbs: 5, fats: 8, calories: 100 },
      },
    ],
  },
  {
    id: "15",
    name: "Greek Chicken Salad",
    description: "Grilled chicken, feta, olives, tomatoes, cucumber with tzatziki dressing",
    price: 11.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Salads",
    baseMacros: {
      protein: 36,
      carbs: 18,
      fats: 22,
      calories: 420,
    },
    customOptions: [
      {
        name: "Protein Size",
        choices: [
          { label: "Regular (5oz)", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Large (8oz)", price: 3.0, macroAdjustment: { protein: 18, carbs: 0, fats: 3, calories: 100 } },
        ],
      },
      {
        name: "Dressing Amount",
        choices: [
          { label: "Light", macroAdjustment: { protein: 0, carbs: -2, fats: -5, calories: -50 } },
          { label: "Regular", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Extra", price: 0.5, macroAdjustment: { protein: 1, carbs: 3, fats: 8, calories: 85 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Feta",
        price: 2.0,
        macroAdjustment: { protein: 6, carbs: 1, fats: 8, calories: 100 },
      },
      {
        name: "Add Chickpeas",
        price: 1.5,
        macroAdjustment: { protein: 7, carbs: 20, fats: 3, calories: 135 },
      },
      {
        name: "Add Pita Bread",
        price: 1.0,
        macroAdjustment: { protein: 3, carbs: 18, fats: 1, calories: 90 },
      },
    ],
  },
  {
    id: "16",
    name: "Turkey Club Wrap",
    description: "Roasted turkey breast, bacon, lettuce, tomato with honey mustard",
    price: 10.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Wraps",
    baseMacros: {
      protein: 32,
      carbs: 38,
      fats: 18,
      calories: 440,
    },
    customOptions: [
      {
        name: "Wrap Type",
        choices: [
          { label: "Whole Wheat", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Spinach Wrap", macroAdjustment: { protein: -1, carbs: -2, fats: 0, calories: -10 } },
          { label: "Tomato Basil", macroAdjustment: { protein: 0, carbs: 1, fats: 0, calories: 5 } },
        ],
      },
      {
        name: "Bacon",
        choices: [
          { label: "Regular", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Extra Crispy", macroAdjustment: { protein: 1, carbs: 0, fats: 2, calories: 25 } },
          { label: "Turkey Bacon", macroAdjustment: { protein: 2, carbs: 0, fats: -5, calories: -40 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Add Avocado",
        price: 2.5,
        macroAdjustment: { protein: 2, carbs: 9, fats: 15, calories: 160 },
      },
      {
        name: "Add Cheese",
        price: 1.5,
        macroAdjustment: { protein: 7, carbs: 1, fats: 9, calories: 110 },
      },
      {
        name: "Extra Turkey",
        price: 3.0,
        macroAdjustment: { protein: 15, carbs: 0, fats: 2, calories: 80 },
      },
    ],
  },
  {
    id: "17",
    name: "Shrimp Buddha Bowl",
    description: "Garlic shrimp with sweet potato, broccoli, and ginger-tahini dressing",
    price: 14.49,
    image: "/placeholder.svg?height=300&width=400",
    category: "Bowls",
    baseMacros: {
      protein: 35,
      carbs: 52,
      fats: 15,
      calories: 480,
    },
    customOptions: [
      {
        name: "Shrimp Size",
        choices: [
          { label: "Regular (6 pieces)", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Large (10 pieces)", price: 4.0, macroAdjustment: { protein: 20, carbs: 0, fats: 4, calories: 115 } },
        ],
      },
      {
        name: "Choose Your Base",
        choices: [
          { label: "Sweet Potato", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Mixed Greens", macroAdjustment: { protein: -1, carbs: -45, fats: 0, calories: -180 } },
          { label: "Quinoa", macroAdjustment: { protein: 3, carbs: 2, fats: 2, calories: 35 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Add Avocado",
        price: 2.5,
        macroAdjustment: { protein: 2, carbs: 9, fats: 15, calories: 160 },
      },
      {
        name: "Extra Vegetables",
        price: 2.0,
        macroAdjustment: { protein: 2, carbs: 8, fats: 0, calories: 40 },
      },
      {
        name: "Add Sesame Seeds",
        price: 0.5,
        macroAdjustment: { protein: 1, carbs: 1, fats: 3, calories: 35 },
      },
    ],
  },
  {
    id: "18",
    name: "Mango Coconut Smoothie",
    description: "Mango, coconut milk, Greek yogurt, and tropical fruit blend",
    price: 8.49,
    image: "/placeholder.svg?height=300&width=400",
    category: "Smoothies",
    baseMacros: {
      protein: 18,
      carbs: 48,
      fats: 12,
      calories: 360,
    },
    customOptions: [
      {
        name: "Size",
        choices: [
          { label: "Regular (16oz)", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Large (24oz)", price: 2.0, macroAdjustment: { protein: 9, carbs: 24, fats: 6, calories: 180 } },
        ],
      },
      {
        name: "Sweetness",
        choices: [
          { label: "No Added Sugar", macroAdjustment: { protein: 0, carbs: -10, fats: 0, calories: -40 } },
          { label: "Light Honey", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Extra Sweet", macroAdjustment: { protein: 0, carbs: 15, fats: 0, calories: 60 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Add Protein Powder",
        price: 2.5,
        macroAdjustment: { protein: 20, carbs: 3, fats: 1, calories: 100 },
      },
      {
        name: "Add Chia Seeds",
        price: 1.0,
        macroAdjustment: { protein: 2, carbs: 6, fats: 5, calories: 70 },
      },
      {
        name: "Add Collagen",
        price: 2.0,
        macroAdjustment: { protein: 10, carbs: 0, fats: 0, calories: 40 },
      },
    ],
  },
  {
    id: "19",
    name: "Kale Caesar Salad",
    description: "Massaged kale, parmesan, whole grain croutons with Caesar dressing",
    price: 10.49,
    image: "/placeholder.svg?height=300&width=400",
    category: "Salads",
    baseMacros: {
      protein: 12,
      carbs: 28,
      fats: 20,
      calories: 340,
    },
    customOptions: [
      {
        name: "Add Protein",
        choices: [
          { label: "No Protein", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Grilled Chicken", price: 4.0, macroAdjustment: { protein: 30, carbs: 0, fats: 5, calories: 170 } },
          { label: "Grilled Salmon", price: 5.0, macroAdjustment: { protein: 25, carbs: 0, fats: 12, calories: 210 } },
          { label: "Tofu", price: 3.0, macroAdjustment: { protein: 16, carbs: 4, fats: 8, calories: 145 } },
        ],
      },
      {
        name: "Dressing Amount",
        choices: [
          { label: "Light", macroAdjustment: { protein: 0, carbs: -2, fats: -6, calories: -60 } },
          { label: "Regular", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Extra", price: 0.5, macroAdjustment: { protein: 1, carbs: 2, fats: 10, calories: 100 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Parmesan",
        price: 1.5,
        macroAdjustment: { protein: 8, carbs: 1, fats: 7, calories: 100 },
      },
      {
        name: "Add Avocado",
        price: 2.5,
        macroAdjustment: { protein: 2, carbs: 9, fats: 15, calories: 160 },
      },
    ],
  },
  {
    id: "20",
    name: "Chocolate Peanut Butter Smoothie",
    description: "Chocolate protein, peanut butter, banana, and almond milk",
    price: 8.99,
    image: "/placeholder.svg?height=300&width=400",
    category: "Smoothies",
    baseMacros: {
      protein: 28,
      carbs: 42,
      fats: 16,
      calories: 420,
    },
    customOptions: [
      {
        name: "Size",
        choices: [
          { label: "Regular (16oz)", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Large (24oz)", price: 2.0, macroAdjustment: { protein: 14, carbs: 21, fats: 8, calories: 210 } },
        ],
      },
      {
        name: "Milk Base",
        choices: [
          { label: "Almond Milk", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
          { label: "Oat Milk", macroAdjustment: { protein: 0, carbs: 8, fats: 1, calories: 40 } },
          { label: "Whole Milk", macroAdjustment: { protein: 4, carbs: 6, fats: 4, calories: 75 } },
        ],
      },
    ],
    extraOptions: [
      {
        name: "Extra Peanut Butter",
        price: 1.5,
        macroAdjustment: { protein: 4, carbs: 4, fats: 8, calories: 100 },
        maxQuantity: 2,
      },
      {
        name: "Add Cacao Nibs",
        price: 1.0,
        macroAdjustment: { protein: 1, carbs: 4, fats: 4, calories: 55 },
      },
      {
        name: "Add Espresso Shot",
        price: 1.5,
        macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 5 },
      },
    ],
  },
]

export const CATEGORIES = ["All", "Bowls", "Salads", "Wraps", "Smoothies"]

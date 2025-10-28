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
]

export const CATEGORIES = ["All", "Bowls", "Salads", "Wraps", "Smoothies"]

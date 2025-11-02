import { pgTable, text, timestamp, boolean, integer, real, jsonb, uuid } from "drizzle-orm/pg-core";

// Auth Tables
export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  role: text("role", { enum: ["member", "admin", "nutritionist"] }).default("member").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Menu Tables
export const menuItem = pgTable("menu_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  // Store base macros as JSON
  baseMacros: jsonb("base_macros").notNull().$type<{
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }>(),
  // Store custom options as JSON array
  customOptions: jsonb("custom_options").$type<Array<{
    name: string;
    choices: Array<{
      label: string;
      price?: number;
      macroAdjustment: {
        protein: number;
        carbs: number;
        fats: number;
        calories: number;
      };
    }>;
  }>>(),
  // Store extra options as JSON array
  extraOptions: jsonb("extra_options").$type<Array<{
    name: string;
    price?: number;
    macroAdjustment?: {
      protein: number;
      carbs: number;
      fats: number;
      calories: number;
    };
    maxQuantity?: number;
    choices?: Array<{
      label: string;
      price: number;
      macroAdjustment: {
        protein: number;
        carbs: number;
        fats: number;
        calories: number;
      };
      description?: string;
    }>;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Order Tables
export const order = pgTable("order", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(), // Human-readable: ORD-001
  userId: uuid("user_id").references(() => user.id, { onDelete: "set null" }), // Nullable for guest orders
  
  // Customer Info (for guest orders)
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  
  // Order Details
  status: text("status").notNull().default("pending"), // pending, confirmed, preparing, ready, completed, cancelled
  orderType: text("order_type").notNull().default("pickup"), // pickup, dine-in, delivery
  tableNumber: text("table_number"), // For dine-in orders
  
  // Payment
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
  paymentMethod: text("payment_method"), // xendit, cash, card
  xenditInvoiceId: text("xendit_invoice_id"),
  xenditInvoiceUrl: text("xendit_invoice_url"),
  
  // Pricing
  subtotal: real("subtotal").notNull(),
  tax: real("tax").notNull().default(0),
  discount: real("discount").notNull().default(0),
  totalPrice: real("total_price").notNull(),
  
  // Nutrition totals
  totalMacros: jsonb("total_macros").notNull().$type<{
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }>(),
  
  // Notes & Instructions
  specialInstructions: text("special_instructions"),
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  confirmedAt: timestamp("confirmed_at"),
  preparingAt: timestamp("preparing_at"),
  readyAt: timestamp("ready_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
});

export const orderItem = pgTable("order_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItem.id, { onDelete: "restrict" }),
  menuItemSnapshot: jsonb("menu_item_snapshot").notNull().$type<{
    name: string;
    description: string;
    price: number;
    image: string;
  }>(),
  selectedCustomOptions: jsonb("selected_custom_options").notNull().$type<Record<string, string>>(),
  selectedExtraOptions: jsonb("selected_extra_options").notNull().$type<Record<string, number>>(),
  quantity: integer("quantity").notNull(),
  totalPrice: real("total_price").notNull(),
  totalMacros: jsonb("total_macros").notNull().$type<{
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ingredient Tables
export const ingredient = pgTable("ingredient", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { 
    enum: ["protein", "carbs", "vegetables", "fruits", "fats", "dairy", "legumes", "dressing", "other"] 
  }).notNull().default("other"), // Ingredient category/source
  protein: real("protein").notNull(), // in grams
  carbs: real("carbs").notNull(), // in grams
  fat: real("fat").notNull(), // in grams
  // kcal will be computed: (protein * 4) + (carbs * 4) + (fat * 9)
  servingSize: real("serving_size").notNull().default(100), // in grams
  unit: text("unit").notNull().default("g"), // g, ml, piece, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Meal Plan Tables
export const mealPlan = pgTable("meal_plan", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // The member receiving the plan
  nutritionistId: uuid("nutritionist_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // The nutritionist who created it
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status", { enum: ["draft", "active", "completed", "cancelled"] }).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const mealPlanDay = pgTable("meal_plan_day", {
  id: uuid("id").primaryKey().defaultRandom(),
  mealPlanId: uuid("meal_plan_id")
    .notNull()
    .references(() => mealPlan.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(), // 1-7 for a week plan
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Composed Meal (e.g., "Chicken Soba Veggie Bowl")
export const mealPlanDayMeal = pgTable("meal_plan_day_meal", {
  id: uuid("id").primaryKey().defaultRandom(),
  mealPlanDayId: uuid("meal_plan_day_id")
    .notNull()
    .references(() => mealPlanDay.id, { onDelete: "cascade" }),
  mealType: text("meal_type", { enum: ["breakfast", "lunch", "dinner", "snack"] }).notNull(),
  mealName: text("meal_name").notNull(), // e.g., "Chicken Soba Veggie Bowl"
  notes: text("notes"), // Preparation instructions or serving suggestions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ingredients within a composed meal
export const mealPlanDayMealIngredient = pgTable("meal_plan_day_meal_ingredient", {
  id: uuid("id").primaryKey().defaultRandom(),
  mealId: uuid("meal_id")
    .notNull()
    .references(() => mealPlanDayMeal.id, { onDelete: "cascade" }),
  ingredientId: uuid("ingredient_id")
    .notNull()
    .references(() => ingredient.id, { onDelete: "restrict" }),
  quantity: real("quantity").notNull(), // Quantity based on ingredient's unit
  preparationNote: text("preparation_note"), // e.g., "Sautéed", "Sliced", "Sous Vide"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


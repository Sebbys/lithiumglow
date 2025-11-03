CREATE TABLE "ingredient" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"category" text NOT NULL,
	"protein" real NOT NULL,
	"carbs" real NOT NULL,
	"fat" real NOT NULL,
	"sugar" real DEFAULT 0,
	"fiber" real DEFAULT 0,
	"kcal" real NOT NULL,
	"serving_size_g" real NOT NULL,
	"serving_label" text NOT NULL,
	"price_per_serving" integer NOT NULL,
	"meal_types" jsonb,
	"cuisine" jsonb,
	"diet_tags" jsonb,
	"allergens" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"last_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	"nutritionist_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_day" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_plan_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"date" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_day_meal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_plan_day_id" uuid NOT NULL,
	"meal_type" text NOT NULL,
	"meal_name" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_day_meal_ingredient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"quantity" real NOT NULL,
	"preparation_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "menu_item" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "menu_item" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "order_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "menu_item_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "order_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "customer_name" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "customer_email" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "customer_phone" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "order_type" text DEFAULT 'pickup' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "table_number" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "xendit_invoice_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "xendit_invoice_url" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "subtotal" real NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "tax" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "discount" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "special_instructions" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "preparing_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "ready_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "meal_plan" ADD CONSTRAINT "meal_plan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan" ADD CONSTRAINT "meal_plan_nutritionist_id_user_id_fk" FOREIGN KEY ("nutritionist_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_day" ADD CONSTRAINT "meal_plan_day_meal_plan_id_meal_plan_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_day_meal" ADD CONSTRAINT "meal_plan_day_meal_meal_plan_day_id_meal_plan_day_id_fk" FOREIGN KEY ("meal_plan_day_id") REFERENCES "public"."meal_plan_day"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_day_meal_ingredient" ADD CONSTRAINT "meal_plan_day_meal_ingredient_meal_id_meal_plan_day_meal_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meal_plan_day_meal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_day_meal_ingredient" ADD CONSTRAINT "meal_plan_day_meal_ingredient_ingredient_id_ingredient_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredient"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_order_number_unique" UNIQUE("order_number");
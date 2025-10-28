import { db } from "@/db/drizzle"
import { sql } from "drizzle-orm"

async function resetDatabase() {
  console.log("🗑️  Resetting database...")

  try {
    // Drop all tables in the correct order (respecting foreign key constraints)
    await db.execute(sql`DROP TABLE IF EXISTS order_item CASCADE`)
    console.log("✅ Dropped order_item table")
    
    await db.execute(sql`DROP TABLE IF EXISTS "order" CASCADE`)
    console.log("✅ Dropped order table")
    
    await db.execute(sql`DROP TABLE IF EXISTS menu_item CASCADE`)
    console.log("✅ Dropped menu_item table")
    
    await db.execute(sql`DROP TABLE IF EXISTS account CASCADE`)
    console.log("✅ Dropped account table")
    
    await db.execute(sql`DROP TABLE IF EXISTS session CASCADE`)
    console.log("✅ Dropped session table")
    
    await db.execute(sql`DROP TABLE IF EXISTS verification CASCADE`)
    console.log("✅ Dropped verification table")
    
    await db.execute(sql`DROP TABLE IF EXISTS "user" CASCADE`)
    console.log("✅ Dropped user table")

    console.log("\n✨ Database reset complete! Now run 'npm run db:push' to recreate tables with UUID.")
  } catch (error) {
    console.error("❌ Error resetting database:", error)
    process.exit(1)
  }
}

resetDatabase()

import { db } from "@/db/drizzle"
import { menuItem } from "@/db/schema"
import { MENU_ITEMS } from "@/lib/menu-data"

async function seedMenu() {
  console.log("🌱 Seeding menu items...")

  try {
    // Insert all menu items
    for (const item of MENU_ITEMS) {
      await db.insert(menuItem).values({
        // UUID will be auto-generated
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        baseMacros: item.baseMacros,
        customOptions: item.customOptions || null,
        extraOptions: item.extraOptions || null,
      })
      console.log(`✅ Inserted: ${item.name}`)
    }

    console.log(`\n✨ Successfully seeded ${MENU_ITEMS.length} menu items!`)
  } catch (error) {
    console.error("❌ Error seeding menu items:", error)
    process.exit(1)
  }
}

seedMenu()

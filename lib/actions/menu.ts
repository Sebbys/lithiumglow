"use server"

import { db } from "@/db/drizzle"
import { menuItem } from "@/db/schema"
import type { MenuItem } from "@/lib/types"
import { eq } from "drizzle-orm"

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const items = await db.select().from(menuItem)
    return items as MenuItem[]
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return []
  }
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  try {
    const items = await db.select().from(menuItem).where(eq(menuItem.id, id))
    return items[0] as MenuItem || null
  } catch (error) {
    console.error("Error fetching menu item:", error)
    return null
  }
}

export async function getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
  try {
    if (category === "All") {
      return getMenuItems()
    }
    const items = await db.select().from(menuItem).where(eq(menuItem.category, category))
    return items as MenuItem[]
  } catch (error) {
    console.error("Error fetching menu items by category:", error)
    return []
  }
}

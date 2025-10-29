"use server"

import { db } from "@/db/drizzle"
import { menuItem } from "@/db/schema"
import type { MenuItem } from "@/lib/types"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function createMenuItem(data: Omit<MenuItem, "id">): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Let the database generate the UUID automatically (defaultRandom())
    const [inserted] = await db.insert(menuItem).values({
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      category: data.category,
      baseMacros: data.baseMacros,
      customOptions: data.customOptions || null,
      extraOptions: data.extraOptions || null,
    }).returning({ id: menuItem.id })
    
    revalidatePath("/")
    revalidatePath("/admin")
    
    return { success: true, id: inserted.id }
  } catch (error) {
    console.error("Error creating menu item:", error)
    return { success: false, error: "Failed to create menu item" }
  }
}

export async function updateMenuItem(id: string, data: MenuItem): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(menuItem)
      .set({
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        baseMacros: data.baseMacros,
        customOptions: data.customOptions || null,
        extraOptions: data.extraOptions || null,
        updatedAt: new Date(),
      })
      .where(eq(menuItem.id, id))
    
    revalidatePath("/")
    revalidatePath("/admin")
    
    return { success: true }
  } catch (error) {
    console.error("Error updating menu item:", error)
    return { success: false, error: "Failed to update menu item" }
  }
}

export async function deleteMenuItem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(menuItem).where(eq(menuItem.id, id))
    
    revalidatePath("/")
    revalidatePath("/admin")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return { success: false, error: "Failed to delete menu item" }
  }
}

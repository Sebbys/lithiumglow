import { cache } from 'react'
import 'server-only'
import { db } from '@/db/drizzle'
import { menuItem } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { MenuItem } from './types'

/**
 * Cached function to fetch all menu items from the database
 * Uses React's cache() to deduplicate requests within a single render pass
 * Per Next.js 16 best practices for server-side data fetching
 */
export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
  try {
    const items = await db.select().from(menuItem)
    return items as MenuItem[]
  } catch (error) {
    console.error('Failed to fetch menu items:', error)
    return []
  }
})

/**
 * Cached function to fetch a single menu item by ID
 * Automatically deduplicated if called multiple times with the same ID
 */
export const getMenuItem = cache(async (id: string): Promise<MenuItem | null> => {
  try {
    const items = await db.select().from(menuItem).where(eq(menuItem.id, id))
    return items[0] as MenuItem || null
  } catch (error) {
    console.error('Failed to fetch menu item:', error)
    return null
  }
})

/**
 * Preload function for menu items
 * Call this early to start fetching before the component needs the data
 * Example: preloadMenuItems() in a parent component
 */
export const preloadMenuItems = () => {
  void getMenuItems()
}

/**
 * Preload function for a specific menu item
 */
export const preloadMenuItem = (id: string) => {
  void getMenuItem(id)
}

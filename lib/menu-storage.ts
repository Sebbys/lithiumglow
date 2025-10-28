import type { MenuItem } from "./types"
import { MENU_ITEMS } from "./menu-data"

const STORAGE_KEY = "food-ordering-menu-items"

export function getMenuItems(): MenuItem[] {
  if (typeof window === "undefined") return MENU_ITEMS

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return MENU_ITEMS
    }
  }
  return MENU_ITEMS
}

export function saveMenuItems(items: MenuItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addMenuItem(item: MenuItem): void {
  const items = getMenuItems()
  items.push(item)
  saveMenuItems(items)
}

export function updateMenuItem(id: string, updatedItem: MenuItem): void {
  const items = getMenuItems()
  const index = items.findIndex((item) => item.id === id)
  if (index !== -1) {
    items[index] = updatedItem
    saveMenuItems(items)
  }
}

export function deleteMenuItem(id: string): void {
  const items = getMenuItems()
  const filtered = items.filter((item) => item.id !== id)
  saveMenuItems(filtered)
}

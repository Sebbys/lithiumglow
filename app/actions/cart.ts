'use server'

import { db } from '@/db/drizzle'
import { menuItem } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { calculateTotalPrice, calculateTotalMacros } from '@/lib/macro-calculator'
import type { MenuItem } from '@/lib/types'

export interface ClientCartItem {
  menuItemId: string
  quantity: number
  selectedCustomOptions: Record<string, string>
  selectedExtraOptions: Record<string, number>
  // Client may send these, but we'll recalculate them
  clientTotalPrice?: number
  clientTotalMacros?: {
    protein: number
    carbs: number
    fats: number
    calories: number
  }
}

export interface VerifiedCartItem {
  menuItem: MenuItem
  quantity: number
  selectedCustomOptions: Record<string, string>
  selectedExtraOptions: Record<string, number>
  verifiedPrice: number
  totalPrice: number // verifiedPrice * quantity
  totalMacros: {
    protein: number
    carbs: number
    fats: number
    calories: number
  }
  priceMismatch: boolean // Track if client tried to manipulate price
}

export interface VerifiedCart {
  items: VerifiedCartItem[]
  subtotal: number
  tax: number
  total: number
  tamperedItems: string[] // List of items with price mismatches
}

/**
 * SECURITY: This function verifies all cart items and recalculates prices from the database.
 * NEVER trust client-sent prices. Always recalculate from source of truth (database).
 */
export async function verifyCart(cartItems: ClientCartItem[]): Promise<VerifiedCart> {
  const verifiedItems: VerifiedCartItem[] = []
  const tamperedItems: string[] = []
  let subtotal = 0

  for (const item of cartItems) {
    // Fetch menu item from database (source of truth)
    const [dbItem] = await db
      .select()
      .from(menuItem)
      .where(eq(menuItem.id, item.menuItemId))
      .limit(1)

    if (!dbItem) {
      throw new Error(`Invalid menu item: ${item.menuItemId}`)
    }

    // Validate quantity
    if (item.quantity <= 0 || item.quantity > 99) {
      throw new Error(`Invalid quantity for ${dbItem.name}: ${item.quantity}`)
    }

    // Convert DB item to MenuItem type
    const menuItemData: MenuItem = {
      id: dbItem.id,
      name: dbItem.name,
      description: dbItem.description,
      price: dbItem.price,
      image: dbItem.image,
      category: dbItem.category,
      baseMacros: dbItem.baseMacros as {
        protein: number
        carbs: number
        fats: number
        calories: number
      },
      customOptions: dbItem.customOptions as MenuItem['customOptions'],
      extraOptions: dbItem.extraOptions as MenuItem['extraOptions'],
    }

    // Recalculate price from database data (NEVER trust client)
    const verifiedPrice = calculateTotalPrice(
      menuItemData,
      item.selectedCustomOptions,
      item.selectedExtraOptions
    )

    // Calculate total macros
    const totalMacros = calculateTotalMacros(
      menuItemData,
      item.selectedCustomOptions,
      item.selectedExtraOptions
    )

    const totalPrice = verifiedPrice * item.quantity

    // Check if client tried to manipulate price
    const priceMismatch = item.clientTotalPrice !== undefined && 
      Math.abs((item.clientTotalPrice / item.quantity) - verifiedPrice) > 0.01

    if (priceMismatch) {
      tamperedItems.push(dbItem.name)
      console.warn('⚠️ SECURITY: Price mismatch detected!', {
        itemName: dbItem.name,
        clientPrice: item.clientTotalPrice,
        verifiedPrice: verifiedPrice * item.quantity,
        difference: (item.clientTotalPrice ?? 0) - (verifiedPrice * item.quantity)
      })
    }

    verifiedItems.push({
      menuItem: menuItemData,
      quantity: item.quantity,
      selectedCustomOptions: item.selectedCustomOptions,
      selectedExtraOptions: item.selectedExtraOptions,
      verifiedPrice,
      totalPrice,
      totalMacros,
      priceMismatch
    })

    subtotal += totalPrice
  }

  // Calculate tax (example: 8% - adjust based on your requirements)
  const tax = subtotal * 0.08

  // Calculate total
  const total = subtotal + tax

  return {
    items: verifiedItems,
    subtotal,
    tax,
    total,
    tamperedItems
  }
}

/**
 * Get a single menu item by ID for verification
 */
export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const [dbItem] = await db
    .select()
    .from(menuItem)
    .where(eq(menuItem.id, id))
    .limit(1)

  if (!dbItem) {
    return null
  }

  return {
    id: dbItem.id,
    name: dbItem.name,
    description: dbItem.description,
    price: dbItem.price,
    image: dbItem.image,
    category: dbItem.category,
    baseMacros: dbItem.baseMacros as {
      protein: number
      carbs: number
      fats: number
      calories: number
    },
    customOptions: dbItem.customOptions as MenuItem['customOptions'],
    extraOptions: dbItem.extraOptions as MenuItem['extraOptions'],
  }
}

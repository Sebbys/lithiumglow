import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price in Indonesian Rupiah (IDR)
 * @param price - The price in IDR
 * @returns Formatted string like "Rp 15.000"
 */
export function formatIDR(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`
}

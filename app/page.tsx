"use client"

import { useState, useEffect } from "react"
import { MenuItemCard } from "@/components/menu-card-item"
import { ShoppingCart } from "@/components/shopping-cart"
import { Button } from "@/components/ui/button"
import { ShoppingCartIcon } from "lucide-react"
import { getMenuItems } from "@/lib/menu-storage"
import { CATEGORIES } from "@/lib/menu-data"
import type { MenuItem, CartItem } from "@/lib/types"
import { calculateTotalMacros, calculateTotalPrice } from "@/lib/macro-calculator"
import Link from "next/link"
import { toast } from "sonner"

export default function HomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    setMenuItems(getMenuItems())
  }, [])

  const filteredItems =
    selectedCategory === "All" ? menuItems : menuItems.filter((item) => item.category === selectedCategory)

  const handleAddToCart = (
    menuItem: MenuItem,
    selectedCustomOptions: Record<string, string>,
    selectedExtraOptions: Record<string, number>,
    quantity: number,
  ) => {
    const totalMacros = calculateTotalMacros(menuItem, selectedCustomOptions, selectedExtraOptions)
    const totalPrice = calculateTotalPrice(menuItem, selectedCustomOptions, selectedExtraOptions)

    const cartItem: CartItem = {
      menuItem,
      selectedCustomOptions,
      selectedExtraOptions,
      totalMacros,
      totalPrice,
      quantity,
    }

    setCart((prev) => [...prev, cartItem])
    toast.success(
       "Added to cart",
      {description: `${quantity}x ${menuItem.name}`},
    )
  }

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
    toast.error(
       "Removed from cart",)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(
        "Cart is empty",
        {description: "Add items to your cart before checking out"}
      )
      return
    }

    localStorage.setItem("checkout-cart", JSON.stringify(cart))
    window.location.href = "/checkout"
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-600">FitBite</h1>
              <p className="text-sm text-muted-foreground">Healthy meals, tracked macros</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setCartOpen(true)}>
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                Cart ({totalCartItems})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Our Menu</h2>
          <p className="text-muted-foreground">Customize each item and see real-time macro adjustments.</p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      <ShoppingCart
        cart={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  )
}

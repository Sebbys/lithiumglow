"use client"

import { useState } from "react"
import { MenuItemCard } from "./menu-card-item"
import { ShoppingCart } from "./shopping-cart"
import { Button } from "./ui/button"
import { ShoppingCartIcon } from "lucide-react"
import { CATEGORIES } from "@/lib/menu-data"
import type { MenuItem, CartItem } from "@/lib/types"
import { calculateTotalMacros, calculateTotalPrice } from "@/lib/macro-calculator"
import { toast } from "sonner"

interface MenuListProps {
  initialItems: MenuItem[]
}

export function MenuList({ initialItems }: MenuListProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const filteredItems =
    selectedCategory === "All" 
      ? initialItems 
      : initialItems.filter((item) => item.category === selectedCategory)

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
      { description: `${quantity}x ${menuItem.name}` },
    )
  }

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
    toast.error("Removed from cart")
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(
        "Cart is empty",
        { description: "Add items to your cart before checking out" }
      )
      return
    }

    localStorage.setItem("checkout-cart", JSON.stringify(cart))
    window.location.href = "/checkout"
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found in this category.</p>
        </div>
      )}

      {/* Floating Cart Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700"
        onClick={() => setCartOpen(true)}
      >
        <ShoppingCartIcon className="h-5 w-5 mr-2" />
        Cart ({totalCartItems})
      </Button>

      {/* Shopping Cart Drawer */}
      <ShoppingCart
        cart={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </>
  )
}

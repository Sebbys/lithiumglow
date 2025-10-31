"use client"

import type { CartItem } from "@/lib/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, ShoppingBag } from "lucide-react"
import { formatIDR } from "@/lib/utils"

interface ShoppingCartProps {
  cart: CartItem[]
  open: boolean
  onClose: () => void
  onRemoveItem: (index: number) => void
  onCheckout: () => void
}

export function ShoppingCart({ cart, open, onClose, onRemoveItem, onCheckout }: ShoppingCartProps) {
  const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)
  const totalMacros = cart.reduce(
    (acc, item) => ({
      protein: acc.protein + item.totalMacros.protein * item.quantity,
      carbs: acc.carbs + item.totalMacros.carbs * item.quantity,
      fats: acc.fats + item.totalMacros.fats * item.quantity,
      calories: acc.calories + item.totalMacros.calories * item.quantity,
    }),
    { protein: 0, carbs: 0, fats: 0, calories: 0 },
  )

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {cart.length === 0
              ? "Your cart is empty"
              : `${cart.reduce((sum, item) => sum + item.quantity, 0)} item${cart.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? "s" : ""} in cart`}
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Add items to get started</p>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable Cart Items */}
            <div className="flex-1 min-h-0 -mx-6">
              <ScrollArea className="h-full px-6">
                <div className="space-y-4 py-2 p-4">
                  {cart.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold leading-tight">{item.menuItem.name}</h4>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-emerald-600">
                            {formatIDR(item.totalPrice * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => onRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Custom Options */}
                      {Object.keys(item.selectedCustomOptions).length > 0 && (
                        <div className="space-y-1">
                          {Object.entries(item.selectedCustomOptions).map(([key, value]) => (
                            <p key={key} className="text-sm text-muted-foreground">
                              <span className="font-medium">{key}:</span> {value}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Extra Options */}
                      {Object.keys(item.selectedExtraOptions).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.selectedExtraOptions).map(([extraName, quantity]) => (
                            <Badge key={extraName} variant="secondary" className="text-xs">
                              + {extraName} {quantity > 1 ? `(x${quantity})` : ''}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Macros */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                          P: {item.totalMacros.protein * item.quantity}g
                        </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          C: {item.totalMacros.carbs * item.quantity}g
                        </Badge>
                        <Badge variant="outline" className="text-amber-600 border-amber-200">
                          F: {item.totalMacros.fats * item.quantity}g
                        </Badge>
                        <Badge variant="outline" className="text-rose-600 border-rose-200">
                          {item.totalMacros.calories * item.quantity} cal
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Fixed Totals Section at Bottom */}
            <div className="shrink-0 space-y-4 px-4 mb-4">
              <div>
                <h4 className="font-semibold mb-2">Total Nutritional Info</h4>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-2 text-center">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Protein</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{totalMacros.protein}g</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Carbs</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{totalMacros.carbs}g</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-2 text-center">
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Fats</p>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{totalMacros.fats}g</p>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-950 rounded-lg p-2 text-center">
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">Calories</p>
                    <p className="text-lg font-bold text-rose-700 dark:text-rose-300">{totalMacros.calories}</p>
                  </div>
                </div>
              </div>

              {/* Total Price and Checkout */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{formatIDR(totalPrice)}</p>
                </div>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" onClick={onCheckout}>
                  Checkout
                </Button>
              </div>
            </div>
          </>

        )}
      </SheetContent>
    </Sheet>
  )
}

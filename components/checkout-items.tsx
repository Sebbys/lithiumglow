'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import type { CartItem } from '@/lib/types'
import { formatIDR } from '@/lib/utils'

interface CheckoutItemsProps {
  items: CartItem[]
  verifiedItems: any[]
  onRemoveItem: (index: number) => void
}

export function CheckoutItems({ items, verifiedItems, onRemoveItem }: CheckoutItemsProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {items.map((item, index) => {
          const verified = verifiedItems[index]
          const priceChanged = verified && verified.priceMismatch

          return (
            <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
              {/* Item Image */}
              <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                <Image
                  src={item.menuItem.image || '/placeholder.jpg'}
                  alt={item.menuItem.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Item Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{item.menuItem.name}</h3>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      {priceChanged && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatIDR(item.totalPrice * item.quantity)}
                        </p>
                      )}
                      <p className={`font-bold ${priceChanged ? 'text-yellow-600' : 'text-emerald-600'}`}>
                        {formatIDR(verified?.totalPrice || item.totalPrice * item.quantity)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
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
                <div className="flex gap-3 text-xs">
                  <span className="text-muted-foreground">
                    P: <span className="font-medium text-foreground">{Math.round(item.totalMacros.protein * item.quantity)}g</span>
                  </span>
                  <span className="text-muted-foreground">
                    C: <span className="font-medium text-foreground">{Math.round(item.totalMacros.carbs * item.quantity)}g</span>
                  </span>
                  <span className="text-muted-foreground">
                    F: <span className="font-medium text-foreground">{Math.round(item.totalMacros.fats * item.quantity)}g</span>
                  </span>
                  <span className="text-muted-foreground">
                    Cal: <span className="font-medium text-foreground">{Math.round(item.totalMacros.calories * item.quantity)}</span>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

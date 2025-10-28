"use client"

import { useState, useEffect } from "react"
import type { MenuItem } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { calculateTotalMacros, calculateTotalPrice } from "@/lib/macro-calculator"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus } from "lucide-react"
import Image from "next/image"

interface ItemCustomizationModalProps {
  item: MenuItem | null
  open: boolean
  onClose: () => void
  onAddToCart: (
    item: MenuItem,
    selectedCustomOptions: Record<string, string>,
    selectedExtraOptions: Record<string, number>,
    quantity: number,
  ) => void
}

export function ItemCustomizationModal({ item, open, onClose, onAddToCart }: ItemCustomizationModalProps) {
  const [selectedCustomOptions, setSelectedCustomOptions] = useState<Record<string, string>>({})
  const [selectedExtraOptions, setSelectedExtraOptions] = useState<Record<string, number>>({})
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (item && open) {
      // Initialize with first choice of each custom option
      const initialCustomOptions: Record<string, string> = {}
      item.customOptions?.forEach((option) => {
        if (option.choices.length > 0) {
          initialCustomOptions[option.name] = option.choices[0].label
        }
      })
      setSelectedCustomOptions(initialCustomOptions)
      setSelectedExtraOptions({})
      setQuantity(1)
    }
  }, [item, open])

  if (!item) return null

  const currentMacros = calculateTotalMacros(item, selectedCustomOptions, selectedExtraOptions)
  const currentPrice = calculateTotalPrice(item, selectedCustomOptions, selectedExtraOptions)

  const handleCustomOptionChange = (optionName: string, choice: string) => {
    setSelectedCustomOptions((prev) => ({
      ...prev,
      [optionName]: choice,
    }))
  }

  const handleExtraOptionToggle = (extraName: string) => {
    setSelectedExtraOptions((prev) => {
      const newOptions = { ...prev }
      if (newOptions[extraName]) {
        delete newOptions[extraName]
      } else {
        newOptions[extraName] = 1
      }
      return newOptions
    })
  }

  const handleAddToCart = () => {
    onAddToCart(item, selectedCustomOptions, selectedExtraOptions, quantity)
    onClose()
  }

  const MacroBadge = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className={`flex flex-col items-center p-3 rounded-lg ${color}`}>
      <span className="text-xs font-medium opacity-80">{label}</span>
      <span className="text-xl font-bold">{value}g</span>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="relative h-48 w-full overflow-hidden rounded-lg -mx-6 -mt-6 mb-4">
            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
          </div>
          <DialogTitle className="text-2xl">{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Macros Display */}
          <div>
            <h3 className="font-semibold mb-3">Nutritional Information</h3>
            <div className="grid grid-cols-4 gap-2">
              <MacroBadge
                label="Protein"
                value={currentMacros.protein}
                color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              />
              <MacroBadge
                label="Carbs"
                value={currentMacros.carbs}
                color="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              />
              <MacroBadge
                label="Fats"
                value={currentMacros.fats}
                color="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              />
              <div className="flex flex-col items-center p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <span className="text-xs font-medium opacity-80">Calories</span>
                <span className="text-xl font-bold">{currentMacros.calories}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Custom Options */}
          {item.customOptions && item.customOptions.length > 0 && (
            <div className="space-y-4">
              {item.customOptions.map((option) => (
                <div key={option.name}>
                  <Label className="text-base font-semibold mb-3 block">{option.name}</Label>
                  <RadioGroup
                    value={selectedCustomOptions[option.name]}
                    onValueChange={(value) => handleCustomOptionChange(option.name, value)}
                  >
                    <div className="space-y-2">
                      {option.choices.map((choice) => (
                        <div
                          key={choice.label}
                          className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                        >
                          <RadioGroupItem value={choice.label} id={`${option.name}-${choice.label}`} />
                          <Label htmlFor={`${option.name}-${choice.label}`} className="flex-1 cursor-pointer">
                            {choice.label}
                          </Label>
                          {(choice.macroAdjustment.protein !== 0 ||
                            choice.macroAdjustment.carbs !== 0 ||
                            choice.macroAdjustment.fats !== 0) && (
                            <div className="flex gap-1 text-xs">
                              {choice.macroAdjustment.protein !== 0 && (
                                <Badge variant="outline" className="text-emerald-600">
                                  {choice.macroAdjustment.protein > 0 ? "+" : ""}
                                  {choice.macroAdjustment.protein}P
                                </Badge>
                              )}
                              {choice.macroAdjustment.carbs !== 0 && (
                                <Badge variant="outline" className="text-blue-600">
                                  {choice.macroAdjustment.carbs > 0 ? "+" : ""}
                                  {choice.macroAdjustment.carbs}C
                                </Badge>
                              )}
                              {choice.macroAdjustment.fats !== 0 && (
                                <Badge variant="outline" className="text-amber-600">
                                  {choice.macroAdjustment.fats > 0 ? "+" : ""}
                                  {choice.macroAdjustment.fats}F
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}

          {/* Extra Options */}
          {item.extraOptions && item.extraOptions.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-base font-semibold mb-3 block">Add Extras</Label>
                <div className="space-y-2">
                  {item.extraOptions.map((extra) => (
                    <div
                      key={extra.name}
                      className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                      onClick={() => handleExtraOptionToggle(extra.name)}
                    >
                      <Checkbox
                        id={extra.name}
                        checked={!!selectedExtraOptions[extra.name]}
                        onCheckedChange={() => handleExtraOptionToggle(extra.name)}
                      />
                      <Label htmlFor={extra.name} className="flex-1 cursor-pointer">
                        {extra.name}
                      </Label>
                      {extra.price && <span className="font-semibold text-emerald-600">+${extra.price.toFixed(2)}</span>}
                      <div className="flex gap-1 text-xs">
                        {extra.macroAdjustment?.protein !== 0 && (
                          <Badge variant="outline" className="text-emerald-600">
                            +{extra.macroAdjustment?.protein}P
                          </Badge>
                        )}
                        {extra.macroAdjustment?.carbs !== 0 && (
                          <Badge variant="outline" className="text-blue-600">
                            +{extra.macroAdjustment?.carbs}C
                          </Badge>
                        )}
                        {extra.macroAdjustment?.fats !== 0 && (
                          <Badge variant="outline" className="text-amber-600">
                            +{extra.macroAdjustment?.fats}F
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Quantity and Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Label className="font-semibold">Quantity:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={handleAddToCart} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Add to Cart - ${(currentPrice * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

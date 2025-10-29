"use client"

import { useState, useEffect } from "react"
import type { MenuItem } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus } from "lucide-react"
import Image from "next/image"
import { calculateTotalMacros, calculateTotalPrice } from "@/lib/macro-calculator"
import { formatIDR } from "@/lib/utils"

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (
    item: MenuItem,
    selectedCustomOptions: Record<string, string>,
    selectedExtraOptions: Record<string, number>,
    quantity: number,
  ) => void
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [selectedCustomOptions, setSelectedCustomOptions] = useState<Record<string, string>>({})
  const [selectedExtraOptions, setSelectedExtraOptions] = useState<Record<string, number>>({})
  const [selectedExtraChoices, setSelectedExtraChoices] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const initialCustomOptions: Record<string, string> = {}
    item.customOptions?.forEach((option) => {
      if (option.choices.length > 0) {
        initialCustomOptions[option.name] = option.choices[0].label
      }
    })
    setSelectedCustomOptions(initialCustomOptions)

    const initialExtraChoices: Record<string, string> = {}
    item.extraOptions?.forEach((extra) => {
      if (extra.choices && extra.choices.length > 0) {
        initialExtraChoices[extra.name] = extra.choices[0].label
      }
    })
    setSelectedExtraChoices(initialExtraChoices)
  }, [item])

  const currentMacros = calculateTotalMacros(item, selectedCustomOptions, selectedExtraOptions, selectedExtraChoices)
  const currentPrice = calculateTotalPrice(item, selectedCustomOptions, selectedExtraOptions, selectedExtraChoices)

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

  const handleExtraChoiceChange = (extraName: string, choice: string) => {
    setSelectedExtraChoices((prev) => ({
      ...prev,
      [extraName]: choice,
    }))

    if (choice === "None") {
      setSelectedExtraOptions((prev) => {
        const newOptions = { ...prev }
        delete newOptions[extraName]
        return newOptions
      })
    } else {
      setSelectedExtraOptions((prev) => ({
        ...prev,
        [extraName]: prev[extraName] || 1,
      }))
    }
  }

  const handleExtraQuantityChange = (extraName: string, delta: number) => {
    setSelectedExtraOptions((prev) => {
      const currentQty = prev[extraName] || 0
      const newQty = Math.max(0, currentQty + delta)

      const newOptions = { ...prev }
      if (newQty === 0) {
        delete newOptions[extraName]
      } else {
        newOptions[extraName] = newQty
      }
      return newOptions
    })
  }

  const handleAddToCart = () => {
    onAddToCart(item, selectedCustomOptions, selectedExtraOptions, quantity)
    setQuantity(1)
    setSelectedExtraOptions({})
    const resetExtraChoices: Record<string, string> = {}
    item.extraOptions?.forEach((extra) => {
      if (extra.choices && extra.choices.length > 0) {
        resetExtraChoices[extra.name] = extra.choices[0].label
      }
    })
    setSelectedExtraChoices(resetExtraChoices)
  }

  return (
    <Card className="transition-all hover:shadow-lg flex flex-col">
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>
      <CardContent className="p-4 space-y-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight text-balance">{item.name}</h3>
          <span className="font-bold text-lg text-emerald-600 shrink-0">{formatIDR(currentPrice)}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            P: {currentMacros.protein}g
          </Badge>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            C: {currentMacros.carbs}g
          </Badge>
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            F: {currentMacros.fats}g
          </Badge>
          <Badge variant="secondary" className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {currentMacros.calories} cal
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-1">
          {item.customOptions && item.customOptions.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              {item.customOptions.map((option) => (
                <div key={option.name}>
                  <Label className="text-xs font-semibold mb-2 block">{option.name}</Label>
                  <Select
                    value={selectedCustomOptions[option.name]}
                    onValueChange={(value) => handleCustomOptionChange(option.name, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${option.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.choices.map((choice) => (
                        <SelectItem key={choice.label} value={choice.label} className="cursor-pointer">
                          <span>{choice.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(() => {
                    const selectedChoice = option.choices.find((c) => c.label === selectedCustomOptions[option.name])
                    if (
                      selectedChoice &&
                      (selectedChoice.price ||
                        selectedChoice.macroAdjustment.protein !== 0 ||
                        selectedChoice.macroAdjustment.carbs !== 0 ||
                        selectedChoice.macroAdjustment.fats !== 0)
                    ) {
                      return (
                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          {selectedChoice.price && (
                            <span className="font-semibold text-emerald-600">+{formatIDR(selectedChoice.price)}</span>
                          )}
                          {selectedChoice.macroAdjustment.protein !== 0 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-emerald-600">
                              {selectedChoice.macroAdjustment.protein > 0 ? "+" : ""}
                              {selectedChoice.macroAdjustment.protein}P
                            </Badge>
                          )}
                          {selectedChoice.macroAdjustment.carbs !== 0 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-blue-600">
                              {selectedChoice.macroAdjustment.carbs > 0 ? "+" : ""}
                              {selectedChoice.macroAdjustment.carbs}C
                            </Badge>
                          )}
                          {selectedChoice.macroAdjustment.fats !== 0 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-amber-600">
                              {selectedChoice.macroAdjustment.fats > 0 ? "+" : ""}
                              {selectedChoice.macroAdjustment.fats}F
                            </Badge>
                          )}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              ))}
            </div>
          )}

          {item.extraOptions && item.extraOptions.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-xs font-semibold block">Add Extras</Label>
              {item.extraOptions.map((extra) => {
                const hasChoices = extra.choices && extra.choices.length > 0
                const hasQuantity = extra.maxQuantity && extra.maxQuantity > 1
                const currentQty = selectedExtraOptions[extra.name] || 0
                const isSelected = currentQty > 0
                const selectedChoice = selectedExtraChoices[extra.name]

                let displayPrice = extra.price || 0
                let displayMacros = extra.macroAdjustment || { protein: 0, carbs: 0, fats: 0, calories: 0 }

                if (hasChoices && selectedChoice && extra.choices) {
                  const choice = extra.choices.find((c) => c.label === selectedChoice)
                  if (choice) {
                    displayPrice = choice.price
                    displayMacros = choice.macroAdjustment
                  }
                }

                return (
                  <div key={extra.name} className="space-y-2">
                    {hasChoices ? (
                      <div className="border rounded-lg p-3 bg-muted/30">
                        <Label className="text-sm font-semibold mb-2 block">{extra.name}</Label>
                        <Select
                          value={selectedChoice}
                          onValueChange={(value) => handleExtraChoiceChange(extra.name, value)}
                        >
                          <SelectTrigger className="w-full bg-background">
                            <SelectValue placeholder={`Select ${extra.name}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {extra.choices?.map((choice) => (
                              <SelectItem key={choice.label} value={choice.label} className="cursor-pointer">
                                <div className="flex flex-col gap-0.5">
                                  <span>{choice.label}</span>
                                  {choice.description && (
                                    <span className="text-xs text-muted-foreground">{choice.description}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedChoice !== "None" && hasQuantity && (
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => handleExtraQuantityChange(extra.name, -1)}
                                disabled={currentQty === 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold">{currentQty}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => handleExtraQuantityChange(extra.name, 1)}
                                disabled={currentQty >= (extra.maxQuantity || 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              {displayPrice > 0 && currentQty > 0 && (
                                <span className="text-sm font-semibold text-emerald-600">
                                  +{formatIDR(displayPrice * currentQty)}
                                </span>
                              )}
                              {currentQty > 0 && (
                                <div className="flex gap-1">
                                  {displayMacros.protein !== 0 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-emerald-600">
                                      +{displayMacros.protein * currentQty}P
                                    </Badge>
                                  )}
                                  {displayMacros.carbs !== 0 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-blue-600">
                                      +{displayMacros.carbs * currentQty}C
                                    </Badge>
                                  )}
                                  {displayMacros.fats !== 0 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-amber-600">
                                      +{displayMacros.fats * currentQty}F
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => !hasQuantity && handleExtraOptionToggle(extra.name)}
                      >
                        {!hasQuantity && (
                          <Checkbox
                            id={`${item.id}-${extra.name}`}
                            checked={isSelected}
                            onCheckedChange={() => handleExtraOptionToggle(extra.name)}
                          />
                        )}
                        <Label
                          htmlFor={`${item.id}-${extra.name}`}
                          className={`text-sm flex-1 ${hasQuantity ? "" : "cursor-pointer"}`}
                        >
                          {extra.name}
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-emerald-600">+{formatIDR(displayPrice)}</span>
                          <div className="flex gap-1">
                            {displayMacros.protein !== 0 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-emerald-600">
                                +{displayMacros.protein}P
                              </Badge>
                            )}
                            {displayMacros.carbs !== 0 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-blue-600">
                                +{displayMacros.carbs}C
                              </Badge>
                            )}
                            {displayMacros.fats !== 0 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-amber-600">
                                +{displayMacros.fats}F
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t mt-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button onClick={handleAddToCart} size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1">
            Add {formatIDR(currentPrice * quantity)}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

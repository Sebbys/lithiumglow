"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { MenuItem } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import { createMenuItem, updateMenuItem } from "@/lib/actions/admin"
import { toast } from "sonner"
import { CATEGORIES } from "@/lib/menu-data"

interface MenuItemFormProps {
  item: MenuItem | null
  open: boolean
  onClose: () => void
  onSave: () => void
}

export function MenuItemForm({ item, open, onClose, onSave }: MenuItemFormProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "Bowls",
    baseMacros: { protein: 0, carbs: 0, fats: 0, calories: 0 },
    customOptions: [],
    extraOptions: [],
  })

  // Auto-calculate calories using formula: (P × 4) + (C × 4) + (F × 9)
  const calculateCalories = (protein: number, carbs: number, fats: number): number => {
    return Math.round((protein * 4) + (carbs * 4) + (fats * 9))
  }

  // Update macros with auto-calculated calories
  const updateMacros = (field: 'protein' | 'carbs' | 'fats', value: number) => {
    const newMacros = { ...formData.baseMacros! }
    newMacros[field] = value
    newMacros.calories = calculateCalories(newMacros.protein, newMacros.carbs, newMacros.fats)
    setFormData({ ...formData, baseMacros: newMacros })
  }

  useEffect(() => {
    if (item && open) {
      setFormData(item)
    } else if (!item && open) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        image: "",
        category: "Bowls",
        baseMacros: { protein: 0, carbs: 0, fats: 0, calories: 0 },
        customOptions: [],
        extraOptions: [],
      })
    }
  }, [item, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.category) {
      toast.error("Validation Error",{
        description: "Please fill in all required fields.",
        },
      )
      return
    }

    setSaving(true)

    const menuItemData = {
      name: formData.name,
      description: formData.description,
      price: formData.price || 0,
      image: formData.image || "/placeholder.svg?height=300&width=400",
      category: formData.category,
      baseMacros: formData.baseMacros || { protein: 0, carbs: 0, fats: 0, calories: 0 },
      customOptions: formData.customOptions,
      extraOptions: formData.extraOptions,
    }

    try {
      if (item) {
        // Update existing item
        const result = await updateMenuItem(item.id, { id: item.id, ...menuItemData } as MenuItem)
        if (result.success) {
          toast.success("Item updated", { description: "Menu item has been updated successfully." })
          onSave() // Call onSave to refresh data and close
        } else {
          toast.error("Update failed", { description: result.error || "Failed to update menu item" })
        }
      } else {
        // Create new item
        const result = await createMenuItem(menuItemData as Omit<MenuItem, "id">)
        if (result.success) {
          toast.success("Item added", { description: "New menu item has been added successfully." })
          onSave() // Call onSave to refresh data and close
        } else {
          toast.error("Add failed", { description: result.error || "Failed to add menu item" })
        }
      }
    } catch (error) {
      console.error("Error saving menu item:", error)
      toast.error("Error", { description: "An unexpected error occurred" })
    } finally {
      setSaving(false)
    }
  }

  const addCustomOption = () => {
    setFormData((prev) => ({
      ...prev,
      customOptions: [
        ...(prev.customOptions || []),
        {
          name: "",
          choices: [{ label: "", macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } }],
        },
      ],
    }))
  }

  const removeCustomOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customOptions: prev.customOptions?.filter((_, i) => i !== index),
    }))
  }

  const updateCustomOption = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.customOptions || [])]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, customOptions: updated }
    })
  }

  const addChoice = (optionIndex: number) => {
    setFormData((prev) => {
      const updated = [...(prev.customOptions || [])]
      updated[optionIndex].choices.push({
        label: "",
        macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 },
      })
      return { ...prev, customOptions: updated }
    })
  }

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    setFormData((prev) => {
      const updated = [...(prev.customOptions || [])]
      updated[optionIndex].choices = updated[optionIndex].choices.filter((_, i) => i !== choiceIndex)
      return { ...prev, customOptions: updated }
    })
  }

  const updateChoice = (optionIndex: number, choiceIndex: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.customOptions || [])]
      if (field === "label") {
        updated[optionIndex].choices[choiceIndex].label = value
      } else {
        const macroAdj = updated[optionIndex].choices[choiceIndex].macroAdjustment
        macroAdj[field as keyof typeof macroAdj] = Number(value) || 0
        
        // Auto-calculate calories when P, C, or F changes
        if (field !== 'calories') {
          macroAdj.calories = calculateCalories(macroAdj.protein, macroAdj.carbs, macroAdj.fats)
        }
        
        updated[optionIndex].choices[choiceIndex].macroAdjustment = { ...macroAdj }
      }
      return { ...prev, customOptions: updated }
    })
  }

  const addExtraOption = () => {
    setFormData((prev) => ({
      ...prev,
      extraOptions: [
        ...(prev.extraOptions || []),
        { name: "", price: 0, macroAdjustment: { protein: 0, carbs: 0, fats: 0, calories: 0 } },
      ],
    }))
  }

  const removeExtraOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extraOptions: prev.extraOptions?.filter((_, i) => i !== index),
    }))
  }

  const updateExtraOption = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.extraOptions || [])]
      if (field === "name") {
        updated[index].name = value
      } else if (field === "price") {
        updated[index].price = Number(value) || 0
      } else {
        const macroAdj = updated[index].macroAdjustment || { protein: 0, carbs: 0, fats: 0, calories: 0 }
        macroAdj[field as keyof typeof macroAdj] = Number(value) || 0
        
        // Auto-calculate calories when P, C, or F changes
        if (field !== 'calories') {
          macroAdj.calories = calculateCalories(macroAdj.protein, macroAdj.carbs, macroAdj.fats)
        }
        
        updated[index].macroAdjustment = { ...macroAdj }
      }
      return { ...prev, extraOptions: updated }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/placeholder.svg?height=300&width=400"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Base Macros */}
            <div className="space-y-4">
              <h3 className="font-semibold">Base Macros</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={formData.baseMacros?.protein}
                    onChange={(e) => updateMacros('protein', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={formData.baseMacros?.carbs}
                    onChange={(e) => updateMacros('carbs', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    value={formData.baseMacros?.fats}
                    onChange={(e) => updateMacros('fats', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories (Auto-calculated)</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.baseMacros?.calories}
                    disabled
                    className="bg-muted"
                    title="Auto-calculated: (P × 4) + (C × 4) + (F × 9)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formula: (P × 4) + (C × 4) + (F × 9) = {formData.baseMacros?.calories} cal
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Custom Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Custom Options</h3>
                <Button type="button" variant="outline" size="sm" onClick={addCustomOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>

              {formData.customOptions?.map((option, optionIndex) => (
                <div key={optionIndex} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      placeholder="Option name (e.g., Choose Your Base)"
                      value={option.name}
                      onChange={(e) => updateCustomOption(optionIndex, "name", e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomOption(optionIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 pl-4">
                    {option.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Choice label"
                            value={choice.label}
                            onChange={(e) => updateChoice(optionIndex, choiceIndex, "label", e.target.value)}
                          />
                          <div className="grid grid-cols-4 gap-2">
                            <Input
                              type="number"
                              placeholder="P"
                              value={choice.macroAdjustment.protein}
                              onChange={(e) => updateChoice(optionIndex, choiceIndex, "protein", e.target.value)}
                            />
                            <Input
                              type="number"
                              placeholder="C"
                              value={choice.macroAdjustment.carbs}
                              onChange={(e) => updateChoice(optionIndex, choiceIndex, "carbs", e.target.value)}
                            />
                            <Input
                              type="number"
                              placeholder="F"
                              value={choice.macroAdjustment.fats}
                              onChange={(e) => updateChoice(optionIndex, choiceIndex, "fats", e.target.value)}
                            />
                            <Input
                              type="number"
                              placeholder="Cal"
                              value={choice.macroAdjustment.calories}
                              onChange={(e) => updateChoice(optionIndex, choiceIndex, "calories", e.target.value)}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChoice(optionIndex, choiceIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addChoice(optionIndex)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Choice
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Extra Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Extra Options</h3>
                <Button type="button" variant="outline" size="sm" onClick={addExtraOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Extra
                </Button>
              </div>

              {formData.extraOptions?.map((extra, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Extra name (e.g., Add Avocado)"
                      value={extra.name}
                      onChange={(e) => updateExtraOption(index, "name", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={extra.price}
                      onChange={(e) => updateExtraOption(index, "price", e.target.value)}
                      className="w-24"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExtraOption(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      type="number"
                      placeholder="Protein"
                      value={extra.macroAdjustment?.protein || 0}
                      onChange={(e) => updateExtraOption(index, "protein", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Carbs"
                      value={extra.macroAdjustment?.carbs || 0}
                      onChange={(e) => updateExtraOption(index, "carbs", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Fats"
                      value={extra.macroAdjustment?.fats || 0}
                      onChange={(e) => updateExtraOption(index, "fats", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Calories"
                      value={extra.macroAdjustment?.calories || 0}
                      onChange={(e) => updateExtraOption(index, "calories", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                {saving ? "Saving..." : item ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

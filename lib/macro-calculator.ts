import type { MenuItem, MacroAdjustment } from "./types"

export function calculateTotalMacros(
  menuItem: MenuItem,
  selectedCustomOptions: Record<string, string> = {},
  selectedExtraOptions: Record<string, number> = {},
  selectedExtraChoices: Record<string, string> = {},
): MacroAdjustment {
  const total = { ...menuItem.baseMacros }

  // Apply custom option adjustments
  if (menuItem.customOptions) {
    menuItem.customOptions.forEach((option) => {
      const selectedChoice = selectedCustomOptions[option.name]
      if (selectedChoice) {
        const choice = option.choices.find((c) => c.label === selectedChoice)
        if (choice) {
          total.protein += choice.macroAdjustment.protein
          total.carbs += choice.macroAdjustment.carbs
          total.fats += choice.macroAdjustment.fats
          total.calories += choice.macroAdjustment.calories
        }
      }
    })
  }

  if (menuItem.extraOptions && selectedExtraOptions) {
    Object.entries(selectedExtraOptions).forEach(([extraName, quantity]) => {
      const extra = menuItem.extraOptions?.find((e) => e.name === extraName)
      if (extra && quantity > 0) {
        // Check if this extra has choices
        if (extra.choices && extra.choices.length > 0) {
          const selectedChoice = selectedExtraChoices[extraName]
          const choice = extra.choices.find((c) => c.label === selectedChoice)
          if (choice && choice.label !== "None") {
            total.protein += choice.macroAdjustment.protein * quantity
            total.carbs += choice.macroAdjustment.carbs * quantity
            total.fats += choice.macroAdjustment.fats * quantity
            total.calories += choice.macroAdjustment.calories * quantity
          }
        } else if (extra.macroAdjustment) {
          // Regular extra option without choices
          total.protein += extra.macroAdjustment.protein * quantity
          total.carbs += extra.macroAdjustment.carbs * quantity
          total.fats += extra.macroAdjustment.fats * quantity
          total.calories += extra.macroAdjustment.calories * quantity
        }
      }
    })
  }

  return total
}

export function calculateTotalPrice(
  menuItem: MenuItem,
  selectedCustomOptions: Record<string, string> = {},
  selectedExtraOptions: Record<string, number> = {},
  selectedExtraChoices: Record<string, string> = {},
): number {
  let total = menuItem.price

  // Add custom option prices
  if (menuItem.customOptions) {
    menuItem.customOptions.forEach((option) => {
      const selectedChoice = selectedCustomOptions[option.name]
      if (selectedChoice) {
        const choice = option.choices.find((c) => c.label === selectedChoice)
        if (choice?.price) {
          total += choice.price
        }
      }
    })
  }

  if (menuItem.extraOptions && selectedExtraOptions) {
    Object.entries(selectedExtraOptions).forEach(([extraName, quantity]) => {
      const extra = menuItem.extraOptions?.find((e) => e.name === extraName)
      if (extra && quantity > 0) {
        // Check if this extra has choices
        if (extra.choices && extra.choices.length > 0) {
          const selectedChoice = selectedExtraChoices[extraName]
          const choice = extra.choices.find((c) => c.label === selectedChoice)
          if (choice && choice.label !== "None") {
            total += choice.price * quantity
          }
        } else if (extra.price) {
          // Regular extra option without choices
          total += extra.price * quantity
        }
      }
    })
  }

  return total
}

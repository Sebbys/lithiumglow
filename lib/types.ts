export interface MacroAdjustment {
  protein: number
  carbs: number
  fats: number
  calories: number
}

export interface CustomOptionChoice {
  label: string
  price?: number
  macroAdjustment: MacroAdjustment
}

export interface CustomOption {
  name: string
  choices: CustomOptionChoice[]
}

export interface ExtraOption {
  name: string
  price?: number
  macroAdjustment?: MacroAdjustment
  maxQuantity?: number
  choices?: ExtraOptionChoice[]
}

export interface ExtraOptionChoice {
  label: string
  price: number
  macroAdjustment: MacroAdjustment
  description?: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  baseMacros: MacroAdjustment
  customOptions?: CustomOption[]
  extraOptions?: ExtraOption[]
}

export interface CartItem {
  menuItem: MenuItem
  selectedCustomOptions: Record<string, string>
  selectedExtraOptions: Record<string, number>
  totalMacros: MacroAdjustment
  totalPrice: number
  quantity: number
}

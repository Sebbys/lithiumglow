'use server'

import { createOrder } from './orders'
import { verifyCart, type ClientCartItem } from './cart'
import { revalidatePath } from 'next/cache'

export interface CheckoutState {
  success: boolean
  error?: string
  orderId?: string
  orderNumber?: string
  invoiceUrl?: string
  tamperedItems?: string[]
}

/**
 * Server action for checkout using React 19's useActionState pattern
 * This replaces the manual loading/error state management
 */
export async function checkoutAction(
  prevState: CheckoutState | null,
  formData: FormData
): Promise<CheckoutState> {
  try {
    // Extract data from FormData
    const paymentMethod = formData.get('paymentMethod') as 'xendit' | 'cash'
    const cartJson = formData.get('cart') as string
    const userId = formData.get('userId') as string | null
    const customerName = formData.get('customerName') as string
    const customerEmail = formData.get('customerEmail') as string
    const orderType = formData.get('orderType') as 'pickup' | 'dine-in' | 'delivery'

    if (!cartJson || !paymentMethod) {
      return {
        success: false,
        error: 'Missing required fields',
      }
    }

    const clientCart = JSON.parse(cartJson)
    
    if (!Array.isArray(clientCart) || clientCart.length === 0) {
      return {
        success: false,
        error: 'Cart is empty',
      }
    }

    // Convert to format for verification
    const cartItems: ClientCartItem[] = clientCart.map((item: any) => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      selectedCustomOptions: item.selectedCustomOptions,
      selectedExtraOptions: item.selectedExtraOptions,
      clientTotalPrice: item.totalPrice * item.quantity,
    }))

    // Verify cart on server (CRITICAL SECURITY)
    const verifiedCart = await verifyCart(cartItems)

    // Prepare order data with verified prices
    const orderData = {
      userId: userId || undefined,
      customerName,
      customerEmail,
      orderType,
      items: verifiedCart.items.map(item => ({
        menuItemId: item.menuItem.id,
        menuItemSnapshot: {
          name: item.menuItem.name,
          description: item.menuItem.description,
          price: item.menuItem.price,
          image: item.menuItem.image,
        },
        quantity: item.quantity,
        selectedCustomOptions: item.selectedCustomOptions,
        selectedExtraOptions: item.selectedExtraOptions,
        totalPrice: item.totalPrice,
        totalMacros: item.totalMacros,
      })),
      subtotal: verifiedCart.subtotal,
      tax: verifiedCart.tax,
      discount: 0,
      total: verifiedCart.total,
      totalMacros: verifiedCart.items.reduce(
        (acc, item) => ({
          protein: acc.protein + (item.totalMacros.protein * item.quantity),
          carbs: acc.carbs + (item.totalMacros.carbs * item.quantity),
          fats: acc.fats + (item.totalMacros.fats * item.quantity),
          calories: acc.calories + (item.totalMacros.calories * item.quantity),
        }),
        { protein: 0, carbs: 0, fats: 0, calories: 0 }
      ),
      paymentMethod,
    }

    // Create order
    const result = await createOrder(orderData)

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to create order',
      }
    }

    // Revalidate orders page
    revalidatePath('/orders')

    return {
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      invoiceUrl: result.invoiceUrl,
      tamperedItems: verifiedCart.tamperedItems,
    }
  } catch (error) {
    console.error('Checkout action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

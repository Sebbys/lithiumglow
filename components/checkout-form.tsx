'use client'

import { useActionState, useEffect, useOptimistic } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { checkoutAction, type CheckoutState } from '@/app/actions/checkout'
import { verifyCart, type ClientCartItem } from '@/app/actions/cart'
import { AlertTriangle, CreditCard, Wallet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { CartItem } from '@/lib/types'
import { CheckoutItems } from './checkout-items'
import { formatIDR } from '@/lib/utils'
import { useState } from 'react'

interface CheckoutFormProps {
  session: any
}

export function CheckoutForm({ session }: CheckoutFormProps) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [verifiedCart, setVerifiedCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // React 19: useActionState for form submission
  const [state, formAction, isPending] = useActionState<CheckoutState | null, FormData>(
    checkoutAction,
    null
  )

  // React 19: useOptimistic for instant UI updates when removing items
  const [optimisticCart, setOptimisticCart] = useOptimistic(
    cart,
    (currentCart, removedIndex: number) => {
      return currentCart.filter((_, index) => index !== removedIndex)
    }
  )

  useEffect(() => {
    loadAndVerifyCart()
  }, [])

  // Handle successful checkout
  useEffect(() => {
    if (state?.success) {
      // Clear cart from localStorage
      localStorage.removeItem('checkout-cart')

      if (state.tamperedItems && state.tamperedItems.length > 0) {
        toast.warning('Price discrepancy detected', {
          description: `Prices were corrected for: ${state.tamperedItems.join(', ')}`,
        })
      }

      if (state.invoiceUrl) {
        // Xendit payment - redirect to payment page
        toast.success('Order created!', {
          description: 'Redirecting to payment...',
        })
        window.location.href = state.invoiceUrl
      } else {
        // Cash payment - redirect to order details
        toast.success('Order placed successfully!', {
          description: `Order ${state.orderNumber}`,
        })
        router.push(`/orders/${state.orderId}`)
      }
    }
  }, [state, router])

  const loadAndVerifyCart = async () => {
    try {
      setLoading(true)
      const cartJson = localStorage.getItem('checkout-cart')
      
      if (!cartJson) {
        router.push('/')
        return
      }

      const clientCart: CartItem[] = JSON.parse(cartJson)
      
      if (clientCart.length === 0) {
        router.push('/')
        return
      }

      setCart(clientCart)

      // Verify cart with server
      const cartItems: ClientCartItem[] = clientCart.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        selectedCustomOptions: item.selectedCustomOptions,
        selectedExtraOptions: item.selectedExtraOptions,
        clientTotalPrice: item.totalPrice * item.quantity,
      }))

      const verified = await verifyCart(cartItems)
      setVerifiedCart(verified)

      if (verified.tamperedItems.length > 0) {
        toast.warning('Price verification', {
          description: `Some prices were updated to match current menu prices`,
        })
      }

      setLoading(false)
    } catch (err) {
      console.error('Error verifying cart:', err)
      toast.error('Failed to verify cart')
      router.push('/')
    }
  }

  const handleRemoveItem = async (index: number) => {
    // React 19 optimistic update - UI updates immediately
    setOptimisticCart(index)

    // Update actual state and localStorage
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    localStorage.setItem('checkout-cart', JSON.stringify(newCart))

    if (newCart.length === 0) {
      localStorage.removeItem('checkout-cart')
      router.push('/')
      return
    }

    // Re-verify cart
    const cartItems: ClientCartItem[] = newCart.map(item => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      selectedCustomOptions: item.selectedCustomOptions,
      selectedExtraOptions: item.selectedExtraOptions,
    }))

    const verified = await verifyCart(cartItems)
    setVerifiedCart(verified)
    
    toast.success('Item removed')
  }

  if (loading || !verifiedCart) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {state?.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {verifiedCart.tamperedItems.length > 0 && (
        <Alert className="mb-6 border-yellow-500">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            Prices have been updated to match current menu: {verifiedCart.tamperedItems.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutItems
            items={optimisticCart}
            verifiedItems={verifiedCart.items}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatIDR(verifiedCart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>{formatIDR(verifiedCart.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-emerald-600">{formatIDR(verifiedCart.total)}</span>
                </div>
              </div>

              {/* React 19: Native form actions */}
              <form action={formAction} className="space-y-3">
                {/* Hidden fields for form data */}
                <input type="hidden" name="cart" value={JSON.stringify(cart)} />
                <input type="hidden" name="userId" value={session?.user?.id || ''} />
                <input type="hidden" name="customerName" value={session?.user?.name || 'Guest'} />
                <input type="hidden" name="customerEmail" value={session?.user?.email || 'guest@example.com'} />
                <input type="hidden" name="orderType" value="pickup" />

                {/* Payment buttons with automatic pending state */}
                <Button
                  type="submit"
                  name="paymentMethod"
                  value="xendit"
                  className="w-full"
                  size="lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay with Card/E-wallet
                    </>
                  )}
                </Button>

                <Button
                  type="submit"
                  name="paymentMethod"
                  value="cash"
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Cash on Pickup
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center">
                By placing your order, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

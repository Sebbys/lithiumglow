'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { verifyCart, type ClientCartItem, type VerifiedCart } from '@/app/actions/cart'
import { createOrder } from '@/app/actions/orders'
import { AlertTriangle, CheckCircle2, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { CartItem } from '@/lib/types'
import Image from 'next/image'

interface CheckoutContentProps {
  session: any // Session from auth
}

export function CheckoutContent({ session }: CheckoutContentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verifiedCart, setVerifiedCart] = useState<VerifiedCart | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAndVerifyCart()
  }, [])

  const loadAndVerifyCart = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load cart from localStorage
      const cartJson = localStorage.getItem('checkout-cart')
      if (!cartJson) {
        setError('Your cart is empty')
        setLoading(false)
        return
      }

      const clientCart: CartItem[] = JSON.parse(cartJson)
      
      if (clientCart.length === 0) {
        setError('Your cart is empty')
        setLoading(false)
        return
      }

      // Convert to format for verification
      const cartItems: ClientCartItem[] = clientCart.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        selectedCustomOptions: item.selectedCustomOptions,
        selectedExtraOptions: item.selectedExtraOptions,
        clientTotalPrice: item.totalPrice * item.quantity, // Send for comparison
      }))

      // Verify cart with server
      const verified = await verifyCart(cartItems)
      setVerifiedCart(verified)

      // Show warning if tampering detected
      if (verified.tamperedItems.length > 0) {
        toast.error('Price discrepancy detected', {
          description: `Prices have been corrected for: ${verified.tamperedItems.join(', ')}`,
        })
      }

      setLoading(false)
    } catch (err) {
      console.error('Error verifying cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cart')
      setLoading(false)
    }
  }

  const handleRemoveItem = (index: number) => {
    if (!verifiedCart) return

    try {
      // Remove from verified cart
      const newItems = verifiedCart.items.filter((_, i) => i !== index)
      
      // Update localStorage
      const cartJson = localStorage.getItem('checkout-cart')
      if (cartJson) {
        const clientCart: CartItem[] = JSON.parse(cartJson)
        clientCart.splice(index, 1)
        localStorage.setItem('checkout-cart', JSON.stringify(clientCart))
      }

      // Recalculate totals
      const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0)
      const tax = subtotal * 0.08
      const total = subtotal + tax

      setVerifiedCart({
        ...verifiedCart,
        items: newItems,
        subtotal,
        tax,
        total
      })

      toast.success('Item removed from cart')

      // If cart is empty, redirect to menu
      if (newItems.length === 0) {
        localStorage.removeItem('checkout-cart')
        router.push('/')
      }
    } catch (err) {
      toast.error('Failed to remove item')
    }
  }

  const handleCheckout = async (paymentMethod: 'xendit' | 'cash') => {
    if (!verifiedCart) return

    try {
      setVerifying(true)

      // Prepare order data
      const orderData = {
        userId: session?.user?.id,
        customerName: session?.user?.name || 'Guest',
        customerEmail: session?.user?.email || 'guest@example.com',
        customerPhone: undefined,
        orderType: 'pickup' as const,
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
        toast.error('Order creation failed', {
          description: result.error || 'Please try again'
        })
        return
      }

      // Clear cart
      localStorage.removeItem('checkout-cart')

      // If Xendit payment, redirect to payment page
      if (paymentMethod === 'xendit' && result.invoiceUrl) {
        toast.success('Order created!', {
          description: 'Redirecting to payment...'
        })
        
        // Redirect to Xendit payment page
        window.location.href = result.invoiceUrl
      } else {
        // Cash payment - show success and redirect
        toast.success('Order placed successfully!', {
          description: `Order ${result.orderNumber} - Total: Rp ${verifiedCart.total.toLocaleString('id-ID')}`
        })
        
        router.push(`/orders/${result.orderId}`)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      toast.error('Failed to process order')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push('/')}>Return to Menu</Button>
        </div>
      </div>
    )
  }

  if (!verifiedCart || verifiedCart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some delicious items to get started!</p>
          <Button onClick={() => router.push('/')}>Browse Menu</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {verifiedCart.tamperedItems.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Price Verification</AlertTitle>
          <AlertDescription>
            Some prices in your cart were incorrect and have been corrected to match our current menu prices.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Review your order below. All prices have been verified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verifiedCart.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden shrink-0">
                    <Image
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.menuItem.name}</h3>
                        {item.priceMismatch && (
                          <Badge variant="destructive" className="mt-1">
                            Price Corrected
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={verifying}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Show customizations */}
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      {Object.entries(item.selectedCustomOptions).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                      {Object.entries(item.selectedExtraOptions)
                        .filter(([, qty]) => qty > 0)
                        .map(([key, qty]) => (
                          <div key={key}>
                            {key} × {qty}
                          </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${verifiedCart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${verifiedCart.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${verifiedCart.total.toFixed(2)}</span>
                </div>
              </div>

              {session && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Ordering as: <span className="font-medium text-foreground">{session.user.email}</span>
                  </p>
                </div>
              )}

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Secure Checkout</AlertTitle>
                <AlertDescription className="text-xs">
                  All prices verified server-side for your security.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700" 
                size="lg"
                onClick={() => handleCheckout('xendit')}
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Processing Payment...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Payment required before order preparation. Accepts: Credit Card, E-Wallet, Bank Transfer, QRIS
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

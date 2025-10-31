'use client'

import { useEffect, useState } from 'react'
import { getOrder } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Package, Clock, CheckCircle, XCircle, MapPin, Phone, Mail, ChevronLeft, Receipt, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'

interface OrderDetailsContentProps {
  orderId: string
  userId?: string
}

type OrderDetails = {
  order: {
    orderNumber: string
    createdAt: string | Date
    status: string
    paymentStatus: string
    orderType: string
    paymentMethod?: string | null
    customerName?: string | null
    customerEmail?: string | null
    customerPhone?: string | null
    tableNumber?: string | null
    subtotal: number
    tax: number
    discount: number
    totalPrice: number
    totalMacros: { protein: number; carbs: number; fats: number; calories: number }
    specialInstructions?: string | null
    xenditInvoiceId?: string | null
  }
  items: Array<{
    menuItemSnapshot: { name: string; description?: string; image?: string | null }
    quantity: number
    totalPrice: number
    totalMacros: { protein: number; carbs: number; fats: number; calories: number }
  }>
}

export function OrderDetailsContent({ orderId, userId }: OrderDetailsContentProps) {
  const [orderData, setOrderData] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingPayment, setCheckingPayment] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    setLoading(true)
    const result = await getOrder(orderId)
    if (result.success) {
      setOrderData({ order: result.order as any, items: result.items as any })
    } else {
      toast.error('Failed to load order details')
    }
    setLoading(false)
  }

  const checkPaymentStatus = async () => {
    setCheckingPayment(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/check-payment`)
      const data = await response.json()

      if (data.success) {
        if (data.updated) {
          toast.success(`Payment status updated: ${data.invoiceStatus}`)
          await loadOrder() // Reload order to show updated status
        } else {
          toast.info(`Payment status: ${data.invoiceStatus}`)
        }
      } else {
        toast.error(data.error || 'Failed to check payment status')
      }
    } catch (error) {
      toast.error('Failed to check payment status')
      console.error(error)
    } finally {
      setCheckingPayment(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'secondary' | 'default' | 'destructive' | 'outline'; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
      pending: { variant: 'secondary', label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
      confirmed: { variant: 'default', label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-500' },
      preparing: { variant: 'default', label: 'Preparing', icon: Package, color: 'bg-orange-500' },
      ready: { variant: 'default', label: 'Ready for Pickup', icon: CheckCircle, color: 'bg-green-500' },
      completed: { variant: 'default', label: 'Completed', icon: CheckCircle, color: 'bg-gray-500' },
      cancelled: { variant: 'destructive', label: 'Cancelled', icon: XCircle, color: 'bg-red-500' },
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${config.color}`} />
        <Badge variant={config.variant} className="flex items-center gap-1 text-sm">
          <Icon className="h-4 w-4" />
          {config.label}
        </Badge>
      </div>
    )
  }

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') return <Badge className="bg-green-600">Paid</Badge>
    if (status === 'failed') return <Badge variant="destructive">Payment Failed</Badge>
    return <Badge variant="outline">Pending Payment</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  if (!orderData || !orderData.order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Order not found</h3>
            <p className="text-muted-foreground mb-6">This order does not exist or you do not have access to it</p>
            <Button asChild>
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { order, items } = orderData

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/orders">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Placed on {format(new Date(order.createdAt), 'PPpp')}
            </p>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{items?.length || 0} items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items?.map((item, idx: number) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      {item.menuItemSnapshot.image ? (
                        <Image
                          src={item.menuItemSnapshot.image}
                          alt={item.menuItemSnapshot.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{item.menuItemSnapshot.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.menuItemSnapshot.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>P: {item.totalMacros.protein}g</span>
                          <span>C: {item.totalMacros.carbs}g</span>
                          <span>F: {item.totalMacros.fats}g</span>
                          <span className="font-medium">{item.totalMacros.calories} cal</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">Rp {item.totalPrice.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.specialInstructions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          {/* Status & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
                {getPaymentBadge(order.paymentStatus)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Order Type</p>
                <Badge variant="outline" className="capitalize">{order.orderType}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
                <p className="font-medium capitalize">{order.paymentMethod || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.customerName && (
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                  </div>
                </div>
              )}
              {order.customerEmail && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{order.customerEmail}</p>
                  </div>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{order.customerPhone}</p>
                  </div>
                </div>
              )}
              {order.tableNumber && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Table {order.tableNumber}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>Rp {order.tax.toLocaleString('id-ID')}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-Rp {order.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rp {order.totalPrice.toLocaleString('id-ID')}</span>
              </div>
              
              {/* Total Macros */}
              <Separator />
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Total Nutrition</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="font-semibold">{order.totalMacros.protein}g</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="font-semibold">{order.totalMacros.carbs}g</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Fats</p>
                    <p className="font-semibold">{order.totalMacros.fats}g</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="font-semibold">{order.totalMacros.calories}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            {order.paymentStatus === 'pending' && order.xenditInvoiceId && (
              <Button 
                variant="default" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={checkPaymentStatus}
                disabled={checkingPayment}
              >
                {checkingPayment ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Checking Payment...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Payment Status
                  </>
                )}
              </Button>
            )}
            
            <Button variant="outline" className="w-full" onClick={() => window.print()}>
              <Receipt className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

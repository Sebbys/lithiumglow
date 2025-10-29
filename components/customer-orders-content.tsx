'use client'

import { useEffect, useState } from 'react'
import { getUserOrders } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Package, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  totalPrice: number
  createdAt: Date
  orderType: string
  specialInstructions: string | null
}

interface CustomerOrdersContentProps {
  userId: string
}

export function CustomerOrdersContent({ userId }: CustomerOrdersContentProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    const result = await getUserOrders(userId)
    if (result.success) {
      setOrders(result.orders as Order[])
    } else {
      toast.error('Failed to load orders')
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      confirmed: { variant: 'default', label: 'Confirmed', icon: CheckCircle },
      preparing: { variant: 'default', label: 'Preparing', icon: Package },
      ready: { variant: 'default', label: 'Ready for Pickup', icon: CheckCircle },
      completed: { variant: 'default', label: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'destructive', label: 'Cancelled', icon: XCircle },
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') return <Badge className="bg-green-600">Paid</Badge>
    if (status === 'failed') return <Badge variant="destructive">Payment Failed</Badge>
    return <Badge variant="outline">Pending Payment</Badge>
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'border-yellow-500',
      confirmed: 'border-blue-500',
      preparing: 'border-orange-500',
      ready: 'border-green-500',
      completed: 'border-gray-500',
      cancelled: 'border-red-500',
    }
    return colors[status] || 'border-gray-200'
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and view your order history</p>
        </div>
        <Button onClick={loadOrders} variant="outline">Refresh</Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start ordering to see your orders here</p>
            <Button asChild>
              <Link href="/">Browse Menu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className={`border-l-4 ${getStatusColor(order.status)} hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <CardDescription>
                      {format(new Date(order.createdAt), 'PPpp')}
                      {' • '}
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      {getPaymentBadge(order.paymentStatus)}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">Rp {order.totalPrice.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-muted-foreground">Type: </span>
                        <Badge variant="outline" className="capitalize">{order.orderType}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment: </span>
                        <span className="font-medium capitalize">{order.paymentMethod || 'N/A'}</span>
                      </div>
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>

                  {order.specialInstructions && (
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <span className="font-medium">Note: </span>
                      {order.specialInstructions}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {orders.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  Rp {orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

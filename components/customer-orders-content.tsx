'use client'

import { useEffect, useState } from 'react'
import { getUserOrders } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Package, ArrowRight, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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

const ITEMS_PER_PAGE = 15

export function CustomerOrdersContent({ userId }: CustomerOrdersContentProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    loadOrders(true)
  }, [activeTab])

  const loadOrders = async (reset = false) => {
    if (reset) {
      setLoading(true)
      setPage(0)
    } else {
      setLoadingMore(true)
    }

    const offset = reset ? 0 : (page + 1) * ITEMS_PER_PAGE
    
    // Map tab to status filter
    let statusFilter: string | undefined
    if (activeTab === 'active') {
      // We'll filter client-side for active orders
      statusFilter = undefined
    } else if (activeTab === 'completed') {
      statusFilter = 'completed'
    }
    
    const result = await getUserOrders(userId, {
      status: statusFilter,
      limit: ITEMS_PER_PAGE,
      offset,
    })

    if (result.success) {
      let filteredOrders = result.orders as Order[]
      
      // Client-side filter for active orders
      if (activeTab === 'active') {
        filteredOrders = filteredOrders.filter(o => 
          ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
        )
      }
      
      if (reset) {
        setOrders(filteredOrders)
        setPage(0)
      } else {
        setOrders((prev) => [...prev, ...filteredOrders])
        setPage((prev) => prev + 1)
      }
      setHasMore(result.hasMore)
      setTotal(result.total)
    } else {
      toast.error('Failed to load orders')
    }
    
    setLoading(false)
    setLoadingMore(false)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      preparing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      ready: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    }
    return colors[status] || colors.pending
  }

  const getPaymentColor = (status: string) => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
    if (status === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Simple Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 max-w-4xl pb-6 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Orders</h1>
              {total > 0 && (
                <p className="text-sm text-muted-foreground mt-1">{total} total</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => loadOrders(true)}
              className="shrink-0"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>

          {/* Simple Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={activeTab === 'active' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('active')}
              className="rounded-full"
            >
              Active
            </Button>
            <Button
              variant={activeTab === 'completed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('completed')}
              className="rounded-full"
            >
              Completed
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner className="h-8 w-8" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="mt-8 border-dashed space-y-4">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No orders {activeTab !== 'all' ? activeTab : 'yet'}</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                {activeTab === 'all' 
                  ? "Start ordering delicious meals to see them here"
                  : `You don't have any ${activeTab} orders`}
              </p>
              {activeTab === 'all' && (
                <Button asChild>
                  <Link href="/">Browse Menu</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Minimal Order List */}
            <div className="">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="mb-2 hover:shadow-md transition-all cursor-pointer group" style={{
                    borderLeftColor: order.status === 'completed' ? '#9ca3af' : 
                                   order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'
                  }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left: Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-base truncate">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs font-medium ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </Badge>
                            <Badge 
                              variant="secondary"
                              className={`text-xs font-medium ${getPaymentColor(order.paymentStatus)}`}
                            >
                              {order.paymentStatus}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {order.orderType}
                            </Badge>
                          </div>
                        </div>

                        {/* Right: Price & Arrow */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              Rp {(order.totalPrice / 1000).toFixed(0)}k
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => loadOrders(false)} 
                  variant="outline"
                  disabled={loadingMore}
                  className="rounded-full"
                >
                  {loadingMore ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}

            {/* Footer Info */}
            {!hasMore && orders.length > 5 && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                That's all your {activeTab !== 'all' ? activeTab : ''} orders
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

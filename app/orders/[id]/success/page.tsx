import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getOrder } from '@/app/actions/orders'

export const metadata = {
  title: 'Payment Successful | FitBite',
  description: 'Your payment was successful',
}

async function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getOrder(id)

  if (!result.success || !result.order) {
    redirect('/orders')
  }

  const { order } = result

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your order has been confirmed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-mono font-semibold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold">Rp {order.totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Type</span>
              <span className="font-semibold capitalize">{order.orderType}</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>A confirmation email has been sent to</p>
            <p className="font-medium text-foreground">{order.customerEmail}</p>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href={`/orders/${id}`}>
                View Order Details
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/orders">
                View All Orders
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SuccessPage

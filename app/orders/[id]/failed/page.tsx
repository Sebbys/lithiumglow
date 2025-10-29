import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import Link from 'next/link'
import { getOrder } from '@/app/actions/orders'

export const metadata = {
  title: 'Payment Failed | FitBite',
  description: 'Payment was not successful',
}

async function FailedPage({ params }: { params: Promise<{ id: string }> }) {
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
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            Your payment could not be processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-mono font-semibold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">Rp {order.totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-red-600">Payment Failed</span>
            </div>
          </div>

          <div className="text-sm space-y-2">
            <p className="text-muted-foreground">Your order has been created but payment was not completed. This could be due to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Insufficient funds</li>
              <li>Payment timeout</li>
              <li>Card declined</li>
              <li>Network issues</li>
            </ul>
          </div>

          <div className="space-y-2">
            {order.xenditInvoiceUrl && (
              <Button asChild className="w-full">
                <a href={order.xenditInvoiceUrl} target="_blank" rel="noopener noreferrer">
                  Retry Payment
                </a>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full">
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

          <div className="text-center text-xs text-muted-foreground">
            <p>Need help? Contact our support team</p>
          </div>

          <div className="text-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FailedPage

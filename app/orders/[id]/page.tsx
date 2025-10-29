import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { OrderDetailsContent } from '@/components/order-details-content'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Order Details | FitBite',
  description: 'View order details',
}

function OrderDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Allow both authenticated users and guests to view orders
  // (guests can access via direct link from email/confirmation)

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<OrderDetailsSkeleton />}>
        <OrderDetailsContent orderId={id} userId={session?.user.id} />
      </Suspense>
    </div>
  )
}

export default OrderDetailsPage

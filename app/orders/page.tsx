import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CustomerOrdersContent } from '@/components/customer-orders-content'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'My Orders | FitBite',
  description: 'View your order history',
}

function OrdersSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<OrdersSkeleton />}>
        <CustomerOrdersContent userId={session.user.id} />
      </Suspense>
    </div>
  )
}

export default OrdersPage

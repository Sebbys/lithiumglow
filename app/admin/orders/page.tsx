import { Suspense } from 'react'
import { OrdersContent } from '@/components/orders-content'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Orders Management | FitBite Admin',
  description: 'Manage customer orders',
}

function OrdersSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-48 mb-8" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

//   // Check if user is admin
//   if (!session || session.user.role !== 'admin') {
//     redirect('/api/auth/signin')
//   }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </div>
  )
}

export default OrdersPage

import { Suspense } from 'react'
import { CheckoutContent } from '@/components/checkout-content'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Checkout | FitBite',
  description: 'Complete your order',
}

function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

async function CheckoutPage() {
  // Get session for user info
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Optional: Redirect to login if not authenticated
  // Uncomment if you want to require authentication for checkout
  // if (!session) {
  //   redirect('/api/auth/signin?callbackUrl=/checkout')
  // }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutContent session={session} />
      </Suspense>
    </div>
  )
}

export default CheckoutPage

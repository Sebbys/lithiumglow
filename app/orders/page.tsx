import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CustomerOrdersContent } from '@/components/customer-orders-content'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/components/UserProfile'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

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
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Menu</span>
                </Button>
              </Link>
              <div className="border-l pl-4">
                <h1 className="text-xl font-bold text-emerald-600">FitBite</h1>
                <p className="text-xs text-muted-foreground">My Orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Menu</span>
                </Button>
              </Link>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <Suspense fallback={<OrdersSkeleton />}>
        <CustomerOrdersContent userId={session.user.id} />
      </Suspense>
    </div>
  )
}

export default OrdersPage

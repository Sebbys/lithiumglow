import { Suspense } from 'react'
import { getMenuItems } from '@/lib/data'
import { MenuList } from '@/components/menu-list'
import { Button } from '@/components/ui/button'
import { ShoppingCartIcon } from 'lucide-react'
import Link from 'next/link'
import { UserProfile } from '@/components/UserProfile'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// Menu items skeleton for loading state
function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted h-48 rounded-t-lg" />
          <div className="bg-muted/50 h-32 rounded-b-lg mt-2" />
        </div>
      ))}
    </div>
  )
}

export default async function HomePage() {
  // Fetch session on the server
  const session = await auth.api.getSession({
    headers: await headers()
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-600">FitBite</h1>
              <p className="text-sm text-muted-foreground">Healthy meals, tracked macros</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
              {session ? (
                <UserProfile />
              ) : (
                <Link href="/sign-in">
                  <Button size="sm" variant="ghost">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<MenuSkeleton />}>
          <MenuContent />
        </Suspense>
      </main>
    </div>
  )
}

// Separate async component for menu content
async function MenuContent() {
  // This fetch is automatically cached by React and deduplicated
  const menuItems = await getMenuItems()

  return <MenuList initialItems={menuItems} />
}

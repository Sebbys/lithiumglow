import { Suspense } from 'react'
import { getMenuItems } from '@/lib/data'
import { AdminContent } from '@/components/admin-content'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { UserProfile } from '@/components/UserProfile'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// Loading skeleton for admin table
function AdminSkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="animate-pulse space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded" />
        ))}
      </div>
    </div>
  )
}

export default async function AdminPage() {
  // Fetch session on the server
  const session = await auth.api.getSession({
    headers: await headers()
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Menu
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage menu items</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {session && <UserProfile />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<AdminSkeleton />}>
          <AdminMenuContent />
        </Suspense>
      </main>
    </div>
  )
}

// Separate async component for menu content
async function AdminMenuContent() {
  // This fetch is automatically cached and deduplicated
  const menuItems = await getMenuItems()

  return <AdminContent initialItems={menuItems} />
}

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { SessionProvider } from '@/components/SessionProvier'

export default async function SessionServerWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    // SessionProvider is a client component - pass the server-fetched session as initialSession
    // This component is rendered inside a <Suspense> boundary from the layout to avoid blocking the shell
    <SessionProvider initialSession={session}>
      {children}
    </SessionProvider>
  )
}

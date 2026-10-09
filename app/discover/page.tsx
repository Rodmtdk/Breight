import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getMyConnections } from '@/app/actions/discovery'
import { getUnreadNotificationCount } from '@/app/actions/social'
import { BottomNav } from '@/components/bottom-nav'
import { ConnectionsList } from '@/components/profile/connections-list'

export default async function DiscoverPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [connections, unreadCount] = await Promise.all([
    getMyConnections(),
    getUnreadNotificationCount(),
  ])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col bg-background pb-28">
      <header className="flex items-end justify-between px-5 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Amis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ajoute, retrouve, écris.</p>
        </div>
        <Link href="/discovery" className="rounded-full bg-foreground px-3 py-2 text-xs font-semibold text-background">
          Rencontrer
        </Link>
      </header>
      <div className="px-5">
        <ConnectionsList connections={connections} />
      </div>
      <BottomNav unreadCount={unreadCount} />
    </main>
  )
}

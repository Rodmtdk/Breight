import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getMyProfile } from '@/app/actions/profile'
import { BottomNav } from '@/components/bottom-nav'
import { E2EKeySync } from '@/components/e2e-key-sync'
import { EmpathyReport } from '@/components/dashboard/empathy-report'
import { MoodCheckin } from '@/components/dashboard/mood-checkin'
import { Card } from '@/components/ui/card'
import { Music, MapPin, StickyNote, LockKeyhole } from 'lucide-react'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const profile = await getMyProfile()
  if (!profile) redirect('/profile?setup=1')

  return (
    <div className="min-h-svh bg-background pb-20">
      <E2EKeySync />
      <header className="mx-auto max-w-lg px-4 pt-8 pb-2 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Bonjour,</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {profile.displayName}
          </h1>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
          <LockKeyhole className="size-3.5 text-warm" aria-hidden="true" />
          E2E actif
        </span>
      </header>

      <main className="mx-auto max-w-lg px-4 flex flex-col gap-4 pt-4">
        <MoodCheckin />
        <EmpathyReport />

        <section aria-label="Raccourcis" className="grid grid-cols-3 gap-3">
          <Link href="/music" className="group">
            <Card className="flex flex-col items-center gap-2 p-4 transition-colors group-hover:border-warm">
              <Music className="size-5 text-warm" aria-hidden="true" />
              <span className="text-xs font-medium text-foreground">Musique</span>
            </Card>
          </Link>
          <Link href="/map" className="group">
            <Card className="flex flex-col items-center gap-2 p-4 transition-colors group-hover:border-warm">
              <MapPin className="size-5 text-warm" aria-hidden="true" />
              <span className="text-xs font-medium text-foreground">Carte</span>
            </Card>
          </Link>
          <Link href="/notes" className="group">
            <Card className="flex flex-col items-center gap-2 p-4 transition-colors group-hover:border-warm">
              <StickyNote className="size-5 text-warm" aria-hidden="true" />
              <span className="text-xs font-medium text-foreground">Notes</span>
            </Card>
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

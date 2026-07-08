import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getMyProfile } from '@/app/actions/profile'
import { BottomNav } from '@/components/bottom-nav'
import { E2EKeySync } from '@/components/e2e-key-sync'
import { EmpathyReport } from '@/components/dashboard/empathy-report'
import { MoodCheckin } from '@/components/dashboard/mood-checkin'
import { DailyPrompt } from '@/components/dashboard/daily-prompt'
import { Music, MapPin, StickyNote, Compass, MessageCircle, Camera } from 'lucide-react'

const QUICK_ACTIONS = [
  {
    href: '/discovery',
    icon: Compass,
    label: 'Découvrir',
    desc: 'Trouve des profils compatibles',
  },
  {
    href: '/chat',
    icon: MessageCircle,
    label: 'Messages',
    desc: 'Tes conversations E2E',
  },
  {
    href: '/feed',
    icon: Camera,
    label: 'Moments',
    desc: 'Partage ton quotidien',
  },
  {
    href: '/music',
    icon: Music,
    label: 'Musique',
    desc: 'Partage ce que tu écoutes',
  },
  {
    href: '/map',
    icon: MapPin,
    label: 'Carte',
    desc: 'Vois qui est près de toi',
  },
  {
    href: '/notes',
    icon: StickyNote,
    label: 'Notes',
    desc: 'Vos souvenirs partagés',
  },
]

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/welcome')

  const profile = await getMyProfile()
  if (!profile) redirect('/profile?setup=1')

  const firstName = profile.displayName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bonjour' : 'Bonsoir'

  return (
    <div className="min-h-svh bg-background pb-24">
      <E2EKeySync />

      {/* Header */}
      <header className="mx-auto max-w-lg px-5 pt-10 pb-4">
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-0.5">
          {firstName}
        </h1>
      </header>

      <main className="mx-auto max-w-lg px-5 flex flex-col gap-8">

        {/* Humeur du jour */}
        <section aria-labelledby="mood-title">
          <p id="mood-title" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Humeur du jour
          </p>
          <MoodCheckin />
        </section>

        {/* Question du jour */}
        <section aria-labelledby="prompt-title">
          <p id="prompt-title" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Pour briser la glace
          </p>
          <DailyPrompt />
        </section>

        {/* Accès rapide */}
        <section aria-labelledby="quickactions-title">
          <p id="quickactions-title" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Accès rapide
          </p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-2xl bg-card border border-border p-4 transition-colors hover:border-warm/40 hover:bg-card"
              >
                <div className="flex-shrink-0 flex items-center justify-center size-9 rounded-xl bg-secondary group-hover:bg-warm/10 transition-colors">
                  <Icon className="size-4 text-muted-foreground group-hover:text-warm transition-colors" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Rapport d'écoute */}
        <section aria-labelledby="empathy-title">
          <p id="empathy-title" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Ton score d&apos;écoute
          </p>
          <EmpathyReport />
        </section>

      </main>

      <BottomNav />
    </div>
  )
}

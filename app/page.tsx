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
  { href: '/discovery', icon: Compass,       label: 'Découvrir',  desc: 'Profils compatibles', accent: 'jade'   },
  { href: '/chat',      icon: MessageCircle, label: 'Messages',   desc: 'Tes conversations',   accent: 'cobalt' },
  { href: '/feed',      icon: Camera,        label: 'Moments',    desc: 'Partage ton quotidien', accent: 'mauve' },
  { href: '/music',     icon: Music,         label: 'Musique',    desc: 'Ce que tu écoutes',   accent: 'gold'   },
  { href: '/map',       icon: MapPin,        label: 'Carte',      desc: 'Près de toi',          accent: 'ruby'   },
  { href: '/notes',     icon: StickyNote,    label: 'Notes',      desc: 'Souvenirs partagés',  accent: 'cobalt' },
]

const ACCENT: Record<string, { bg: string; icon: string }> = {
  jade:   { bg: 'bg-jade/10',   icon: 'text-jade'   },
  cobalt: { bg: 'bg-cobalt/10', icon: 'text-cobalt'  },
  mauve:  { bg: 'bg-mauve/10',  icon: 'text-mauve'   },
  gold:   { bg: 'bg-gold/10',   icon: 'text-gold'    },
  ruby:   { bg: 'bg-ruby/10',   icon: 'text-ruby'    },
}

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/welcome')

  const profile = await getMyProfile()
  if (!profile) redirect('/profile?setup=1')

  const firstName = profile.displayName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="min-h-svh bg-background pb-28">
      <E2EKeySync />

      {/* ── Header ── */}
      <header className="mx-auto max-w-lg px-5 pt-10 pb-2 flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground tracking-wide">{greeting},</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground mt-0.5 leading-tight">
            {firstName}
          </h1>
        </div>
        <Link href="/profile" aria-label="Profil">
          <div className="size-10 rounded-full bg-jade/15 flex items-center justify-center text-jade font-semibold text-base">
            {firstName[0]?.toUpperCase()}
          </div>
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-5 flex flex-col gap-9 mt-6">

        {/* ── Humeur ── */}
        <section aria-labelledby="mood-heading">
          <p id="mood-heading" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Humeur du jour
          </p>
          <MoodCheckin />
        </section>

        {/* ── Accès rapide ── */}
        <section aria-labelledby="quick-heading">
          <p id="quick-heading" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Explorer
          </p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, accent }) => {
              const cls = ACCENT[accent]
              return (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-2xl bg-card border border-border/60 p-4 shadow-sm hover:shadow-md hover:border-border transition-all duration-150"
                >
                  <div className={`flex-shrink-0 flex items-center justify-center size-10 rounded-xl ${cls.bg} transition-colors`}>
                    <Icon className={`size-5 ${cls.icon}`} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-foreground leading-tight">{label}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">{desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Question du jour ── */}
        <section aria-labelledby="prompt-heading">
          <p id="prompt-heading" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Pour briser la glace
          </p>
          <DailyPrompt />
        </section>

        {/* ── Score d'écoute ── */}
        <section aria-labelledby="empathy-heading">
          <p id="empathy-heading" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Ton score d&apos;écoute
          </p>
          <EmpathyReport />
        </section>

      </main>

      <BottomNav />
    </div>
  )
}

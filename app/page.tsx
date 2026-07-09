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
import { DailyQuests } from '@/components/dashboard/daily-quests'
import { ListeningScoreCard } from '@/components/listening-score-card'
import { Music, MapPin, StickyNote, Compass, MessageCircle, Camera, ArrowRight } from 'lucide-react'

const QUICK_ACTIONS = [
  { href: '/discovery', icon: Compass,       label: 'Découvrir',  desc: 'Affinités réelles', accent: 'jade'   },
  { href: '/chat',      icon: MessageCircle, label: 'Messages',   desc: 'Conversations',     accent: 'cobalt' },
  { href: '/feed',      icon: Camera,        label: 'Moments',    desc: 'Quotidien',         accent: 'mauve' },
  { href: '/music',     icon: Music,         label: 'Musique',    desc: 'Ce que tu écoutes', accent: 'gold'   },
  { href: '/map',       icon: MapPin,        label: 'Carte',      desc: 'Connexions près',   accent: 'ruby'   },
  { href: '/notes',     icon: StickyNote,    label: 'Notes',      desc: 'Souvenirs',         accent: 'mauve'  },
]

const ACCENT: Record<string, { bg: string; icon: string; gradBg: string }> = {
  jade:   { bg: 'bg-jade/10',   icon: 'text-jade',    gradBg: 'from-jade/8' },
  cobalt: { bg: 'bg-cobalt/10', icon: 'text-cobalt',  gradBg: 'from-cobalt/8' },
  mauve:  { bg: 'bg-mauve/10',  icon: 'text-mauve',   gradBg: 'from-mauve/8' },
  gold:   { bg: 'bg-gold/10',   icon: 'text-gold',    gradBg: 'from-gold/8' },
  ruby:   { bg: 'bg-ruby/10',   icon: 'text-ruby',    gradBg: 'from-ruby/8' },
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
    <div className="min-h-svh bg-background pb-32 relative overflow-hidden">
      <E2EKeySync />

      {/* ── Animated background blobs ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-jade/6 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} aria-hidden="true" />
        <div className="absolute -bottom-32 left-1/4 w-72 h-72 bg-gradient-to-tr from-mauve/4 to-transparent rounded-full blur-3xl" style={{ animationDelay: '1s' }} aria-hidden="true" />
      </div>

      {/* ── Header ── */}
      <header className="mx-auto max-w-lg px-5 pt-10 pb-4 flex items-end justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium">{greeting}</p>
          <h1 className="font-serif text-4xl font-black tracking-tight text-foreground mt-1 leading-tight">
            {firstName}
          </h1>
          <div className="h-1 w-12 bg-gradient-to-r from-jade via-cobalt to-transparent rounded-full mt-3" aria-hidden="true" />
        </div>
        <Link href="/profile" aria-label="Profil">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-jade to-mauve flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-jade/30 hover:shadow-xl hover:scale-105 transition-all">
            {firstName[0]?.toUpperCase()}
          </div>
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-5 flex flex-col gap-10 mt-8 relative z-10">

        {/* ── Quêtes du jour ── */}
        <section aria-labelledby="quests-heading" className="group">
          <p id="quests-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 group-hover:text-muted-foreground transition-colors">
            🎯 Challenges d&apos;écoute
          </p>
          <DailyQuests />
        </section>

        {/* ── Humeur ── */}
        <section aria-labelledby="mood-heading" className="group">
          <p id="mood-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 group-hover:text-muted-foreground transition-colors">
            ✨ Ton humeur aujourd&apos;hui
          </p>
          <MoodCheckin />
        </section>

        {/* ── Accès rapide — grille offset créative ── */}
        <section aria-labelledby="quick-heading" className="group">
          <p id="quick-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 group-hover:text-muted-foreground transition-colors">
            🔭 Explorer
          </p>
          <div className="grid grid-cols-2 gap-4 relative">
            {/* Subtle SVG decoration */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, accent }, i) => {
              const cls = ACCENT[accent]
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group/card relative flex flex-col gap-3 rounded-2xl p-5 transition-all duration-300 border hover:shadow-lg hover:-translate-y-1 overflow-hidden ${
                    i % 3 === 0 ? `bg-gradient-to-br ${cls.gradBg} to-transparent border-${accent}/20` : 'bg-card border-border/50 shadow-sm'
                  }`}
                >
                  {/* Animated corner accent */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-300 blur-xl" style={{ background: `var(--${accent})` }} aria-hidden="true" />

                  <div className={`flex items-center justify-center size-11 rounded-xl ${cls.bg} group-hover/card:scale-110 transition-transform relative z-10`}>
                    <Icon className={`size-5 ${cls.icon}`} aria-hidden="true" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-foreground leading-tight">{label}</p>
                    <p className="text-xs text-muted-foreground leading-snug mt-1 font-medium">{desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Question du jour ── */}
        <section aria-labelledby="prompt-heading" className="group">
          <p id="prompt-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 group-hover:text-muted-foreground transition-colors">
            💭 Pour briser la glace
          </p>
          <DailyPrompt />
        </section>

        {/* ── Score d'écoute + Leaderboard ── */}
        <section aria-labelledby="score-heading" className="group">
          <p id="score-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 group-hover:text-muted-foreground transition-colors">
            👂 Ton score d&apos;écoute
          </p>
          <div className="space-y-4">
            <ListeningScoreCard />
            <Link href="/insights" className="flex items-center justify-between rounded-lg bg-secondary/50 hover:bg-secondary border border-border p-4 transition-colors group/link">
              <div>
                <p className="text-sm font-semibold text-foreground">Voir tes détails</p>
                <p className="text-xs text-muted-foreground mt-1">Progression, badges, leaderboard</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  )
}

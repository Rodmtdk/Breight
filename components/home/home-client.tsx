'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { E2EKeySync } from '@/components/e2e-key-sync'
import { BottomNav } from '@/components/bottom-nav'
import { EmpathyReport } from '@/components/dashboard/empathy-report'
import { MoodCheckin } from '@/components/dashboard/mood-checkin'
import { DailyPrompt } from '@/components/dashboard/daily-prompt'
import { DailyQuests } from '@/components/dashboard/daily-quests'
import { ListeningScoreCard } from '@/components/listening-score-card'
import { ProfessionalSuiteHub } from '@/components/professional-suite-hub'
import { Music, MapPin, StickyNote, Compass, MessageCircle, Camera, ArrowRight } from 'lucide-react'

const QUICK_ACTIONS = [
  { href: '/discover',  icon: Compass,       label: 'Découvrir',  desc: 'Affinités réelles', accent: 'jade'   },
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

interface HomeClientProps {
  profile: any
}

export function HomeClient({ profile }: HomeClientProps) {
  const firstName = profile.displayName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="min-h-svh bg-background pb-32 relative overflow-hidden">
      <E2EKeySync />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-jade/6 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} aria-hidden="true" />
        <div className="absolute -bottom-32 left-1/4 w-72 h-72 bg-gradient-to-tr from-mauve/4 to-transparent rounded-full blur-3xl" style={{ animationDelay: '1s' }} aria-hidden="true" />
      </div>

      <header className="mx-auto max-w-lg px-5 pt-10 pb-4 flex items-end justify-between relative z-10">
        <div className="flex-1 precision-rule">
          <p className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase font-semibold">{greeting} · calibré pour le vrai</p>
          <h1 className="font-serif text-4xl font-black tracking-tight text-foreground mt-1 leading-tight">
            {firstName}
          </h1>
        </div>
        <Link href="/profile" aria-label="Profil">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-jade to-mauve flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-jade/30 hover:shadow-xl hover:scale-105 transition-all">
            {firstName[0]?.toUpperCase()}
          </div>
        </Link>
      </header>

      <main className="precision-grid mx-auto max-w-lg px-5 flex flex-col gap-10 mt-8 relative z-10">
        <section aria-labelledby="quests-heading" className="group">
          <p id="quests-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 group-hover:text-muted-foreground transition-colors">
            🎯 Challenges d&apos;écoute
          </p>
          <DailyQuests />
        </section>

        <section aria-labelledby="suite-heading" className="group">
          <p id="suite-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4">La suite professionnelle</p>
          <ProfessionalSuiteHub />
        </section>

        <section aria-labelledby="mood-heading" className="group">
          <p id="mood-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 group-hover:text-muted-foreground transition-colors">
            ✨ Ton humeur aujourd&apos;hui
          </p>
          <MoodCheckin />
        </section>

        <section aria-labelledby="prompt-heading" className="group">
          <p id="prompt-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 group-hover:text-muted-foreground transition-colors">
            💭 Pour briser la glace
          </p>
          <DailyPrompt />
        </section>

        <section aria-labelledby="actions-heading" className="group">
          <p id="actions-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 group-hover:text-muted-foreground transition-colors">
            🚀 Explore
          </p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, accent }) => (
              <Link key={href} href={href} className="group/action">
                <div className={`${ACCENT[accent].bg} rounded-xl p-4 hover:scale-105 transition-transform border border-border`}>
                  <Icon className={`${ACCENT[accent].icon} size-5 mb-2`} />
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

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

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { E2EKeySync } from '@/components/e2e-key-sync'
import { BottomNav } from '@/components/bottom-nav'
import { EmpathyReport } from '@/components/dashboard/empathy-report'
import { MoodCheckin } from '@/components/dashboard/mood-checkin'
import { DailyPrompt } from '@/components/dashboard/daily-prompt'
import { DailyQuests } from '@/components/dashboard/daily-quests'
import { RetentionHub } from '@/components/dashboard/retention-hub'
import { ListeningScoreCard } from '@/components/listening-score-card'
import { Music, MessageCircle, ArrowRight, FolderOpen, Users } from 'lucide-react'

const QUICK_ACTIONS = [
  { href: '/chat',      icon: MessageCircle, label: 'Messages',  desc: 'Conversations',     accent: 'cobalt' },
  { href: '/music',     icon: Music,         label: 'Musique',   desc: 'Ce que tu écoutes', accent: 'gold'   },
  { href: '/community', icon: Users,         label: 'Familleo',  desc: 'Événements',        accent: 'jade'   },
  { href: '/files',     icon: FolderOpen,    label: 'Fichiers',  desc: 'Workspace ERP',     accent: 'cobalt' },
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

      <header className="mx-auto max-w-2xl px-5 pt-24 pb-4 relative z-10">
        <div className="atelier-rule mb-6" />
        <div className="precision-rule">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/80"><span className="grid size-4 place-items-center rounded-full bg-gold text-[8px] text-background">B</span><span>breight</span></div>
          <p className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase font-semibold">{greeting} · calibré pour le vrai</p>
          <h1 className="font-serif text-5xl font-semibold tracking-tight text-foreground mt-1 leading-[1.05]">
            {firstName}
          </h1>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground/80">
            Une page composée pour toi : humeur, écoute, et les amis qui comptent.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 flex flex-col gap-8 mt-8 relative z-10">
        <section aria-labelledby="quests-heading" className="group">
          <p id="quests-heading" className="flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70 mb-3 group-hover:text-muted-foreground transition-colors">
            <span className="font-serif text-sm font-semibold normal-case tracking-normal text-gold">I.</span>
            Challenges d&apos;écoute
          </p>
          <DailyQuests />
        </section>

        <div className="atelier-frame rounded-[2rem] p-5 sm:p-6">
          <RetentionHub />
        </div>

        <section aria-labelledby="mood-heading" className="group">
          <p id="mood-heading" className="flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70 mb-3 group-hover:text-muted-foreground transition-colors">
            <span className="font-serif text-sm font-semibold normal-case tracking-normal text-mauve">II.</span>
            Ton humeur aujourd&apos;hui
          </p>
          <MoodCheckin />
        </section>

        <section aria-labelledby="prompt-heading" className="group">
          <p id="prompt-heading" className="flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70 mb-3 group-hover:text-muted-foreground transition-colors">
            <span className="font-serif text-sm font-semibold normal-case tracking-normal text-cobalt">III.</span>
            Pour briser la glace
          </p>
          <DailyPrompt />
        </section>

        <section aria-labelledby="actions-heading" className="group">
          <p id="actions-heading" className="flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70 mb-3 group-hover:text-muted-foreground transition-colors">
            <span className="font-serif text-sm font-semibold normal-case tracking-normal text-jade">IV.</span>
            Explore
          </p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, accent }) => (
              <Link key={href} href={href} className="group/action">
                <div className={`${ACCENT[accent].bg} rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md border border-border`}>
                  <Icon className={`${ACCENT[accent].icon} size-5 mb-2`} />
                  <p className="text-xs font-semibold tracking-tight text-foreground">{label}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="score-heading" className="group">
          <p id="score-heading" className="flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70 mb-3 group-hover:text-muted-foreground transition-colors">
            <span className="font-serif text-sm font-semibold normal-case tracking-normal text-ruby">V.</span>
            Ton score d&apos;écoute
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

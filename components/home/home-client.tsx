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
  { href: '/chat',      icon: MessageCircle, label: 'Messages',  desc: 'Conversations' },
  { href: '/music',     icon: Music,         label: 'Musique',   desc: 'Ce que tu écoutes' },
  { href: '/community', icon: Users,         label: 'Familleo',  desc: 'Événements' },
  { href: '/files',     icon: FolderOpen,    label: 'Fichiers',  desc: 'Workspace' },
]

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

      <header className="mx-auto max-w-2xl px-5 pt-24 pb-2 relative z-10">
        <p className="suite-kicker text-muted-foreground">
          <span className="text-gold">BR8</span>
          <span className="mx-2 text-foreground/25">/</span>
          {greeting}
        </p>
        <h1 className="suite-display mt-3 text-6xl text-foreground sm:text-8xl">
          {firstName}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">Photo. Amis. Maintenant.</p>
      </header>

      <main className="mx-auto max-w-2xl px-5 flex flex-col gap-8 mt-8 relative z-10">
        <section aria-labelledby="quests-heading" className="group">
          <p id="quests-heading" className="suite-kicker mb-3 text-muted-foreground">
            <span className="text-foreground/40">01</span>
            <span className="mx-2 text-foreground/25">/</span>
            Challenges d&apos;écoute
          </p>
          <DailyQuests />
        </section>

        <RetentionHub />

        <section aria-labelledby="mood-heading" className="group">
          <p id="mood-heading" className="suite-kicker mb-3 text-muted-foreground">
            <span className="text-foreground/40">02</span>
            <span className="mx-2 text-foreground/25">/</span>
            Ton humeur aujourd&apos;hui
          </p>
          <MoodCheckin />
        </section>

        <section aria-labelledby="prompt-heading" className="group">
          <p id="prompt-heading" className="suite-kicker mb-3 text-muted-foreground">
            <span className="text-foreground/40">03</span>
            <span className="mx-2 text-foreground/25">/</span>
            Pour briser la glace
          </p>
          <DailyPrompt />
        </section>

        <section aria-labelledby="actions-heading" className="group">
          <p id="actions-heading" className="suite-kicker mb-3 text-muted-foreground">
            <span className="text-foreground/40">04</span>
            <span className="mx-2 text-foreground/25">/</span>
            Explore
          </p>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                <Icon className="size-4 text-[#FFE14A]" aria-hidden="true" />
                <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">{label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="score-heading" className="group">
          <p id="score-heading" className="suite-kicker mb-3 text-muted-foreground">
            <span className="text-foreground/40">05</span>
            <span className="mx-2 text-foreground/25">/</span>
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

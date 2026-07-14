'use client'

import Link from 'next/link'
import { E2EKeySync } from '@/components/e2e-key-sync'
import { BottomNav } from '@/components/bottom-nav'
import { EmpathyReport } from '@/components/dashboard/empathy-report'
import { MoodCheckin } from '@/components/dashboard/mood-checkin'
import { DailyPrompt } from '@/components/dashboard/daily-prompt'
import { DailyQuests } from '@/components/dashboard/daily-quests'
import { ListeningScoreCard } from '@/components/listening-score-card'
import { Music, MapPin, StickyNote, Compass, MessageCircle, Camera, ArrowUpRight } from 'lucide-react'

const QUICK_ACTIONS = [
  { href: '/discover',  icon: Compass,       label: 'Découvrir',  desc: 'Affinités réelles',   accent: 'jade'   },
  { href: '/chat',      icon: MessageCircle, label: 'Messages',   desc: 'Conversations',        accent: 'cobalt' },
  { href: '/feed',      icon: Camera,        label: 'Moments',    desc: 'Ton quotidien',        accent: 'mauve'  },
  { href: '/music',     icon: Music,         label: 'Musique',    desc: "Ce que tu écoutes",    accent: 'gold'   },
  { href: '/map',       icon: MapPin,        label: 'Carte',      desc: 'Connexions proches',   accent: 'ruby'   },
  { href: '/notes',     icon: StickyNote,    label: 'Notes',      desc: 'Tes souvenirs',        accent: 'mauve'  },
]

const ACCENT_STYLES: Record<string, { dot: string; icon: string; border: string }> = {
  jade:   { dot: 'bg-jade',   icon: 'text-jade',   border: 'group-hover/action:border-jade/40' },
  cobalt: { dot: 'bg-cobalt', icon: 'text-cobalt', border: 'group-hover/action:border-cobalt/40' },
  mauve:  { dot: 'bg-mauve',  icon: 'text-mauve',  border: 'group-hover/action:border-mauve/40' },
  gold:   { dot: 'bg-gold',   icon: 'text-gold',   border: 'group-hover/action:border-gold/40' },
  ruby:   { dot: 'bg-ruby',   icon: 'text-ruby',   border: 'group-hover/action:border-ruby/40' },
}

interface HomeClientProps {
  profile: any
}

export function HomeClient({ profile }: HomeClientProps) {
  const firstName = profile.displayName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const dateLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <div className="min-h-svh bg-background pb-32 relative">
      <E2EKeySync />

      {/* Header */}
      <header className="mx-auto max-w-lg px-5 pt-12 pb-6 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground tracking-[0.18em] uppercase font-medium mb-1">
            {greeting}
          </p>
          <h1 className="font-serif text-[2.6rem] font-black tracking-tight text-foreground leading-[1.05]">
            {firstName}
          </h1>
          <p className="text-xs text-muted-foreground mt-2 capitalize">{dateLabel}</p>
        </div>

        <Link href="/profile" aria-label="Profil" className="mt-1 shrink-0">
          <div className="size-11 rounded-full bg-muted border border-border flex items-center justify-center text-foreground font-semibold text-base hover:border-jade/60 transition-colors">
            {firstName[0]?.toUpperCase()}
          </div>
        </Link>
      </header>

      {/* Thin rule */}
      <div className="mx-auto max-w-lg px-5">
        <div className="h-px bg-border" />
      </div>

      <main className="mx-auto max-w-lg px-5 flex flex-col gap-0 mt-0">

        {/* Section: Challenges */}
        <section aria-labelledby="quests-heading" className="py-8 border-b border-border">
          <SectionLabel id="quests-heading" index="01" label="Challenges d'écoute" />
          <div className="mt-5">
            <DailyQuests />
          </div>
        </section>

        {/* Section: Humeur */}
        <section aria-labelledby="mood-heading" className="py-8 border-b border-border">
          <SectionLabel id="mood-heading" index="02" label="Humeur du jour" />
          <div className="mt-5">
            <MoodCheckin />
          </div>
        </section>

        {/* Section: Brise-glace */}
        <section aria-labelledby="prompt-heading" className="py-8 border-b border-border">
          <SectionLabel id="prompt-heading" index="03" label="Brise-glace" />
          <div className="mt-5">
            <DailyPrompt />
          </div>
        </section>

        {/* Section: Explorer */}
        <section aria-labelledby="actions-heading" className="py-8 border-b border-border">
          <SectionLabel id="actions-heading" index="04" label="Explorer" />
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, accent }) => {
              const s = ACCENT_STYLES[accent]
              return (
                <Link key={href} href={href} className="group/action">
                  <div className={`relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:bg-secondary/60 ${s.border}`}>
                    <div className="flex items-center justify-between">
                      <Icon className={`size-4 ${s.icon}`} />
                      <ArrowUpRight className="size-3.5 text-muted-foreground/40 group-hover/action:text-muted-foreground transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-none">{label}</p>
                      <p className="text-[11px] text-muted-foreground mt-1.5 leading-none">{desc}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Section: Score */}
        <section aria-labelledby="score-heading" className="py-8">
          <SectionLabel id="score-heading" index="05" label="Score d'écoute" />
          <div className="mt-5 flex flex-col gap-3">
            <ListeningScoreCard />
            <Link
              href="/insights"
              className="flex items-center justify-between rounded-xl border border-border bg-card hover:bg-secondary/60 px-4 py-3.5 transition-all group/link"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Voir mes détails</p>
                <p className="text-xs text-muted-foreground mt-0.5">Progression, badges, leaderboard</p>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground/50 group-hover/link:text-foreground transition-colors" />
            </Link>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  )
}

function SectionLabel({ id, index, label }: { id: string; index: string; label: string }) {
  return (
    <div id={id} className="flex items-baseline gap-3">
      <span className="text-[10px] font-mono text-muted-foreground/40 tracking-widest tabular-nums select-none">
        {index}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

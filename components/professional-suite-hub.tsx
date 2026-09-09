'use client'

import Link from 'next/link'
import { ArrowUpRight, BookOpen, Compass, Crosshair } from 'lucide-react'
import { BREIGHT } from '@/lib/breight-brand'

const icons = {
  portfolio: Crosshair,
  manual: BookOpen,
  network: Compass,
} as const

const accents = {
  jade: 'border-jade/30 bg-jade/8 text-jade',
  cobalt: 'border-cobalt/30 bg-cobalt/8 text-cobalt',
  mauve: 'border-mauve/30 bg-mauve/8 text-mauve',
} as const

export function ProfessionalSuiteHub() {
  const suite = BREIGHT.professionalSuite
  const cards = [suite.portfolio, suite.manual, suite.network]

  return (
    <section className="precision-grid overflow-hidden rounded-2xl border border-border bg-card/70 p-5 shadow-sm" aria-labelledby="suite-title">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-jade">{suite.eyebrow}</p>
          <h2 id="suite-title" className="mt-2 max-w-xs font-serif text-2xl font-bold leading-tight text-foreground">{suite.title}</h2>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">QH / 01</span>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{suite.description}</p>
      <div className="flex flex-col gap-3">
        {cards.map((card) => {
          const Icon = icons[card.label === 'Portfolio' ? 'portfolio' : card.label === 'Manuel d’Atelier' ? 'manual' : 'network']
          return (
            <Link key={card.label} href={card.href} className="group flex items-center gap-3 rounded-xl border border-border/80 bg-background/70 p-3 transition-colors hover:border-foreground/20 hover:bg-background">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${accents[card.accent as keyof typeof accents]}`}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span>
                <span className="mt-0.5 block text-sm font-semibold text-foreground">{card.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{card.description}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

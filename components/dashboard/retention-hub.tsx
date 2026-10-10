'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Flame, Gift, Radio, Sparkles, Users } from 'lucide-react'

const rituals = [
  { id: 'pulse', label: 'Pulse du jour', detail: 'Partage ton humeur en 10 secondes', href: '/feed', icon: Sparkles, tone: 'text-mauve bg-mauve/10' },
  { id: 'radar', label: 'Radar', detail: 'Trouve une opportunité qui te ressemble', href: '/radar', icon: Radio, tone: 'text-jade bg-jade/10' },
  { id: 'circle', label: 'Ton cercle', detail: 'Relance une personne importante', href: '/chat', icon: Users, tone: 'text-cobalt bg-cobalt/10' },
]

export function RetentionHub() {
  const [completed, setCompleted] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const streak = completed.length + 2

  return (
    <section aria-labelledby="retention-heading" className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-jade">Ton rythme BR8</p>
          <h2 id="retention-heading" className="mt-1 text-xl font-bold tracking-tight">Une petite action, un vrai lien.</h2>
          <p className="mt-1 text-xs text-muted-foreground">Pas de pression : choisis ce qui te sert aujourd&apos;hui.</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-500"><Flame className="size-3.5" /> {streak} jours</div>
      </div>
      <div className="mt-4 space-y-2">
        {rituals.map(({ id, label, detail, href, icon: Icon, tone }) => {
          const done = completed.includes(id)
          return <div key={id} className="flex items-center gap-3 rounded-2xl border border-border/60 p-3">
            <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-4" /></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{label}</p><p className="truncate text-xs text-muted-foreground">{detail}</p></div>
            {done ? <span className="grid size-8 place-items-center rounded-full bg-jade/15 text-jade" aria-label="Terminé"><Check className="size-4" /></span> : <Link href={href} onClick={() => setCompleted((current) => [...current, id])} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-xs font-bold">Ouvrir <ArrowRight className="size-3" /></Link>}
          </div>
        })}
      </div>
      <button type="button" onClick={async () => { await navigator.clipboard?.writeText(window.location.origin); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"><Gift className="size-4" />{copied ? 'Lien copié' : 'Inviter quelqu’un dans BR8'}</button>
    </section>
  )
}

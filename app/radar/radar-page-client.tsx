'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowUpRight, BriefcaseBusiness, HandCoins, Lightbulb, Radio, Rocket, Sparkles } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

type RadarItem = {
  id: string
  authorName: string
  authorAvatar: string | null
  content: string | null
  feedType: string
  createdAt: string
}

export function RadarPage({ items }: { items: RadarItem[] }) {
  const [filter, setFilter] = useState('Tout')
  const filters = ['Tout', 'Emploi', 'À vendre', 'Offre']
  const visible = useMemo(() => filter === 'Tout' ? items : items.filter((item) => item.feedType === ({ Emploi: 'job', 'À vendre': 'sale', Offre: 'offer' } as Record<string, string>)[filter]), [filter, items])

  return <main className="min-h-svh bg-background pb-24 text-foreground"><div className="mx-auto min-h-svh w-full max-w-lg border-x border-border/50 bg-background"><div className="h-1.5 bg-gradient-to-r from-jade via-cobalt to-ruby" /><header className="px-5 pb-5 pt-8"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-jade"><Radio className="size-3.5" /> BR8 Radar</div><h1 className="mt-3 text-4xl font-black tracking-tight">Ce qui peut<br /><span className="text-muted-foreground">changer ta journée.</span></h1><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Les besoins, projets et opportunités autour de ton réseau. Ici, un post devient une rencontre.</p></div><div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-jade/10 text-jade"><Sparkles className="size-6" /></div></div><div className="mt-6 flex gap-2 overflow-x-auto pb-1">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${filter === item ? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground'}`}>{item}</button>)}</div></header><section className="space-y-3 px-5"><div className="rounded-3xl border border-jade/20 bg-gradient-to-br from-jade/10 via-background to-cobalt/10 p-5"><div className="flex items-start gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-jade text-jade-foreground"><Lightbulb className="size-5" /></div><div><p className="font-bold">Le bon réflexe BR8</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Tu peux répondre avec une compétence, un contact ou simplement un « je peux aider ».</p></div></div><Link href="/brief" className="mt-4 flex items-center justify-between rounded-2xl bg-foreground px-4 py-3 text-sm font-bold text-background">Créer un Brief <ArrowUpRight className="size-4" /></Link></div>{visible.length ? visible.map((item) => <article key={item.id} className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm"><div className="flex items-center gap-3"><div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-bold">{item.authorAvatar ? <img src={item.authorAvatar} alt="" className="size-full object-cover" /> : item.authorName.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate font-semibold">{item.authorName}</p><p className="text-xs text-muted-foreground">{item.feedType === 'job' ? 'recrute' : item.feedType === 'sale' ? 'met en vente' : 'propose une opportunité'}</p></div><span className="ml-auto rounded-full bg-jade/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-jade">Actif</span></div><p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{item.content?.replace(/^mood::[^\n]+\n\n?/, '') || 'Une opportunité vient d’être publiée.'}</p><button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-xs font-bold text-secondary-foreground">Voir et répondre <ArrowUpRight className="size-3.5" /></button></article>) : <div className="rounded-3xl border border-dashed border-border p-8 text-center"><Rocket className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-semibold">Le radar est calme.</p><p className="mt-1 text-sm text-muted-foreground">Publie un besoin ou une offre pour lancer le mouvement.</p></div>}</section></div><BottomNav /></main>
}

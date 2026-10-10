'use client'

import { useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, Check, HandHelping, Lightbulb, Send, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { postMoment } from '@/app/actions/feed'

const types = [
  { id: 'need', label: 'Je cherche', icon: HandHelping, hint: 'Un conseil, un contact ou un coup de main' },
  { id: 'offer', label: "J'offre", icon: Sparkles, hint: 'Une compétence, une idée ou une opportunité' },
  { id: 'idea', label: 'Je propose', icon: Lightbulb, hint: 'Un projet à construire à plusieurs' },
] as const

type BriefType = (typeof types)[number]['id']

export function BriefComposer() {
  const [type, setType] = useState<BriefType>('need')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function publish() {
    const clean = text.trim()
    if (!clean || busy) return
    setBusy(true)
    setError(null)
    try {
      const label = types.find((item) => item.id === type)?.label ?? 'Je cherche'
      await postMoment({ content: `BRIEF • ${label}\n${clean}` })
      setSent(true)
      setText('')
    } catch {
      setError('Impossible de publier ce brief pour le moment.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-svh bg-background px-5 py-8 text-foreground">
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center text-center">
          <div className="grid size-20 place-items-center rounded-[2rem] bg-jade text-jade-foreground shadow-[0_18px_50px_rgba(72,196,151,0.24)]">
            <Check className="size-9" aria-hidden="true" />
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-jade">Brief publié</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Les bonnes personnes vont le voir.</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">Un brief est plus clair qu&apos;un post et plus humain qu&apos;une annonce. Les réponses arrivent en message.</p>
          <Link href="/feed" className="mt-8 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">Voir le fil</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background px-5 pb-10 pt-6 text-foreground">
      <div className="mx-auto max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" aria-hidden="true" /> Retour</Link>
        <div className="mt-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-jade">BR8 Brief</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Un besoin.<br />Une bonne personne.</h1>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-jade"><BriefcaseBusiness className="size-5" aria-hidden="true" /></div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Le raccourci BR8 pour débloquer un problème professionnel sans publier une annonce froide.</p>

        <div className="mt-8 grid gap-2">
          {types.map(({ id, label, icon: Icon, hint }) => (
            <button key={id} type="button" onClick={() => setType(id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${type === id ? 'border-jade bg-jade/10' : 'border-border bg-card'}`}>
              <span className={`grid size-10 place-items-center rounded-xl ${type === id ? 'bg-jade text-jade-foreground' : 'bg-secondary text-muted-foreground'}`}><Icon className="size-4" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{label}</span><span className="block text-xs text-muted-foreground">{hint}</span></span>
            </button>
          ))}
        </div>

        <label className="mt-6 block text-sm font-semibold" htmlFor="brief">Ton brief</label>
        <textarea id="brief" value={text} onChange={(event) => setText(event.target.value)} maxLength={280} rows={6} placeholder="Ex. Je cherche quelqu'un qui connaît bien les démarches pour lancer une activité indépendante..." className="mt-2 w-full resize-none rounded-3xl border border-border bg-card p-4 text-sm leading-relaxed outline-none transition focus:border-jade focus:ring-2 focus:ring-jade/20" />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>Pas de jargon. Sois concret.</span><span>{text.length}/280</span></div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <button type="button" onClick={() => void publish()} disabled={!text.trim() || busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-sm font-semibold text-background transition-opacity disabled:opacity-40"><Send className="size-4" aria-hidden="true" /> {busy ? 'Publication...' : 'Publier le brief'}</button>
      </div>
    </main>
  )
}

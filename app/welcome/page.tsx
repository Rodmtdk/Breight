import Link from 'next/link'
import { Camera, Map, MessageCircle, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

const POINTS = [
  { numeral: 'I', icon: Camera, label: 'Caméra', accent: 'jade', text: 'Une photo, une story. Capturée, composée, publiée sans friction.' },
  { numeral: 'II', icon: MessageCircle, label: 'Messages', accent: 'cobalt', text: 'Tes conversations, chiffrées de bout en bout, sans compromis.' },
  { numeral: 'III', icon: Play, label: 'Stories', accent: 'gold', text: 'Ce que tes amis partagent, dans un fil pensé pour durer un instant.' },
  { numeral: 'IV', icon: Map, label: 'Carte', accent: 'ruby', text: 'Tes amis, et un vrai itinéraire pour les rejoindre, en temps réel.' },
]

const ACCENT_TEXT: Record<string, string> = {
  jade: 'text-jade',
  cobalt: 'text-cobalt',
  gold: 'text-gold',
  ruby: 'text-ruby',
}

export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col bg-background px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-black tracking-[0.22em] text-foreground"><span className="grid size-5 place-items-center rounded-full bg-gold text-[10px] text-background">B</span><span>breight</span></div>
        <span className="rounded-full border border-jade/25 bg-jade/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-jade">Simple. Direct. Vivant.</span>
      </div>

      <div className="atelier-frame relative mt-10 rounded-[2rem] p-7 sm:p-10">
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-jade/20 blur-3xl" aria-hidden="true" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Manifeste — édition 2026</p>
        <h1 className="relative mt-3 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-foreground text-balance sm:text-5xl">
          BR8, le réseau qui va droit au but.
        </h1>
        <p className="relative mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Partage une story, retrouve tes amis, appelle-les et pars les rejoindre. Chaque détail — typographie, couleur, geste — est pensé pour une audience exigeante.
        </p>
        <div className="atelier-rule relative my-5" />
        <div className="relative flex flex-wrap gap-2 text-[11px] font-semibold text-foreground/80">
          <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">Messages chiffrés</span>
          <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">Snaps éphémères</span>
          <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">Radar d&apos;opportunités</span>
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {POINTS.map(({ numeral, icon: Icon, label, accent, text }) => (
          <li key={label} className="group relative rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm transition-colors hover:border-border">
            <span className="pointer-events-none absolute right-3 top-3 font-serif text-2xl font-semibold text-foreground/10 group-hover:text-foreground/15 transition-colors">{numeral}</span>
            <Icon className={`size-5 ${ACCENT_TEXT[accent]}`} aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold tracking-tight text-foreground">{label}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Link href="/sign-up">
          <Button className="h-12 w-full rounded-2xl text-base">Créer un compte</Button>
        </Link>
        <Link href="/sign-in">
          <Button variant="outline" className="h-12 w-full rounded-2xl">J&apos;ai déjà un compte</Button>
        </Link>
        <p className="pt-2 text-center text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">Breight — composé avec soin</p>
      </div>
    </main>
  )
}

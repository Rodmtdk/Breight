import Link from 'next/link'
import { Camera, Map, MessageCircle, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

const POINTS = [
  { icon: Camera, label: 'Caméra', text: 'Une photo, une story.' },
  { icon: MessageCircle, label: 'Messages', text: 'Tes conversations, chiffrées.' },
  { icon: Play, label: 'Stories', text: 'Ce que tes amis partagent.' },
  { icon: Map, label: 'Carte', text: 'Tes amis, et un vrai itinéraire.' },
]

export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col bg-background px-5 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-black tracking-[0.22em] text-foreground"><span className="grid size-5 place-items-center rounded-full bg-gold text-[10px] text-background">B</span><span>breight</span></div>
        <span className="rounded-full border border-jade/25 bg-jade/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-jade">Simple. Direct. Vivant.</span>
      </div>
      <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-cobalt/20 via-card to-jade/10 p-6">
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-jade/20 blur-3xl" />
        <h1 className="relative text-4xl font-semibold tracking-tight text-foreground text-balance">
        BR8, le réseau qui va droit au but.
        </h1>
        <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Partage une story, retrouve tes amis, appelle-les et pars les rejoindre. Tout est au même endroit.
        </p>
        <div className="relative mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-foreground/80">
          <span className="rounded-full bg-background/70 px-3 py-1.5">Messages chiffrés</span>
          <span className="rounded-full bg-background/70 px-3 py-1.5">Snaps éphémères</span>
          <span className="rounded-full bg-background/70 px-3 py-1.5">Radar d&apos;opportunités</span>
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3">
        {POINTS.map(({ icon: Icon, label, text }) => (
          <li key={label} className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm">
            <Icon className="size-5 text-jade" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">{label}</p>
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
      </div>
    </main>
  )
}

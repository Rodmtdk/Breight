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
      <p className="text-sm font-semibold tracking-tight text-foreground">Breight</p>
      <h1 className="mt-10 text-4xl font-semibold tracking-tight text-foreground text-balance">
        Un réseau simple. Une carte qui guide vraiment.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Caméra, stories, messages et navigation. Rien de plus.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-3">
        {POINTS.map(({ icon: Icon, label, text }) => (
          <li key={label} className="rounded-2xl border border-border bg-card p-4">
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

import Link from 'next/link'
import { Button } from '@/components/ui/button'

const SUITE = [
  {
    code: 'CAM',
    name: 'Caméra',
    tone: 'gold',
    lead: 'Photo.',
    text: 'Une story. Sans détour.',
  },
  {
    code: 'MSG',
    name: 'Messages',
    tone: 'cobalt',
    lead: 'Chiffrés.',
    text: 'Tes mots. Tes gens.',
  },
  {
    code: 'STY',
    name: 'Stories',
    tone: 'ruby',
    lead: 'Instant.',
    text: 'Puis il disparaît.',
  },
  {
    code: 'MAP',
    name: 'Carte',
    tone: 'jade',
    lead: 'Itinéraire.',
    text: 'Tes amis, pour de vrai.',
  },
]

const TONE: Record<string, { chip: string; word: string }> = {
  gold: { chip: 'bg-gold text-background', word: 'text-gold' },
  cobalt: { chip: 'bg-cobalt text-background', word: 'text-cobalt' },
  ruby: { chip: 'bg-ruby text-background', word: 'text-ruby' },
  jade: { chip: 'bg-jade text-background', word: 'text-jade' },
}

export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 py-6 sm:px-10">
      <header className="flex items-center justify-between">
        <p className="suite-kicker text-foreground">
          <span className="text-gold">BR8</span>
          <span className="mx-2 text-foreground/30">/</span>
          Suite
        </p>
        <p className="suite-kicker text-muted-foreground">2026</p>
      </header>

      <h1 className="suite-display mt-12 text-[clamp(3.5rem,14vw,8.75rem)] text-foreground">
        Le <span className="text-gold">réseau</span>
        <br />
        qui va <span className="text-ruby">droit</span>
        <br />
        au <span className="text-cobalt">but.</span>
      </h1>

      <p className="mt-8 max-w-xl text-base leading-snug text-muted-foreground sm:text-lg">
        <span className="font-semibold text-gold">Caméra</span> en or.{' '}
        <span className="font-semibold text-cobalt">Messages</span> en bleu.{' '}
        <span className="font-semibold text-ruby">Stories</span> en rouge.{' '}
        <span className="font-semibold text-jade">Carte</span> en vert.
        Une suite, pas un menu.
      </p>

      <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
        {SUITE.map(({ code, name, tone, lead, text }) => (
          <li key={code} className="bg-card p-4 sm:p-6">
            <span className={`grid size-8 place-items-center rounded-md text-[10px] font-black tracking-tight ${TONE[tone].chip}`}>
              {code}
            </span>
            <p className={`suite-display mt-6 text-3xl sm:text-5xl ${TONE[tone].word}`}>{name}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              <span className={`font-semibold ${TONE[tone].word}`}>{lead}</span>{' '}
              {text}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/sign-up" className="sm:min-w-56">
          <Button className="h-12 w-full rounded-full px-8 text-base font-bold">Créer un compte</Button>
        </Link>
        <Link href="/sign-in" className="sm:min-w-56">
          <Button variant="outline" className="h-12 w-full rounded-full px-8">J&apos;ai déjà un compte</Button>
        </Link>
      </div>
    </main>
  )
}

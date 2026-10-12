import Link from 'next/link'
import { Camera, Flame, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ACTIONS = [
  { icon: Camera, label: 'Caméra' },
  { icon: MessageCircle, label: 'Chat' },
  { icon: Flame, label: 'Stories' },
]

export default function WelcomePage() {
  return (
    <main className="flex min-h-svh flex-col bg-black px-6 py-6 text-white sm:px-10">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <header className="flex items-center justify-between">
          <p className="text-sm font-bold tracking-tight">
            BR<span className="text-[#FFE14A]">8</span>
          </p>
          <Link
            href="/sign-in"
            className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
          >
            Entrer
          </Link>
        </header>

        <div className="flex flex-1 flex-col justify-center py-10 sm:py-16">
          <div className="mb-8 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
            <span className="h-px w-8 bg-[#FFE14A]" aria-hidden="true" />
            Bons moments · relations réelles
          </div>
          <h1 className="suite-display max-w-2xl text-[clamp(3.8rem,14vw,8rem)] text-white">
            Bons
            <br />
            moments.
            <br />
            <span className="text-[#FFE14A]">Relations réelles.</span>
          </h1>
          <p className="mt-7 max-w-sm text-lg leading-snug text-white/65">
            BR8 rassemble ce qui compte : une image, un message, un moment partagé.
          </p>

          <ul className="mt-12 flex max-w-md divide-x divide-white/10 border-y border-white/10 py-4">
            {ACTIONS.map(({ icon: Icon, label }, index) => (
              <li key={label} className="flex flex-1 items-center gap-2 px-3 first:pl-0 last:pr-0 sm:gap-3">
                <Icon className="size-4 text-[#FFE14A]" aria-hidden="true" />
                <span className="text-xs font-medium text-white/65">0{index + 1} {label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 pb-2 sm:grid-cols-[1fr_auto]">
          <Link href="/sign-up">
            <Button className="h-14 w-full rounded-2xl bg-[#FFE14A] text-base font-bold text-black shadow-[0_16px_40px_-18px_#FFE14A] transition-transform duration-200 hover:bg-[#FFE14A] active:scale-[0.98]">
              Commencer
            </Button>
          </Link>
          <Link
            href="/sign-in"
            className="flex h-14 items-center justify-center rounded-2xl border border-white/15 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  )
}

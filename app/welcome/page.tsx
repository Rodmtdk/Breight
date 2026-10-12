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

        <div className="flex flex-1 flex-col justify-center py-10">
          <h1 className="suite-display text-[clamp(4.75rem,16vw,8.5rem)] text-white">
            Droit
            <br />
            au <span className="text-[#FFE14A]">but.</span>
          </h1>
          <p className="mt-6 text-base text-white/60">Photo. Amis. Maintenant.</p>

          <ul className="mt-10 grid max-w-sm grid-cols-3 gap-3">
            {ACTIONS.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Link
                  href="/sign-up"
                  className="flex h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <Icon className="size-6 text-white" aria-hidden="true" />
                  <span className="text-xs font-medium text-white/70">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/sign-up" className="pb-2">
          <Button className="h-14 w-full rounded-2xl bg-[#FFE14A] text-base font-bold text-black shadow-[0_16px_40px_-18px_#FFE14A] transition-transform duration-200 hover:bg-[#FFE14A] active:scale-[0.98]">
            Créer un compte
          </Button>
        </Link>
      </div>
    </main>
  )
}

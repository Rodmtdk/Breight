import Link from 'next/link'
import { ShieldCheck, Users, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Users,
    title: 'Découverte par affinités',
    desc: 'Rencontre des personnes qui partagent vraiment tes centres d\'intérêt. Notre algorithme calcule un score d\'affinité réel.',
  },
  {
    icon: MessageCircle,
    title: 'Conversations profondes',
    desc: 'Des questions d\'amorce pensées pour dépasser le "ça va". Chaque échange compte.',
  },
  {
    icon: ShieldCheck,
    title: 'Chiffrement E2E',
    desc: 'Tes messages sont chiffrés sur ton appareil. Même nous ne pouvons pas les lire.',
  },
  {
    icon: Sparkles,
    title: 'Empathie mesurée',
    desc: 'Un score d\'empathie en temps réel pour t\'aider à être vraiment présent dans tes échanges.',
  },
]

const STEPS = [
  { number: '01', label: 'Crée ton profil', desc: 'Prénom, centres d\'intérêt, bio courte. 2 minutes.' },
  { number: '02', label: 'Découvre', desc: 'Swipe sur des profils compatibles avec toi.' },
  { number: '03', label: 'Connecte-toi', desc: 'Un match = une conversation chiffrée s\'ouvre.' },
]

export default function WelcomePage() {
  return (
    <main className="min-h-svh bg-background flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto w-full">
        <span className="text-lg font-semibold tracking-tight text-foreground">BREIGHT</span>
        <Link href="/sign-in">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Connexion
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-10 pb-12 max-w-lg mx-auto w-full">
        <div className="inline-flex items-center gap-2 rounded-full bg-warm/10 border border-warm/20 px-3 py-1 mb-6">
          <span className="size-1.5 rounded-full bg-warm" aria-hidden="true" />
          <span className="text-xs font-medium text-warm">Messagerie E2E · Connexions authentiques</span>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground text-balance leading-tight mb-4">
          Des vraies connexions,<br />pas du scroll vide
        </h1>
        <p className="text-base text-muted-foreground text-balance leading-relaxed mb-8 max-w-xs">
          BREIGHT est une app de rencontre sociale basée sur l&apos;écoute active, les affinités réelles et des conversations qui ont du sens.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/sign-up" className="w-full">
            <Button className="w-full h-12 text-base">Rejoindre gratuitement</Button>
          </Link>
          <Link href="/sign-in" className="w-full">
            <Button variant="outline" className="w-full h-12 text-base">J&apos;ai déjà un compte</Button>
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-card border-y border-border py-5 px-5">
        <div className="max-w-lg mx-auto flex items-center justify-around gap-4">
          {[
            { value: 'E2E', label: 'Chiffrement' },
            { value: '100%', label: 'Gratuit' },
            { value: '0', label: 'Pub' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-semibold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-10 max-w-lg mx-auto w-full">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Pourquoi BREIGHT
        </h2>
        <div className="flex flex-col gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 items-start rounded-2xl bg-card border border-border p-4">
              <div className="flex-shrink-0 flex items-center justify-center size-9 rounded-xl bg-warm/10">
                <Icon className="size-4 text-warm" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 pb-10 max-w-lg mx-auto w-full">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Comment ça marche
        </h2>
        <div className="flex flex-col gap-0">
          {STEPS.map(({ number, label, desc }, i) => (
            <div key={number} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {number}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px h-8 bg-border mt-1" aria-hidden="true" />
                )}
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-5 pb-12 max-w-lg mx-auto w-full">
        <div className="rounded-2xl bg-primary p-6 flex flex-col items-center text-center gap-4">
          <h2 className="text-xl font-semibold text-primary-foreground text-balance">
            Prêt à te connecter vraiment ?
          </h2>
          <p className="text-sm text-primary-foreground/70 text-balance">
            Crée ton compte en moins de 2 minutes. Aucune carte requise.
          </p>
          <Link href="/sign-up" className="w-full">
            <Button variant="secondary" className="w-full h-11">
              Commencer maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BREIGHT &mdash; Connexions authentiques, chiffrées de bout en bout
        </p>
      </footer>

    </main>
  )
}

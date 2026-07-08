import Link from 'next/link'
import { ShieldCheck, Users, MessageCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    accent: 'jade',
    icon: Users,
    title: 'Affinités réelles',
    desc: "Un algorithme qui calcule la compatibilité vraie — centres d'intérêt, valeurs, rythme de vie.",
  },
  {
    accent: 'cobalt',
    icon: MessageCircle,
    title: 'Conversations profondes',
    desc: 'Des questions d\'amorce pensées pour aller au-delà du superficiel dès le premier échange.',
  },
  {
    accent: 'mauve',
    icon: Sparkles,
    title: 'Empathie en direct',
    desc: 'Un score d\'écoute qui t\'aide à être vraiment présent dans chaque conversation.',
  },
  {
    accent: 'ruby',
    icon: ShieldCheck,
    title: 'Chiffrement E2E',
    desc: 'Tes messages sont chiffrés sur ton appareil. Personne d\'autre que toi et ton interlocuteur ne peut les lire.',
  },
]

const ACCENT_CLASSES: Record<string, { bg: string; text: string }> = {
  jade:   { bg: 'bg-jade/10',   text: 'text-jade'   },
  cobalt: { bg: 'bg-cobalt/10', text: 'text-cobalt'  },
  mauve:  { bg: 'bg-mauve/10',  text: 'text-mauve'   },
  ruby:   { bg: 'bg-ruby/10',   text: 'text-ruby'    },
  gold:   { bg: 'bg-gold/10',   text: 'text-gold'    },
}

const STEPS = [
  { num: '01', label: 'Crée ton profil', desc: 'Prénom, centres d\'intérêt, une bio. 90 secondes.' },
  { num: '02', label: 'Découvre', desc: 'Swipe sur des profils avec un vrai score d\'affinité.' },
  { num: '03', label: 'Connecte-toi', desc: 'Un match = une conversation chiffrée s\'ouvre instantanément.' },
]

export default function WelcomePage() {
  return (
    <main className="min-h-svh bg-background flex flex-col">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-5 py-5 max-w-lg mx-auto w-full">
        <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
          Breight
        </span>
        <Link href="/sign-in">
          <Button variant="ghost" size="sm" className="text-muted-foreground font-medium text-sm h-9 px-4 rounded-full">
            Connexion
          </Button>
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-6 pt-8 pb-14 max-w-lg mx-auto w-full">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-jade/25 bg-jade/6 px-3.5 py-1.5 mb-8">
          <span className="size-1.5 rounded-full bg-jade animate-pulse" aria-hidden="true" />
          <span className="text-xs font-medium text-jade tracking-wide">Connexions authentiques · E2E</span>
        </div>

        <h1 className="font-serif text-[2.6rem] font-semibold leading-[1.1] tracking-tight text-foreground text-balance mb-5">
          Des vraies connexions,<br />
          <em className="not-italic text-jade">pas du scroll vide</em>
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed text-balance mb-10 max-w-[20rem]">
          BREIGHT réunit des personnes qui veulent vraiment se connaître — grâce à l&apos;écoute active et aux affinités réelles.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/sign-up" className="w-full">
            <Button className="w-full h-13 text-base font-semibold rounded-2xl shadow-md shadow-jade/20 gap-2">
              Rejoindre gratuitement
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/sign-in" className="w-full">
            <Button variant="outline" className="w-full h-12 text-sm font-medium rounded-2xl border-border/60">
              J&apos;ai déjà un compte
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-border bg-card py-5 px-5">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {[
            { value: 'E2E',   label: 'Chiffrement', color: 'text-jade'   },
            { value: '100%',  label: 'Gratuit',      color: 'text-cobalt' },
            { value: '0',     label: 'Publicité',    color: 'text-ruby'   },
            { value: '∞',     label: 'Connexions',   color: 'text-mauve'  },
          ].map(({ value, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className={`text-2xl font-serif font-semibold ${color}`}>{value}</span>
              <span className="text-[11px] text-muted-foreground tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-5 py-10 max-w-lg mx-auto w-full">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Pourquoi BREIGHT ?</h2>
        <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
          Une plateforme conçue pour que chaque conversation compte.
        </p>
        <div className="flex flex-col gap-3">
          {FEATURES.map(({ accent, icon: Icon, title, desc }) => {
            const cls = ACCENT_CLASSES[accent]
            return (
              <div
                key={title}
                className="flex gap-4 items-start rounded-2xl bg-card border border-border/70 p-5 shadow-sm"
              >
                <div className={`flex-shrink-0 flex items-center justify-center size-10 rounded-xl ${cls.bg}`}>
                  <Icon className={`size-5 ${cls.text}`} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground leading-tight mb-1">{title}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-5 pb-10 max-w-lg mx-auto w-full">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-7">Comment ça marche</h2>
        <div className="flex flex-col">
          {STEPS.map(({ num, label, desc }, i) => (
            <div key={num} className="flex gap-5 items-start">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center size-9 rounded-full bg-primary text-primary-foreground text-xs font-bold font-sans shrink-0">
                  {num}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-1 mb-0 h-8" aria-hidden="true" />
                )}
              </div>
              <div className="pb-7">
                <p className="text-[15px] font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-5 pb-14 max-w-lg mx-auto w-full">
        <div className="rounded-3xl bg-primary px-6 py-8 flex flex-col items-center text-center gap-5 shadow-lg shadow-primary/20">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-primary-foreground text-balance leading-tight mb-2">
              Prêt à te connecter vraiment ?
            </h2>
            <p className="text-sm text-primary-foreground/65 text-balance leading-relaxed">
              Crée ton compte en 90 secondes. Gratuit, sans pub, chiffré.
            </p>
          </div>
          <Link href="/sign-up" className="w-full max-w-xs">
            <Button
              variant="secondary"
              className="w-full h-12 font-semibold rounded-2xl shadow-sm gap-2"
            >
              Commencer maintenant
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 py-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Breight &mdash; Connexions authentiques, chiffrées de bout en bout
        </p>
      </footer>

    </main>
  )
}

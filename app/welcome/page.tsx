'use client'

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

const STEPS = [
  { num: '01', label: 'Crée ton profil', desc: 'Prénom, centres d\'intérêt, une bio. 90 secondes.' },
  { num: '02', label: 'Découvre', desc: 'Swipe sur des profils avec un vrai score d\'affinité.' },
  { num: '03', label: 'Connecte-toi', desc: 'Un match = une conversation chiffrée s\'ouvre instantanément.' },
]

export default function WelcomePage() {
  return (
    <main className="min-h-svh bg-background flex flex-col overflow-hidden">

      {/* ── Deco blob background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-jade/8 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-mauve/6 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-br from-cobalt/4 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true" />
      </div>

      {/* ── Content container ── */}
      <div className="relative z-10">

        {/* ── Nav ── */}
        <nav className="flex items-center justify-between px-5 py-5 max-w-lg mx-auto w-full">
          <span className="font-serif text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-jade via-foreground to-ruby bg-clip-text text-transparent">
            Breight
          </span>
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="text-muted-foreground font-medium text-sm h-9 px-4 rounded-full hover:bg-jade/8">
              Connexion
            </Button>
          </Link>
        </nav>

        {/* ── Hero ── */}
        <section className="flex flex-col items-start px-6 pt-12 pb-16 max-w-lg mx-auto w-full">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-jade/40 bg-jade/10 px-4 py-2 mb-12 animate-fade-in shadow-sm shadow-jade/10">
            <span className="size-1.5 rounded-full bg-jade" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-jade tracking-[0.12em] uppercase">Connexions authentiques · E2E</span>
          </div>

          {/* Hero text — asymétrique Picasso */}
          <div className="mb-14 space-y-3">
            <h1 className="font-serif text-5xl font-black leading-[1.05] tracking-tight text-foreground text-balance">
              Des <span className="text-jade italic font-light">vraies</span> connexions
            </h1>
            <p className="font-serif text-4xl font-light text-mauve/75 leading-snug">
              pas du scroll vide
            </p>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed text-balance mb-12 max-w-[22rem] font-light">
            La plateforme où chaque conversation compte vraiment — écoute active, affinités réelles, zéro pub.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/sign-up" className="w-full">
              <Button className="w-full h-13 text-base font-semibold rounded-2xl shadow-lg shadow-jade/20 gap-2 hover:shadow-xl transition-all duration-200">
                Rejoindre gratuitement
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full">
              <Button variant="outline" className="w-full h-12 text-sm font-medium rounded-2xl border-border/60 hover:bg-jade/4 transition-colors">
                J&apos;ai déjà un compte
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Stats strip — asymétrique ── */}
        <section className="precision-grid border-y border-border/50 bg-gradient-to-r from-jade/3 via-transparent to-mauve/3 py-8 px-5 mb-6">
          <div className="max-w-lg mx-auto flex items-center justify-around">
            {[
              { value: 'E2E',   label: 'Chiffrement', color: 'text-jade'   },
              { value: '100%',  label: 'Gratuit',      color: 'text-cobalt' },
              { value: '0',     label: 'Pub',          color: 'text-ruby'   },
            ].map(({ value, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <span className={`text-3xl font-serif font-bold ${color}`}>{value}</span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features grid — offset ── */}
        <section className="px-5 py-6 max-w-lg mx-auto w-full">
          <div className="mb-6">
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-1">Pourquoi BREIGHT</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Chaque detail compte.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map(({ accent, icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`flex flex-col gap-3 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  i % 2 === 0 ? 'bg-gradient-to-br from-' + accent + '/8 to-transparent border border-' + accent + '/15' : 'bg-card border border-border/60 shadow-sm'
                }`}
              >
                <div className={`flex items-center justify-center size-12 rounded-xl bg-${accent}/12 w-fit`}>
                  <Icon className={`size-5 text-${accent}`} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works — timeline créative ── */}
        <section className="px-5 py-8 max-w-lg mx-auto w-full">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-8">3 étapes</h2>
          <div className="space-y-8 relative">
            {STEPS.map(({ num, label, desc }, i) => (
              <div key={num} className="flex gap-6 items-start relative">
                {/* Circle badge */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="flex items-center justify-center size-12 rounded-full bg-gradient-to-br from-jade to-cobalt text-white text-sm font-bold font-sans shadow-lg shadow-jade/30">
                    {num}
                  </div>
                </div>
                {/* Content */}
                <div className="pt-2">
                  <p className="text-base font-semibold text-foreground leading-tight mb-2">{label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                {/* Vertical line — créative */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute left-6 top-12 w-1 h-16 bg-gradient-to-b from-jade via-mauve to-transparent rounded-full"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA — gradient audacieux ── */}
        <section className="px-5 py-8 max-w-lg mx-auto w-full mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary via-primary to-ruby px-8 py-10 flex flex-col items-start gap-6 shadow-xl shadow-primary/30 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-ruby/10 rounded-full blur-2xl" aria-hidden="true" />
            <div className="relative z-10">
              <h2 className="font-serif text-3xl font-bold text-primary-foreground leading-tight mb-2">
                Prêt à te<br />connecter<br /><em className="not-italic text-amber-100">vraiment</em> ?
              </h2>
              <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
                Crée ton compte en 90 secondes. Gratuit, sans pub, chiffré E2E.
              </p>
            </div>
            <Link href="/sign-up" className="w-full max-w-xs mt-2 relative z-10">
              <Button
                variant="secondary"
                className="w-full h-12 font-semibold rounded-2xl shadow-md gap-2"
              >
                Commencer maintenant
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-5 py-6 border-t border-border/50 text-center bg-gradient-to-t from-jade/2 to-transparent">
          <p className="text-xs text-muted-foreground/60 tracking-wide">
            &copy; {new Date().getFullYear()} BREIGHT &mdash; chiffré E2E · sans pub · gratuit
          </p>
        </footer>

      </div>
    </main>
  )
}

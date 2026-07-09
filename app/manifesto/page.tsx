import Link from 'next/link'
import { ArrowRight, Heart, Ear, Lock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BREIGHT } from '@/lib/breight-brand'

export default function ManifestoPage() {
  return (
    <main className="min-h-svh bg-background">
      {/* Hero */}
      <section className="relative mx-auto max-w-2xl px-5 pt-16 pb-12 text-center">
        <h1 className="font-serif text-5xl font-bold leading-tight text-foreground gradient-text-pride">
          {BREIGHT.manifesto.headline}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {BREIGHT.manifesto.subheading}
        </p>
      </section>

      {/* Three pillars */}
      <section className="mx-auto max-w-2xl px-5 py-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {Object.entries(BREIGHT.manifesto.sections).map(([key, section]) => (
          <div
            key={key}
            className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300"
          >
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{section.text}</p>
          </div>
        ))}
      </section>

      {/* 5 Principles */}
      <section className="mx-auto max-w-2xl px-5 py-16">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">
          Les 5 principes de l'écoute active
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {BREIGHT.principles.map((principle, idx) => (
            <div
              key={principle.title}
              className="flex gap-4 rounded-xl bg-gradient-to-r from-jade/10 to-transparent p-5 border border-border/50"
            >
              <div className="text-3xl flex-shrink-0">{principle.icon}</div>
              <div>
                <h3 className="font-semibold text-foreground">{principle.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{principle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What makes us different */}
      <section className="mx-auto max-w-2xl px-5 py-16">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">
          Ce qui nous rend différents
        </h2>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {[
            { icon: Lock, label: 'E2E chiffré', desc: 'Tes mots t\'appartiennent' },
            { icon: Zap, label: 'Pas de pub', desc: 'Zéro tracking, zéro vente' },
            { icon: Heart, label: 'Listening Score', desc: 'L\'écoute mesurée' },
            { icon: Ear, label: 'Active listening', desc: 'L\'écoute vraie valorisée' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl bg-secondary p-4 text-center">
              <Icon className="size-6 mx-auto text-jade mb-2" />
              <h3 className="font-semibold text-foreground">{label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
          Prêt à écouter profond ?
        </h2>
        <p className="text-muted-foreground mb-6">
          Rejoins un mouvement d'écoute active. Ton voyage commence maintenant.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/sign-up">
            <Button className="w-full sm:w-auto gap-2">
              Créer un compte
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-20" />
    </main>
  )
}

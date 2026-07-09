import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { BottomNav } from '@/components/bottom-nav'
import { ArrowRight, Sparkles, Heart, Zap, BookOpen, Moon } from 'lucide-react'

const RARITY_FEATURES = [
  {
    id: 'echoes',
    title: 'Echoes System',
    description: 'Vos réponses créent du contenu émergent visible à votre réseau',
    icon: Sparkles,
    color: 'jade',
  },
  {
    id: 'listening-style',
    title: 'Listening Style Matching',
    description: 'Matcher avec quelqu\'un basé sur comment vous écoutez vraiment',
    icon: Heart,
    color: 'cobalt',
  },
  {
    id: 'passages',
    title: 'Rituels & Passages',
    description: 'Rites d\'initiation qui se débloquent à chaque niveau d\'écoute',
    icon: Zap,
    color: 'mauve',
  },
  {
    id: 'reflections',
    title: 'Analytics Poétiques',
    description: 'Histoires narratives de votre semaine d\'écoute',
    icon: BookOpen,
    color: 'gold',
  },
  {
    id: 'rituals',
    title: 'Daily Rituals',
    description: 'Morning intentions + Night reflections pour créer l\'habitude',
    icon: Moon,
    color: 'ruby',
  },
]

export default async function RarityPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <header className="px-5 pt-8 pb-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Rarité Breight
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          5 systèmes uniques qui rendent Breight irremplaçable. Aucune autre plateforme n'a cela.
        </p>
      </header>

      <div className="flex flex-col gap-3 px-5">
        {RARITY_FEATURES.map((feature) => {
          const Icon = feature.icon
          const colorClass = {
            jade: 'from-jade/10 to-jade/5 border-jade/20',
            cobalt: 'from-cobalt/10 to-cobalt/5 border-cobalt/20',
            mauve: 'from-mauve/10 to-mauve/5 border-mauve/20',
            gold: 'from-gold/10 to-gold/5 border-gold/20',
            ruby: 'from-ruby/10 to-ruby/5 border-ruby/20',
          }[feature.color as keyof typeof colorClass]

          return (
            <Link
              key={feature.id}
              href={`/rarity/${feature.id}`}
              className={`group rounded-lg bg-gradient-to-br ${colorClass} border border-border p-5 transition-all hover:shadow-lg hover:scale-102`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="size-5 text-foreground group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {feature.description}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground mt-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 px-5 py-6 rounded-lg bg-card border border-border/50">
        <h2 className="text-sm font-semibold text-foreground mb-3">Pourquoi c'est rare ?</h2>
        <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <li>• <strong>Echoes</strong> transforment chaque réponse en contenu émergent</li>
          <li>• <strong>Listening Style</strong> match comment vous écoutez, pas qui vous êtes</li>
          <li>• <strong>Rituels</strong> débloquent des rites d'initiation Breight</li>
          <li>• <strong>Analytics poétiques</strong> racontent votre histoire d'écoute</li>
          <li>• <strong>Daily Rituals</strong> créent l'habitude quotidienne irrésistible</li>
        </ul>
      </div>

      <BottomNav />
    </main>
  )
}

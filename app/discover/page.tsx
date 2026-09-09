import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { BottomNav } from '@/components/bottom-nav'
import { TrendingList } from '@/components/trending-list'
import { FollowButton } from '@/components/follow-button'
import { getTrending, getNotifications, getUnreadNotificationCount } from '@/app/actions/social'
import { Flame, Users, Eye, Zap, BookOpen, Crosshair } from 'lucide-react'
import { BREIGHT } from '@/lib/breight-brand'

const MOCK_TRENDING = [
  { echoId: '1', score: 342, rank: 1, author: 'Sarah L.', preview: 'Écouter vraiment, c\'est accepter de ne pas avoir de réponse...' },
  { echoId: '2', score: 298, rank: 2, author: 'Marc V.', preview: 'Les meilleures conversations ne parlent pas de toi, elles te parlent...' },
  { echoId: '3', score: 267, rank: 3, author: 'Emma T.', preview: 'Quand quelqu\'un écoute vraiment, tu te sens moins seul...' },
]

const MOCK_SUGGESTIONS = [
  { id: '1', name: 'Alice Chen', listeningStyle: 'Empathetic', followers: 2340 },
  { id: '2', name: 'James Woods', listeningStyle: 'Curious', followers: 1840 },
  { id: '3', name: 'Sofia Rossi', listeningStyle: 'Reflective', followers: 3120 },
  { id: '4', name: 'Dev Patel', listeningStyle: 'Patient', followers: 1560 },
]

export default async function DiscoverPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const unreadCount = await getUnreadNotificationCount()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border px-5 py-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Découvrir</h1>
        <p className="text-xs text-muted-foreground mt-1">Explore les connexions les plus profondes du jour</p>
      </header>

      <div className="flex flex-col gap-8 px-5 py-6">

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border -mx-5 px-5 sticky top-16">
          <Link href="/discover" className="pb-3 border-b-2 border-jade text-foreground font-medium text-sm">
            Tendances
          </Link>
          <button className="pb-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground text-sm transition-colors">
            Gens
          </button>
        </div>

        {/* Professional suite bridge */}
        <section className="precision-grid rounded-2xl border border-border bg-card/60 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-jade">{BREIGHT.professionalSuite.eyebrow}</p>
          <h2 className="mt-2 font-serif text-xl font-bold text-foreground">Un réseau qui sait d’où il vient.</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Découvre le geste, la méthode, puis les personnes qui peuvent t’aider à progresser.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href={BREIGHT.professionalSuite.portfolio.href} className="rounded-xl border border-jade/25 bg-jade/8 p-3 transition-colors hover:bg-jade/12">
              <Crosshair className="size-4 text-jade" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-foreground">{BREIGHT.professionalSuite.portfolio.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Une réalisation pour lancer la conversation.</p>
            </Link>
            <Link href={BREIGHT.professionalSuite.manual.href} className="rounded-xl border border-cobalt/25 bg-cobalt/8 p-3 transition-colors hover:bg-cobalt/12">
              <BookOpen className="size-4 text-cobalt" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-foreground">{BREIGHT.professionalSuite.manual.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Une méthode à transmettre.</p>
            </Link>
          </div>
        </section>

        {/* Trending Section */}
        <section>
          <TrendingList items={MOCK_TRENDING} period="today" />
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-card/50 p-4 flex flex-col items-center gap-2 text-center">
            <Flame className="size-5 text-ruby" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">Trending ce jour</p>
            <p className="text-lg font-bold text-foreground">342 interactions</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4 flex flex-col items-center gap-2 text-center">
            <Users className="size-5 text-jade" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">Personnes en ligne</p>
            <p className="text-lg font-bold text-foreground">1.2K</p>
          </div>
        </section>

        {/* Suggestions Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-cobalt" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">À découvrir</h2>
          </div>

          <div className="space-y-3">
            {MOCK_SUGGESTIONS.map((person) => (
              <div key={person.id} className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{person.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Style : {person.listeningStyle}</p>
                  <p className="text-xs text-muted-foreground">{person.followers.toLocaleString()} abonnés</p>
                </div>
                <FollowButton userId={person.id} size="sm" />
              </div>
            ))}
          </div>
        </section>

        {/* Insights Card */}
        <section className="rounded-xl bg-gradient-to-br from-jade/10 to-cobalt/10 border border-border p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-gold" aria-hidden="true" />
            <h3 className="font-semibold text-foreground">Conseil du jour</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les conversations profondes commencent par une vraie question. Essaie de poser une question sans penser à la réponse.
          </p>
        </section>

      </div>

      <BottomNav unreadCount={unreadCount} />
    </main>
  )
}

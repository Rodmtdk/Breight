import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { ListeningScoreCard } from '@/components/listening-score-card'
import { BREIGHT, type Badge } from '@/lib/breight-brand'

export default async function InsightsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  // Mock leaderboard data — TODO: fetch from DB
  const mockLeaderboard = [
    { name: 'Alice', score: 92, badge: 'Heart', emoji: '❤️', rank: 1 },
    { name: 'Bob', score: 87, badge: 'Sage', emoji: '🧠', rank: 2 },
    { name: 'You', score: 72, badge: 'Empath', emoji: '💜', rank: 3 },
    { name: 'Clara', score: 68, badge: 'Listener', emoji: '👂', rank: 4 },
    { name: 'David', score: 45, badge: 'Listener', emoji: '👂', rank: 5 },
  ]

  return (
    <main className="min-h-svh bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-lg px-5 py-4 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-foreground">Tes insights</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5 py-8 space-y-8">
        {/* Main Score Card */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
            Ton score d'écoute
          </h2>
          <ListeningScoreCard showLabel={true} compact={false} />
        </section>

        {/* Badges unlocked */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
            Badges débloqués
          </h2>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="grid grid-cols-5 gap-4">
              {BREIGHT.badges.map((badge) => (
                <div key={badge.name} className="flex flex-col items-center gap-2">
                  <div className="text-4xl">{badge.emoji}</div>
                  <p className="text-xs font-semibold text-center text-foreground leading-tight">
                    {badge.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{badge.min}+</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
            Leaderboard
          </h2>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {mockLeaderboard.map((entry) => (
              <div
                key={entry.name}
                className={`flex items-center justify-between p-4 ${
                  entry.name === 'You' ? 'bg-jade/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-muted-foreground w-6">#{entry.rank}</span>
                  <div className="text-2xl">{entry.emoji}</div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {entry.name}{entry.name === 'You' && ' (toi)'}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.badge}</p>
                  </div>
                </div>
                <p className="font-bold text-lg text-jade">{entry.score}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About Listening Score */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
            À propos de ton score
          </h2>
          <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Comment ça fonctionne</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Envoyer un message = +1 point</li>
                <li>• Poser une question profonde = +5 points</li>
                <li>• Partager un moment = +10 points</li>
                <li>• Conversation 20+ messages = +15 points</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Manifesto link */}
        <div className="text-center py-4">
          <Link
            href="/manifesto"
            className="inline-flex items-center gap-2 text-sm text-jade hover:underline font-medium"
          >
            Lire notre manifesto
            <ArrowLeft className="size-3 rotate-180" />
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

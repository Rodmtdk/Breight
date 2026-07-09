'use client'

import { useEffect, useState } from 'react'
import { getListeningScore } from '@/app/actions/listening-score'
import { BREIGHT, type Badge } from '@/lib/breight-brand'
import { Progress } from '@/components/ui/progress'

interface ListeningScoreCardProps {
  userId?: string
  showLabel?: boolean
  compact?: boolean
}

function formatListeningScore(score: number): { emoji: string; level: string; color: string } {
  const badge = BREIGHT.badges.find((b) => score >= b.min && score < b.max) || BREIGHT.badges[0]
  return { emoji: badge.emoji, level: badge.name, color: badge.color }
}

export function ListeningScoreCard({ userId, showLabel = true, compact = false }: ListeningScoreCardProps) {
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const s = await getListeningScore(userId)
      setScore(s || 0)
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) {
    return <div className="h-12 w-full animate-pulse rounded-lg bg-secondary" />
  }

  const { emoji, level, color } = formatListeningScore(score)
  const nextLevel = BREIGHT.badges.find((b) => score < b.min)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <div className="text-sm font-semibold text-foreground">{level}</div>
          <div className="text-xs text-muted-foreground">{score}/100</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">Ton score d'écoute</h3>
        <span className="text-4xl">{emoji}</span>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-sm font-medium text-foreground">{level}</p>
          <p className="text-lg font-bold text-foreground">{score}%</p>
        </div>
        <Progress value={score} className="h-2" />
      </div>

      {nextLevel && (
        <p className="text-xs text-muted-foreground">
          {nextLevel.min - score} points avant {nextLevel.name} {nextLevel.emoji}
        </p>
      )}
    </div>
  )
}

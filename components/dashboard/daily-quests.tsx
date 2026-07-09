'use client'

import { useState, useEffect } from 'react'
import { BREIGHT } from '@/lib/breight-brand'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface QuestProgress {
  questId: string
  completed: boolean
  progress: number // 0-100
}

export function DailyQuests() {
  const [questProgress, setQuestProgress] = useState<QuestProgress[]>([])
  const [totalRewards, setTotalRewards] = useState(0)

  useEffect(() => {
    // TODO: Fetch quest progress from DB
    // For now, mock data
    setQuestProgress(
      BREIGHT.quests.map((q) => ({
        questId: q.id,
        completed: Math.random() > 0.6,
        progress: Math.floor(Math.random() * 100),
      }))
    )
    setTotalRewards(
      BREIGHT.quests.reduce((acc, q) => {
        const quest = questProgress.find((qp) => qp.questId === q.id)
        return acc + (quest?.completed ? q.reward : 0)
      }, 0)
    )
  }, [])

  const completedCount = questProgress.filter((q) => q.completed).length
  const totalCount = BREIGHT.quests.length

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-secondary/20 to-transparent p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Quêtes du jour</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complète les challenges d'écoute et gagne des points
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Points</p>
          <p className="text-2xl font-bold text-jade">{totalRewards}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-foreground">
            {completedCount}/{totalCount} complétés
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round((completedCount / totalCount) * 100)}%
          </span>
        </div>
        <Progress value={(completedCount / totalCount) * 100} className="h-2" />
      </div>

      {/* Quest list */}
      <div className="space-y-3">
        {BREIGHT.quests.map((quest) => {
          const progress = questProgress.find((q) => q.questId === quest.id)
          const isCompleted = progress?.completed
          const progressPercent = progress?.progress || 0

          return (
            <div
              key={quest.id}
              className={`rounded-lg border transition-all duration-200 p-4 ${
                isCompleted
                  ? 'bg-jade/10 border-jade/30'
                  : 'bg-secondary/50 border-border/50 hover:border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{quest.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-foreground text-sm">{quest.title}</h3>
                    <span className="text-xs font-semibold text-jade shrink-0">
                      +{quest.reward}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{quest.description}</p>
                  {!isCompleted && (
                    <Progress value={progressPercent} className="h-1 mt-2" />
                  )}
                  {isCompleted && (
                    <p className="text-xs text-jade font-medium mt-2">Complété</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Daily reset info */}
      <p className="text-xs text-muted-foreground text-center mt-6 pt-4 border-t border-border/50">
        Les quêtes se réinitialisent chaque jour à minuit
      </p>
    </div>
  )
}

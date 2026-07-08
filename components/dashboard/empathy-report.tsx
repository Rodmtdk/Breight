'use client'

import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getTodayEmpathyReport } from '@/app/actions/chat'
import { MessageCircle, HelpCircle, Sparkles, HeartHandshake } from 'lucide-react'

export function EmpathyReport() {
  const { data } = useSWR('empathy-report', () => getTodayEmpathyReport(), {
    refreshInterval: 15000,
  })

  const score = data?.connectionScore ?? 0

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-foreground">
          {"Rapport d'écoute — aujourd'hui"}
        </h2>
        <span className="text-lg font-semibold text-warm tabular-nums">{score}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Ton score de connexion grandit quand tu poses des questions, partages
        tes émotions et utilises les invitations profondes.
      </p>
      <Progress value={score} className="mb-4 h-2" aria-label={`Score de connexion : ${score} sur 100`} />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-secondary p-2.5">
          <MessageCircle className="size-4 text-warm shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {data?.messagesSent ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Messages</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-secondary p-2.5">
          <HelpCircle className="size-4 text-warm shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {data?.questionsAsked ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Questions posées</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-secondary p-2.5">
          <Sparkles className="size-4 text-warm shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {data?.promptsUsed ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Invitations profondes</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-secondary p-2.5">
          <HeartHandshake className="size-4 text-warm shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {data?.moodShares ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Émotions partagées</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

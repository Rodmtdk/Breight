'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GUIDED_PROMPTS } from '@/lib/prompts'
import { Sparkles, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

function getDailyIndex(total: number): number {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  )
  return dayOfYear % total
}

export function DailyPrompt() {
  const initialIndex = useMemo(() => getDailyIndex(GUIDED_PROMPTS.length), [])
  const [index, setIndex] = useState(initialIndex)
  const [spinning, setSpinning] = useState(false)

  const prompt = GUIDED_PROMPTS[index]

  const shuffle = () => {
    setSpinning(true)
    setTimeout(() => {
      setIndex((i) => (i + 1) % GUIDED_PROMPTS.length)
      setSpinning(false)
    }, 300)
  }

  return (
    <Card className="p-4 border-warm/30 bg-card">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-warm shrink-0" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Question du jour</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Nouvelle question"
          onClick={shuffle}
        >
          <RefreshCw className={cn('size-3.5 transition-transform duration-300', spinning && 'rotate-180')} />
        </Button>
      </div>
      <p className="text-sm leading-relaxed text-foreground text-balance">
        &ldquo;{prompt.text}&rdquo;
      </p>
      {prompt.followUp && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed italic">
          ↳ {prompt.followUp}
        </p>
      )}
      <span className="mt-3 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
        {prompt.category}
      </span>
    </Card>
  )
}

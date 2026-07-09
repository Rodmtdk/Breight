'use client'

import { Flame, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendingItem {
  echoId: string
  score: number
  rank: number
  author: string
  preview: string
}

interface TrendingListProps {
  items: TrendingItem[]
  period?: 'today' | 'week' | 'all'
  onItemClick?: (echoId: string) => void
}

export function TrendingList({ items, period = 'today', onItemClick }: TrendingListProps) {
  const periodLabel = {
    today: "Aujourd'hui",
    week: 'Cette semaine',
    all: 'All-time',
  }[period]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <Flame className="size-5 text-ruby" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">Tendances {periodLabel}</h3>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <button
            key={item.echoId}
            onClick={() => onItemClick?.(item.echoId)}
            className="w-full flex items-start gap-3 rounded-lg hover:bg-secondary/50 p-3 transition-colors group"
          >
            {/* Rank Badge */}
            <div className={cn(
              'flex-shrink-0 flex items-center justify-center size-8 rounded-full font-bold text-sm transition-colors',
              idx === 0 && 'bg-ruby/20 text-ruby',
              idx === 1 && 'bg-gold/20 text-gold',
              idx === 2 && 'bg-cobalt/20 text-cobalt',
              idx > 2 && 'bg-secondary text-muted-foreground',
            )}>
              {item.rank}
            </div>

            {/* Content */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-muted-foreground mb-1">{item.author}</p>
              <p className="text-sm text-foreground line-clamp-2 group-hover:text-jade transition-colors">
                {item.preview}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="size-3 text-ruby" aria-hidden="true" />
                <span className="text-xs font-semibold text-ruby">{item.score} points</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

import { Leaf, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistance, formatDuration } from '@/lib/geo'
import { ROUTE_MODE_CONFIG } from '@/lib/types'
import type { RouteMode, RouteRecord } from '@/lib/types'

const MODE_ICON = { fast: Zap, zen: Sparkles, eco: Leaf } as const

const MODE_TONE: Record<RouteMode, string> = {
  fast: 'text-blue-500 bg-blue-500/10',
  zen: 'text-violet-500 bg-violet-500/10',
  eco: 'text-emerald-500 bg-emerald-500/10',
}

interface RouteCardProps {
  mode: RouteMode
  route?: RouteRecord
  selected: boolean
  onSelect: () => void
}

export function RouteCard({ mode, route, selected, onSelect }: RouteCardProps) {
  const Icon = MODE_ICON[mode]
  const config = ROUTE_MODE_CONFIG[mode]

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!route}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
        selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-accent',
        !route && 'opacity-50',
      )}
    >
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', MODE_TONE[mode])}>
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{config.label}</span>
        <span className="block truncate text-xs text-muted-foreground">{route ? formatDistance(route.distance_m) : config.note}</span>
      </span>
      {route ? (
        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold">{formatDuration(route.duration_s)}</span>
        </span>
      ) : null}
    </button>
  )
}

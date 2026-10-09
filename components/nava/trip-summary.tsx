import { Navigation, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistance, formatDuration } from '@/lib/geo'
import type { RouteRecord } from '@/lib/types'

export function TripSummary({
  route,
  destinationLabel,
  onStart,
  onClear,
}: {
  route: RouteRecord
  destinationLabel: string
  onStart: () => void
  onClear: () => void
}) {
  return (
    <div className="absolute inset-x-3 bottom-24 z-10 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-3 py-3 shadow-lg backdrop-blur">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-muted-foreground">Destination</p>
        <p className="truncate text-sm font-semibold">{destinationLabel}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-right">
        <div>
          <p className="text-lg font-bold leading-none text-emerald-500">{formatDuration(route.duration_s)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{formatDistance(route.distance_m)}</p>
        </div>
        <Button size="icon" className="rounded-xl" aria-label="Démarrer la navigation" onClick={onStart} disabled={route.steps.length === 0}>
          <Navigation size={18} fill="currentColor" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onClear} aria-label="Annuler le trajet">
          <X size={17} />
        </Button>
      </div>
    </div>
  )
}

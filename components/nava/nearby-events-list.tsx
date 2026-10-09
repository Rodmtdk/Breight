import { Radio } from 'lucide-react'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { EVENT_ICONS, EVENT_TONE_HEX } from '@/components/nava/event-icon'
import { EVENT_TYPE_CONFIG } from '@/lib/types'
import { timeAgo } from '@/lib/geo'
import type { EventRecord } from '@/lib/types'

interface NearbyEventsListProps {
  events: EventRecord[]
  onAction: (eventId: string, action: 'confirm' | 'reject') => void
}

export function NearbyEventsList({ events, onAction }: NearbyEventsListProps) {
  if (events.length === 0) {
    return (
      <Empty className="rounded-xl border border-dashed border-border py-6">
        <EmptyMedia variant="icon">
          <Radio />
        </EmptyMedia>
        <EmptyTitle className="text-sm">Aucun signalement actif</EmptyTitle>
        <EmptyDescription className="text-xs">La route semble dégagée pour le moment.</EmptyDescription>
      </Empty>
    )
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {events.slice(0, 8).map((event) => {
        const Icon = EVENT_ICONS[event.type]
        return (
          <li key={event.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-accent/60">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: EVENT_TONE_HEX[event.type] }}>
              <Icon size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{EVENT_TYPE_CONFIG[event.type].label}</p>
              <p className="truncate text-[11px] text-muted-foreground">{event.description || 'Signalé par un conducteur'}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[10px] text-muted-foreground">{"il y a " + timeAgo(event.created_at)}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onAction(event.id, 'confirm')}
                  className="rounded-full border border-border px-1.5 py-0.5 text-[9px] font-medium hover:bg-accent"
                >
                  +{event.confirmations}
                </button>
                <button
                  type="button"
                  onClick={() => onAction(event.id, 'reject')}
                  className="rounded-full border border-border px-1.5 py-0.5 text-[9px] font-medium hover:bg-accent"
                >
                  −{event.rejections}
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

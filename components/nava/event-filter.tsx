import { EVENT_ICONS, EVENT_TONE_HEX } from '@/components/nava/event-icon'
import { EVENT_TYPE_CONFIG } from '@/lib/types'
import type { EventType } from '@/lib/types'
import { cn } from '@/lib/utils'

const TYPES = Object.keys(EVENT_TYPE_CONFIG) as EventType[]

interface EventFilterProps {
  active: Set<EventType>
  onToggle: (type: EventType) => void
}

export function EventFilter({ active, onToggle }: EventFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer les signalements par type">
      {TYPES.map((type) => {
        const Icon = EVENT_ICONS[type]
        const isActive = active.has(type)
        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            aria-pressed={isActive}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
              isActive ? 'border-transparent text-white' : 'border-border bg-secondary/60 text-muted-foreground hover:bg-accent',
            )}
            style={isActive ? { backgroundColor: EVENT_TONE_HEX[type] } : undefined}
          >
            <Icon size={12} />
            {EVENT_TYPE_CONFIG[type].label}
          </button>
        )
      })}
    </div>
  )
}

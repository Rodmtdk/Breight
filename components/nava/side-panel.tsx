import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SearchBar } from '@/components/nava/search-bar'
import { RouteCard } from '@/components/nava/route-card'
import { EventFilter } from '@/components/nava/event-filter'
import { NearbyEventsList } from '@/components/nava/nearby-events-list'
import { ReportDialog } from '@/components/nava/report-dialog'
import { FavoritesPanel } from '@/components/nava/favorites-panel'
import { cn } from '@/lib/utils'
import type { EventRecord, EventType, FavoriteKind, FavoriteRecord, GeocodeResult, LatLng, RouteMode, RouteRecord } from '@/lib/types'

interface SidePanelProps {
  open: boolean
  onClose: () => void
  profileId: string | null
  onSearchSelect: (result: GeocodeResult) => void
  routesLoading: boolean
  routes: RouteRecord[]
  selectedMode: RouteMode | null
  onSelectMode: (mode: RouteMode) => void
  hasDestination: boolean
  eventTypeFilter: Set<EventType>
  onToggleEventType: (type: EventType) => void
  events: EventRecord[]
  onEventAction: (eventId: string, action: 'confirm' | 'reject') => void
  userPosition: LatLng
  pickedPosition: LatLng | null
  onStartPicking: () => void
  onSubmitReport: (input: { type: EventType; lat: number; lng: number; description: string }) => Promise<void>
  favorites: FavoriteRecord[]
  onAddFavorite: (kind: FavoriteKind, label: string, lat: number, lng: number) => void
  onRemoveFavorite: (id: string) => void
}

const MODES: RouteMode[] = ['fast', 'zen', 'eco']

export function SidePanel({
  open,
  onClose,
  profileId,
  onSearchSelect,
  routesLoading,
  routes,
  selectedMode,
  onSelectMode,
  hasDestination,
  eventTypeFilter,
  onToggleEventType,
  events,
  onEventAction,
  userPosition,
  pickedPosition,
  onStartPicking,
  onSubmitReport,
  favorites,
  onAddFavorite,
  onRemoveFavorite,
}: SidePanelProps) {
  const filteredEvents = events.filter((event) => eventTypeFilter.has(event.type))

  return (
    <aside
      className={cn(
        'z-30 flex w-full max-w-lg shrink-0 flex-col border-r border-border bg-card',
        'lg:static lg:bottom-auto lg:w-[380px] lg:translate-x-0',
        'fixed top-0 bottom-20 left-0 transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <Button variant="ghost" size="icon" className="absolute right-3 top-3 lg:hidden" onClick={onClose} aria-label="Fermer le panneau">
        <X size={18} />
      </Button>

      {/* Kept outside the ScrollArea: Radix's scroll viewport clips any
          absolutely-positioned content (like the search/history dropdown)
          that overflows its own bounds, cutting the dropdown off instead of
          letting it float above the rest of the panel. */}
      <div className="flex flex-col gap-5 p-5 pb-0">
        <div>
          <p className="mb-2 text-xs font-semibold text-jade">Navigation</p>
          <h1 className="text-xl font-bold tracking-tight">Où allez-vous ?</h1>
        </div>

        <SearchBar profileId={profileId} onSelect={onSearchSelect} />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 p-5 pt-4">
          <FavoritesPanel
            favorites={favorites}
            userPosition={userPosition}
            onAddFavorite={onAddFavorite}
            onRemoveFavorite={onRemoveFavorite}
            onSelect={onSearchSelect}
          />

          {hasDestination ? (
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Itinéraires suggérés</p>
              <div className="flex flex-col gap-2">
                {MODES.map((mode) => (
                  <RouteCard
                    key={mode}
                    mode={mode}
                    route={routes.find((route) => route.mode === mode)}
                    selected={selectedMode === mode}
                    onSelect={() => onSelectMode(mode)}
                  />
                ))}
              </div>
              {routesLoading ? <p className="mt-2 text-[11px] text-muted-foreground">Calcul des itinéraires…</p> : null}
            </div>
          ) : null}

          <Separator />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">À proximité</p>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                EN DIRECT
              </span>
            </div>
            <div className="mb-2.5">
              <EventFilter active={eventTypeFilter} onToggle={onToggleEventType} />
            </div>
            <NearbyEventsList events={filteredEvents} onAction={onEventAction} />
          </div>
        </div>
      </ScrollArea>

      <div className="flex flex-col gap-3 border-t border-border p-4">
        <ReportDialog userPosition={userPosition} pickedPosition={pickedPosition} onStartPicking={onStartPicking} onSubmit={onSubmitReport} />
      </div>
    </aside>
  )
}

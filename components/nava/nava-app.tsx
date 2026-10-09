'use client'

import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { NavaMap, type NavaMapHandle } from '@/components/map/nava-map'
import { MapControls } from '@/components/map/map-controls'
import { SidePanel } from '@/components/nava/side-panel'
import { BottomNav } from '@/components/bottom-nav'
import { TripSummary } from '@/components/nava/trip-summary'
import { DriveMode } from '@/components/nava/drive-mode'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useProfile } from '@/hooks/use-profile'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'
import { useFavorites } from '@/hooks/use-favorites'
import { haversineDistance } from '@/lib/geo'
import { EVENT_TYPE_CONFIG } from '@/lib/types'
import type { EventType, GeocodeResult, LatLng, RouteMode, RouteRecord } from '@/lib/types'

export interface NavaFriend {
  id: string
  name: string
  lat: number
  lng: number
}

const ALL_EVENT_TYPES = new Set(Object.keys(EVENT_TYPE_CONFIG) as EventType[])
const RECALC_THRESHOLD_M = 150

export function NavaApp({ friends = [] }: { friends?: NavaFriend[] }) {
  const { position: userPosition, heading, speed } = useGeolocation()
  const { profileId, profile } = useProfile()
  const { events, refresh: refreshEvents } = useRealtimeEvents()
  const { favorites, addFavorite, removeFavorite } = useFavorites(profileId)

  const mapRef = useRef<NavaMapHandle>(null)
  const lastRouteOriginRef = useRef<LatLng | null>(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [destination, setDestination] = useState<LatLng | null>(null)
  const [destinationLabel, setDestinationLabel] = useState<string>('')
  const [routes, setRoutes] = useState<RouteRecord[]>([])
  const [selectedMode, setSelectedMode] = useState<RouteMode | null>(null)
  const [routesLoading, setRoutesLoading] = useState(false)
  const [eventTypeFilter, setEventTypeFilter] = useState<Set<EventType>>(new Set(ALL_EVENT_TYPES))
  const [showEvents, setShowEvents] = useState(true)
  const [pickingLocation, setPickingLocation] = useState(false)
  const [pickedPosition, setPickedPosition] = useState<LatLng | null>(null)
  const [driving, setDriving] = useState(false)

  async function calculateRoutes(origin: LatLng, dest: LatLng, label: string) {
    setRoutesLoading(true)
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        body: JSON.stringify({ origin, destination: { ...dest, label }, createdBy: profileId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Erreur de calcul')

      setRoutes(data.routes)
      setSelectedMode((previous) => previous ?? 'fast')
      lastRouteOriginRef.current = origin
      mapRef.current?.fitBounds([origin, dest])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de calculer l’itinéraire')
    } finally {
      setRoutesLoading(false)
    }
  }

  function handleSearchSelect(result: GeocodeResult) {
    setDestination({ lat: result.lat, lng: result.lng })
    setDestinationLabel(result.label)
    setSidebarOpen(false)
    void calculateRoutes(userPosition, { lat: result.lat, lng: result.lng }, result.label)
  }

  // Recalculate automatically once the driver has moved far enough from
  // where the current routes were computed.
  useEffect(() => {
    if (!destination || !lastRouteOriginRef.current) return
    if (haversineDistance(userPosition, lastRouteOriginRef.current) < RECALC_THRESHOLD_M) return
    void calculateRoutes(userPosition, destination, destinationLabel)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only userPosition changes should trigger a recalculation
  }, [userPosition])

  function handleToggleEventType(type: EventType) {
    setEventTypeFilter((previous) => {
      const next = new Set(previous)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  async function handleEventAction(eventId: string, action: 'confirm' | 'reject') {
    const response = await fetch(`/api/events/${eventId}/feedback`, { method: 'POST', body: JSON.stringify({ action }) })
    if (!response.ok) {
      toast.error('Impossible d’enregistrer votre retour')
      return
    }
    toast.success(action === 'confirm' ? 'Signalement confirmé' : 'Signalement infirmé')
    refreshEvents()
  }

  async function handleSubmitReport(input: { type: EventType; lat: number; lng: number; description: string }) {
    const response = await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({ ...input, reporterId: profileId }),
    })
    const data = await response.json()
    if (!response.ok) {
      toast.error(data.error ?? 'Impossible d’envoyer le signalement')
      return
    }
    toast.success('Signalement envoyé, merci !')
    setPickedPosition(null)
    refreshEvents()
  }

  function handleStartDrive() {
    setDriving(true)
    setSidebarOpen(false)
  }

  function handleExitDrive() {
    setDriving(false)
  }

  function handleArrive() {
    setDriving(false)
    toast.success('Vous êtes arrivé à destination !')
    setDestination(null)
    setRoutes([])
    setSelectedMode(null)
    lastRouteOriginRef.current = null
  }

  function handleOffRoute() {
    if (!destination) return
    toast.message('Hors itinéraire, recalcul en cours…')
    void calculateRoutes(userPosition, destination, destinationLabel)
  }

  const selectedRoute = routes.find((route) => route.mode === selectedMode)

  return (
    <div className="relative flex h-svh flex-col overflow-hidden bg-background">
      <div className="relative flex min-h-0 flex-1">
        <SidePanel
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          profileId={profileId}
          onSearchSelect={handleSearchSelect}
          routesLoading={routesLoading}
          routes={routes}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          hasDestination={Boolean(destination)}
          eventTypeFilter={eventTypeFilter}
          onToggleEventType={handleToggleEventType}
          events={events}
          onEventAction={handleEventAction}
          userPosition={userPosition}
          pickedPosition={pickedPosition}
          onStartPicking={() => {
            setPickingLocation(true)
            toast.message('Cliquez sur la carte pour placer le repère')
          }}
          onSubmitReport={handleSubmitReport}
          favorites={favorites}
          onAddFavorite={addFavorite}
          onRemoveFavorite={removeFavorite}
        />

        <div className="relative flex-1">
          <NavaMap
            ref={mapRef}
            userPosition={userPosition}
            vehicleIconUrl={profile?.vehicle_icon_url ?? null}
            events={events}
            visibleEventTypes={eventTypeFilter}
            showEvents={showEvents}
            routes={routes}
            selectedMode={selectedMode}
            destination={destination}
            friends={friends}
            pickingLocation={pickingLocation}
            driving={driving}
            heading={heading}
            onPickLocation={(position) => {
              if (!pickingLocation) return
              setPickedPosition(position)
              setPickingLocation(false)
            }}
            onEventAction={handleEventAction}
          />

          {!driving ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="absolute top-3 left-3 z-10 flex h-11 items-center gap-2 rounded-full border border-border bg-card/95 px-4 text-sm font-medium text-foreground shadow-md backdrop-blur"
            >
              <Search className="size-4" aria-hidden="true" />
              Où aller ?
            </button>
          ) : null}

          {!driving ? (
            <MapControls
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              onResetBearing={() => mapRef.current?.resetBearing()}
              onRecenter={() => mapRef.current?.recenter()}
              showEvents={showEvents}
              onToggleEvents={() => setShowEvents((previous) => !previous)}
            />
          ) : null}

          {driving && selectedRoute ? (
            <DriveMode
              route={selectedRoute}
              destinationLabel={destinationLabel}
              userPosition={userPosition}
              speedMps={speed}
              onExit={handleExitDrive}
              onArrive={handleArrive}
              onOffRoute={handleOffRoute}
            />
          ) : null}

          {!driving && selectedRoute ? (
            <TripSummary
              route={selectedRoute}
              destinationLabel={destinationLabel}
              onStart={handleStartDrive}
              onClear={() => {
                setDestination(null)
                setRoutes([])
                setSelectedMode(null)
                lastRouteOriginRef.current = null
              }}
            />
          ) : null}
        </div>
      </div>
      {driving ? null : <BottomNav overlay />}
    </div>
  )
}

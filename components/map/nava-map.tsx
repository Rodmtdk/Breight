'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { Map as MapLibreMap, Marker, Popup } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { EVENT_ICONS, EVENT_TONE_HEX } from '@/components/nava/event-icon'
import { renderToStaticMarkup } from 'react-dom/server'
import type { EventRecord, EventType, LatLng, RouteMode, RouteRecord } from '@/lib/types'

// Turbopack can't resolve MapLibre's worker via `import.meta.url`, so the
// worker bundle is copied to /public and pointed to explicitly.
// See: https://github.com/maplibre/maplibre-gl-js/issues (worker URL under bundlers).
if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
}

const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const ROUTE_COLORS: Record<RouteMode, string> = {
  fast: '#3b82f6',
  zen: '#a78bfa',
  eco: '#34d399',
}

export interface NavaMapHandle {
  flyTo: (position: LatLng, zoom?: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetBearing: () => void
  recenter: () => void
  fitBounds: (points: LatLng[]) => void
}

interface NavaMapProps {
  userPosition: LatLng
  vehicleIconUrl?: string | null
  events: EventRecord[]
  visibleEventTypes: Set<EventType>
  showEvents: boolean
  routes: RouteRecord[]
  selectedMode: RouteMode | null
  destination: LatLng | null
  pickingLocation: boolean
  driving?: boolean
  heading?: number | null
  friends?: { id: string; name: string; lat: number; lng: number }[]
  onPickLocation?: (position: LatLng) => void
  onEventAction?: (eventId: string, action: 'confirm' | 'reject') => void
}

export const NavaMap = forwardRef<NavaMapHandle, NavaMapProps>(function NavaMap(
  {
    userPosition,
    vehicleIconUrl = null,
    events,
    visibleEventTypes,
    showEvents,
    routes,
    selectedMode,
    destination,
    friends = [],
    pickingLocation,
    driving = false,
    heading = null,
    onPickLocation,
    onEventAction,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const userMarkerRef = useRef<Marker | null>(null)
  const userMarkerKindRef = useRef<'dot' | 'vehicle' | null>(null)
  const destMarkerRef = useRef<Marker | null>(null)
  const eventMarkersRef = useRef<Map<string, Marker>>(new Map())
  const friendMarkersRef = useRef<Map<string, Marker>>(new Map())
  const [mapTick, setMapTick] = useState(0)
  const { resolvedTheme } = useTheme()
  const onPickLocationRef = useRef(onPickLocation)
  onPickLocationRef.current = onPickLocation
  const onEventActionRef = useRef(onEventAction)
  onEventActionRef.current = onEventAction

  useImperativeHandle(ref, () => ({
    flyTo: (position, zoom = 15) => {
      mapRef.current?.flyTo({ center: [position.lng, position.lat], zoom, duration: 900 })
    },
    zoomIn: () => mapRef.current?.zoomIn({ duration: 250 }),
    zoomOut: () => mapRef.current?.zoomOut({ duration: 250 }),
    resetBearing: () => mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 400 }),
    recenter: () => mapRef.current?.flyTo({ center: [userPosition.lng, userPosition.lat], zoom: 15, duration: 700 }),
    fitBounds: (points) => {
      if (!mapRef.current || points.length === 0) return
      const bounds = new maplibregl.LngLatBounds()
      for (const point of points) bounds.extend([point.lng, point.lat])
      mapRef.current.fitBounds(bounds, { padding: 90, duration: 700, maxZoom: 16 })
    },
  }))

  // Map lifecycle — recreated only when the color scheme changes, since
  // MapLibre style switches are cheaper to do by recreating the instance.
  useEffect(() => {
    if (!containerRef.current) return

    const map = new MapLibreMap({
      container: containerRef.current,
      style: resolvedTheme === 'dark' ? DARK_STYLE : LIGHT_STYLE,
      center: [userPosition.lng, userPosition.lat],
      zoom: 13,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    // Recreating the map (e.g. on theme change) orphans any previously
    // attached markers, since their DOM nodes belonged to the removed
    // instance. Clear the refs and bump mapTick so the marker/route effects
    // below re-run and reattach everything to the new map.
    userMarkerRef.current = null
    destMarkerRef.current = null
    eventMarkersRef.current.clear()

    map.on('load', () => {
      map.addSource('nava-routes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({
        id: 'nava-routes-line',
        type: 'line',
        source: 'nava-routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['case', ['get', 'selected'], 6, 3.5],
          'line-opacity': ['case', ['get', 'selected'], 0.95, 0.55],
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      })
      setMapTick((tick) => tick + 1)
    })

    map.on('click', (event: maplibregl.MapMouseEvent) => {
      if (!onPickLocationRef.current) return
      onPickLocationRef.current({ lat: event.lngLat.lat, lng: event.lngLat.lng })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recenter/position intentionally excluded; map is recreated only on theme change
  }, [resolvedTheme])

  // User position marker — renders as a scanned vehicle avatar (rotated to
  // face the direction of travel) when one is configured, falling back to
  // the plain pulsing dot otherwise. The marker element is rebuilt whenever
  // we switch between these two kinds, or when the map itself is recreated.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const nextKind: 'dot' | 'vehicle' = vehicleIconUrl ? 'vehicle' : 'dot'

    if (!userMarkerRef.current || userMarkerKindRef.current !== nextKind) {
      userMarkerRef.current?.remove()

      const el = document.createElement('div')
      if (nextKind === 'vehicle') {
        el.className = 'nava-user-vehicle'
        el.innerHTML = `<img class="nava-user-vehicle-img" src="${vehicleIconUrl}" alt="Votre véhicule" />`
      } else {
        el.className = 'nava-user-dot'
        el.innerHTML = '<span class="nava-user-dot-core"></span><span class="nava-user-dot-ring"></span>'
      }

      userMarkerRef.current = new Marker({ element: el, anchor: 'center', rotationAlignment: 'map' })
        .setLngLat([userPosition.lng, userPosition.lat])
        .addTo(map)
      userMarkerKindRef.current = nextKind
    } else {
      userMarkerRef.current.setLngLat([userPosition.lng, userPosition.lat])
    }

    if (nextKind === 'vehicle') {
      userMarkerRef.current.setRotation(heading ?? 0)
    }
  }, [userPosition, vehicleIconUrl, heading, mapTick])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const seen = new Set(friends.map((friend) => friend.id))
    for (const [id, marker] of friendMarkersRef.current) {
      if (!seen.has(id)) {
        marker.remove()
        friendMarkersRef.current.delete(id)
      }
    }
    for (const friend of friends) {
      const existing = friendMarkersRef.current.get(friend.id)
      if (existing) {
        existing.setLngLat([friend.lng, friend.lat])
        continue
      }
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'nava-friend-pin'
      el.textContent = friend.name.slice(0, 1).toUpperCase()
      el.setAttribute('aria-label', friend.name)
      const marker = new Marker({ element: el, anchor: 'center' }).setLngLat([friend.lng, friend.lat]).addTo(map)
      marker.setPopup(new maplibregl.Popup({ offset: 16, closeButton: false }).setText(friend.name))
      el.addEventListener('click', () => marker.togglePopup())
      friendMarkersRef.current.set(friend.id, marker)
    }
  }, [friends, mapTick])

  // In drive mode, keep the camera locked on the driver's position, tilted
  // and rotated to face the direction of travel (classic turn-by-turn feel).
  useEffect(() => {
    const map = mapRef.current
    if (!map || !driving) return

    map.easeTo({
      center: [userPosition.lng, userPosition.lat],
      bearing: heading ?? map.getBearing(),
      pitch: 55,
      zoom: 17,
      duration: 500,
    })
  }, [driving, userPosition, heading, mapTick])

  // Restore a top-down view when leaving drive mode.
  useEffect(() => {
    const map = mapRef.current
    if (!map || driving) return
    map.easeTo({ bearing: 0, pitch: 0, duration: 500 })
  }, [driving])

  // Destination marker.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (!destination) {
      destMarkerRef.current?.remove()
      destMarkerRef.current = null
      return
    }

    if (!destMarkerRef.current) {
      const el = document.createElement('div')
      el.className = 'nava-dest-pin'
      destMarkerRef.current = new Marker({ element: el, anchor: 'bottom' }).setLngLat([destination.lng, destination.lat]).addTo(map)
    } else {
      destMarkerRef.current.setLngLat([destination.lng, destination.lat])
    }
  }, [destination, mapTick])

  // Route lines.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const applyRoutes = () => {
      const source = map.getSource('nava-routes') as maplibregl.GeoJSONSource | undefined
      if (!source) return
      source.setData({
        type: 'FeatureCollection',
        features: routes.map((route) => ({
          type: 'Feature',
          properties: { color: ROUTE_COLORS[route.mode], selected: route.mode === selectedMode },
          geometry: route.geometry,
        })),
      })
    }

    if (map.isStyleLoaded()) applyRoutes()
    else map.once('load', applyRoutes)
  }, [routes, selectedMode, mapTick])

  // Event markers.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const nextIds = new Set(events.map((event) => event.id))
    for (const [id, marker] of eventMarkersRef.current) {
      if (!nextIds.has(id)) {
        marker.remove()
        eventMarkersRef.current.delete(id)
      }
    }

    if (!showEvents) {
      for (const marker of eventMarkersRef.current.values()) marker.remove()
    eventMarkersRef.current.clear()
    friendMarkersRef.current.clear()
      return
    }

    for (const event of events) {
      if (!visibleEventTypes.has(event.type)) {
        eventMarkersRef.current.get(event.id)?.remove()
        eventMarkersRef.current.delete(event.id)
        continue
      }

      if (eventMarkersRef.current.has(event.id)) continue

      const Icon = EVENT_ICONS[event.type]
      const el = document.createElement('div')
      el.className = 'nava-event-pin'
      el.style.setProperty('--nava-event-color', EVENT_TONE_HEX[event.type])
      el.innerHTML = renderToStaticMarkup(<Icon size={14} color="white" strokeWidth={2.4} />)

      const popupNode = document.createElement('div')
      popupNode.className = 'nava-event-popup'
      popupNode.innerHTML = `
        <p class="nava-event-popup-desc">${event.description ? escapeHtml(event.description) : 'Signalement sans détails'}</p>
        <div class="nava-event-popup-actions">
          <button type="button" data-action="confirm">Confirmer (${event.confirmations})</button>
          <button type="button" data-action="reject">Infirmer (${event.rejections})</button>
        </div>
      `
      popupNode.querySelector('[data-action="confirm"]')?.addEventListener('click', () => onEventActionRef.current?.(event.id, 'confirm'))
      popupNode.querySelector('[data-action="reject"]')?.addEventListener('click', () => onEventActionRef.current?.(event.id, 'reject'))

      const marker = new Marker({ element: el, anchor: 'center' })
        .setLngLat([event.lng, event.lat])
        .setPopup(new Popup({ offset: 16, closeButton: false }).setDOMContent(popupNode))
        .addTo(map)

      eventMarkersRef.current.set(event.id, marker)
    }
  }, [events, visibleEventTypes, showEvents, mapTick])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = pickingLocation ? 'crosshair' : ''
    }
  }, [pickingLocation])

  return <div ref={containerRef} className="size-full" aria-label="Carte de navigation" role="application" />
})

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
}

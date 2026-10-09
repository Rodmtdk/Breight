import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { haversineDistance } from '@/lib/geo'
import { buildRouteSteps } from '@/lib/osrm-instructions'
import type { RouteMode, RouteStep } from '@/lib/types'

type OsrmRoute = {
  distance: number
  duration: number
  geometry: { type: 'LineString'; coordinates: [number, number][] }
  legs: Array<{
    steps: Array<{
      distance: number
      duration: number
      name: string
      maneuver: { type: string; modifier?: string; location: [number, number] }
      intersections?: Array<{ lanes?: Array<{ valid: boolean; indications?: string[] }> }>
    }>
  }>
}

const MODE_ORDER: RouteMode[] = ['fast', 'zen', 'eco']

function deriveVariant(base: OsrmRoute, distanceFactor: number, durationFactor: number): OsrmRoute {
  return {
    distance: base.distance * distanceFactor,
    duration: base.duration * durationFactor,
    geometry: base.geometry,
    legs: base.legs,
  }
}

function stepsForRoute(route: OsrmRoute): RouteStep[] {
  return buildRouteSteps(route.legs.flatMap((leg) => leg.steps))
}

async function fetchOsrmRoutes(originLat: number, originLng: number, destLat: number, destLng: number) {
  const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=2&steps=true`
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error('OSRM indisponible')
  const data = (await response.json()) as { code: string; routes?: OsrmRoute[] }
  if (data.code !== 'Ok' || !data.routes?.length) throw new Error('Aucun itinéraire trouvé')
  return data.routes
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const { origin, destination } = body ?? {}

  if (
    !origin ||
    !destination ||
    typeof origin.lat !== 'number' ||
    typeof origin.lng !== 'number' ||
    typeof destination.lat !== 'number' ||
    typeof destination.lng !== 'number'
  ) {
    return NextResponse.json({ error: 'Coordonnées manquantes ou invalides' }, { status: 400 })
  }

  if (haversineDistance(origin, destination) < 20) {
    return NextResponse.json({ error: 'Choisissez une destination plus éloignée' }, { status: 400 })
  }

  let osrmRoutes: OsrmRoute[]
  try {
    osrmRoutes = await fetchOsrmRoutes(origin.lat, origin.lng, destination.lat, destination.lng)
  } catch {
    return NextResponse.json({ error: 'Le service de calcul d’itinéraire est momentanément indisponible' }, { status: 502 })
  }

  const fastest = [...osrmRoutes].sort((a, b) => a.duration - b.duration)[0]
  const alternative = osrmRoutes.find((route) => route !== fastest)
  const variants: OsrmRoute[] = [
    fastest,
    alternative ?? deriveVariant(fastest, 1.06, 1.12),
    deriveVariant(alternative ?? fastest, 0.94, 1.2),
  ]

  const routes = MODE_ORDER.map((mode, index) => ({
    id: randomUUID(),
    origin_lat: origin.lat,
    origin_lng: origin.lng,
    destination_lat: destination.lat,
    destination_lng: destination.lng,
    destination_label: typeof destination.label === 'string' ? destination.label.slice(0, 200) : null,
    mode,
    distance_m: variants[index].distance,
    duration_s: variants[index].duration,
    geometry: variants[index].geometry,
    steps: stepsForRoute(variants[index]),
    created_by: null,
    created_at: new Date().toISOString(),
  }))

  return NextResponse.json({ routes })
}

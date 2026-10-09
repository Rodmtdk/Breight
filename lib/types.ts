export type EventType =
  | 'accident'
  | 'traffic_jam'
  | 'radar'
  | 'hazard'
  | 'weather'
  | 'police'
  | 'road_closed'
  | 'pothole'
  | 'obstacle'
  | 'breakdown'

export type RouteMode = 'fast' | 'zen' | 'eco'

export type FavoriteKind = 'home' | 'work' | 'custom'

export interface LatLng {
  lat: number
  lng: number
}

export interface EventRecord {
  id: string
  type: EventType
  lat: number
  lng: number
  description: string | null
  reporter_id: string | null
  confirmations: number
  rejections: number
  active: boolean
  created_at: string
  expires_at: string
}

export interface ProfileRecord {
  id: string
  display_name: string
  reports_count: number
  confirmed_count: number
  rejected_count: number
  vehicle_icon_url: string | null
  vehicle_label: string | null
  created_at: string
  updated_at: string
}

export interface RouteStepLane {
  valid: boolean
  indications: string[]
}

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  type: string
  modifier?: string
  name: string
  location: [number, number]
  /** Real OSM turn-lane data for the upcoming junction, when available. */
  lanes?: RouteStepLane[]
}

export interface RouteRecord {
  id: string
  origin_lat: number
  origin_lng: number
  destination_lat: number
  destination_lng: number
  destination_label: string | null
  mode: RouteMode
  distance_m: number
  duration_s: number
  geometry: { type: 'LineString'; coordinates: [number, number][] }
  steps: RouteStep[]
  created_by: string | null
  created_at: string
}

export interface GeocodeResult {
  label: string
  lat: number
  lng: number
}

export interface FavoriteRecord {
  id: string
  profile_id: string
  kind: FavoriteKind
  label: string
  lat: number
  lng: number
  created_at: string
}

export interface SearchHistoryRecord {
  id: string
  profile_id: string
  label: string
  lat: number
  lng: number
  created_at: string
}

export const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; tone: 'coral' | 'amber' | 'violet' | 'sky' | 'slate' | 'indigo' | 'rose' | 'orange' | 'emerald' | 'zinc' }
> = {
  accident: { label: 'Accident', tone: 'coral' },
  traffic_jam: { label: 'Ralentissement', tone: 'amber' },
  radar: { label: 'Radar', tone: 'violet' },
  hazard: { label: 'Danger', tone: 'sky' },
  weather: { label: 'Météo', tone: 'slate' },
  police: { label: 'Police', tone: 'indigo' },
  road_closed: { label: 'Route fermée', tone: 'rose' },
  pothole: { label: 'Nid de poule', tone: 'orange' },
  obstacle: { label: 'Obstacle', tone: 'emerald' },
  breakdown: { label: 'Panne', tone: 'zinc' },
}

/** How long a report stays active before it auto-expires, by type (ms). */
export const EVENT_EXPIRY_MS: Record<EventType, number> = {
  accident: 3 * 60 * 60 * 1000,
  traffic_jam: 90 * 60 * 1000,
  radar: 6 * 60 * 60 * 1000,
  hazard: 3 * 60 * 60 * 1000,
  weather: 3 * 60 * 60 * 1000,
  police: 2 * 60 * 60 * 1000,
  road_closed: 12 * 60 * 60 * 1000,
  pothole: 7 * 24 * 60 * 60 * 1000,
  obstacle: 90 * 60 * 1000,
  breakdown: 60 * 60 * 1000,
}

export const ROUTE_MODE_CONFIG: Record<RouteMode, { label: string; note: string }> = {
  fast: { label: 'Rapide', note: 'Trajet le plus court en temps' },
  zen: { label: 'Zen', note: 'Routes plus calmes' },
  eco: { label: 'Éco', note: 'Conduite économe en carburant' },
}

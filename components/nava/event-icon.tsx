import { Ban, CarFront, CloudRain, Construction, Gauge, ShieldAlert, TriangleAlert, TrafficCone, Wrench, type LucideIcon } from 'lucide-react'
import type { EventType } from '@/lib/types'

export const EVENT_ICONS: Record<EventType, LucideIcon> = {
  accident: CarFront,
  traffic_jam: TrafficCone,
  radar: Gauge,
  hazard: TriangleAlert,
  weather: CloudRain,
  police: ShieldAlert,
  road_closed: Ban,
  pothole: Construction,
  obstacle: TriangleAlert,
  breakdown: Wrench,
}

export const EVENT_TONE_HEX: Record<EventType, string> = {
  accident: '#ff6b6b',
  traffic_jam: '#f5b942',
  radar: '#b08bff',
  hazard: '#5cc8ff',
  weather: '#9aa5b1',
  police: '#6366f1',
  road_closed: '#f43f5e',
  pothole: '#fb923c',
  obstacle: '#34d399',
  breakdown: '#71717a',
}

export function EventIcon({ type, size = 15 }: { type: EventType; size?: number }) {
  const Icon = EVENT_ICONS[type]
  return <Icon size={size} />
}

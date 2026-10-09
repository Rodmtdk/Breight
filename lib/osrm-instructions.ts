import type { RouteStep, RouteStepLane } from '@/lib/types'

type OsrmManeuver = {
  type: string
  modifier?: string
  location: [number, number]
}

type OsrmIntersection = {
  lanes?: Array<{ valid: boolean; indications?: string[] }>
}

type OsrmStep = {
  distance: number
  duration: number
  name: string
  maneuver: OsrmManeuver
  intersections?: OsrmIntersection[]
}

const MODIFIER_FR: Record<string, string> = {
  uturn: 'faites demi-tour',
  'sharp right': 'tournez fortement à droite',
  right: 'tournez à droite',
  'slight right': 'tournez légèrement à droite',
  straight: 'continuez tout droit',
  'slight left': 'tournez légèrement à gauche',
  left: 'tournez à gauche',
  'sharp left': 'tournez fortement à gauche',
}

/** Builds a readable French driving instruction from an OSRM maneuver. */
function buildInstruction(step: OsrmStep): string {
  const { type, modifier } = step.maneuver
  const road = step.name ? ` sur ${step.name}` : ''

  switch (type) {
    case 'depart':
      return `Démarrez${road}`
    case 'arrive':
      return 'Vous êtes arrivé à destination'
    case 'roundabout':
    case 'rotary':
    case 'roundabout turn':
      return `Prenez le rond-point${road}`
    case 'exit roundabout':
    case 'exit rotary':
      return `Sortez du rond-point${road}`
    case 'merge':
      return `Rejoignez la voie${road}`
    case 'on ramp':
      return `Prenez la bretelle${road}`
    case 'off ramp':
      return `Quittez la voie${road}`
    case 'fork':
      return modifier ? `Au carrefour, ${MODIFIER_FR[modifier] ?? 'continuez'}${road}` : `Au carrefour, continuez${road}`
    case 'end of road':
      return modifier ? `En fin de route, ${MODIFIER_FR[modifier] ?? 'continuez'}${road}` : `En fin de route, continuez${road}`
    case 'use lane':
      return `Restez sur la voie${road}`
    case 'continue':
    case 'new name':
      return `Continuez${road}`
    case 'notification':
      return `Continuez${road}`
    case 'turn':
    default:
      if (modifier && MODIFIER_FR[modifier]) {
        const verb = MODIFIER_FR[modifier]
        return `${verb.charAt(0).toUpperCase()}${verb.slice(1)}${road}`
      }
      return `Continuez${road}`
  }
}

/** OSRM attaches the lanes used for a maneuver to that step's own first intersection. */
function extractLanes(step: OsrmStep): RouteStepLane[] | undefined {
  const rawLanes = step.intersections?.[0]?.lanes
  if (!rawLanes || rawLanes.length === 0) return undefined
  return rawLanes.map((lane) => ({ valid: lane.valid, indications: lane.indications ?? [] }))
}

export function buildRouteSteps(steps: OsrmStep[]): RouteStep[] {
  return steps.map((step) => ({
    instruction: buildInstruction(step),
    distance: step.distance,
    duration: step.duration,
    type: step.maneuver.type,
    modifier: step.maneuver.modifier,
    name: step.name,
    location: step.maneuver.location,
    lanes: extractLanes(step),
  }))
}

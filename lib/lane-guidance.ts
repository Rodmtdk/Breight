import type { RouteStep } from '@/lib/types'

export type JunctionArrow =
  | 'straight'
  | 'slight-left'
  | 'left'
  | 'sharp-left'
  | 'slight-right'
  | 'right'
  | 'sharp-right'
  | 'uturn'

export interface JunctionGuidance {
  arrow: JunctionArrow
  totalLanes: number
  /** Zero-indexed lane positions (left to right) the driver should be in. */
  highlightedLanes: number[]
  label: string
}

/** Default lane count assumed when OSM has no turn-lane data for this junction. */
const DEFAULT_LANE_COUNT = 3

const ARROW_LABEL: Record<JunctionArrow, string> = {
  straight: 'Restez sur votre voie',
  'slight-left': 'Serrez légèrement à gauche',
  left: 'Placez-vous sur la voie de gauche',
  'sharp-left': 'Placez-vous tout à gauche',
  'slight-right': 'Serrez légèrement à droite',
  right: 'Placez-vous sur la voie de droite',
  'sharp-right': 'Placez-vous tout à droite',
  uturn: 'Préparez-vous à faire demi-tour',
}

const INDICATION_TO_ARROW: Record<string, JunctionArrow> = {
  sharp_left: 'sharp-left',
  left: 'left',
  slight_left: 'slight-left',
  straight: 'straight',
  slight_right: 'slight-right',
  right: 'right',
  sharp_right: 'sharp-right',
  uturn: 'uturn',
}

function arrowFromModifier(type: string, modifier?: string): JunctionArrow {
  if (type === 'uturn' || modifier === 'uturn') return 'uturn'
  switch (modifier) {
    case 'slight left':
      return 'slight-left'
    case 'left':
      return 'left'
    case 'sharp left':
      return 'sharp-left'
    case 'slight right':
      return 'slight-right'
    case 'right':
      return 'right'
    case 'sharp right':
      return 'sharp-right'
    default:
      return 'straight'
  }
}

/** Maneuvers worth interrupting the driver with a dedicated junction/lane view. */
export function isJunctionStep(step: RouteStep): boolean {
  if (step.type === 'depart' || step.type === 'arrive') return false
  if (step.type === 'continue' || step.type === 'new name' || step.type === 'notification') return false
  return true
}

/** Which lanes (left→right) to highlight when real OSM turn-lane data is absent. */
function fallbackHighlight(arrow: JunctionArrow, totalLanes: number): number[] {
  const last = totalLanes - 1
  switch (arrow) {
    case 'sharp-left':
    case 'left':
    case 'uturn':
      return [0]
    case 'slight-left':
      return totalLanes > 2 ? [0, 1] : [0]
    case 'sharp-right':
    case 'right':
      return [last]
    case 'slight-right':
      return totalLanes > 2 ? [last - 1, last] : [last]
    default:
      return Array.from({ length: totalLanes }, (_, i) => i)
  }
}

/** Finds lanes whose OSM indications match the maneuver direction. */
function lanesMatchingArrow(step: RouteStep, arrow: JunctionArrow): number[] {
  if (!step.lanes) return []
  const matches = step.lanes
    .map((lane, index) => ({ lane, index }))
    .filter(({ lane }) => lane.indications.some((indication) => INDICATION_TO_ARROW[indication] === arrow))
    .map(({ index }) => index)
  return matches
}

export function buildJunctionGuidance(step: RouteStep): JunctionGuidance {
  const arrow = arrowFromModifier(step.type, step.modifier)

  if (step.lanes && step.lanes.length > 0) {
    const totalLanes = step.lanes.length
    const byIndication = lanesMatchingArrow(step, arrow)
    const validLanes = step.lanes.map((lane, index) => ({ lane, index })).filter(({ lane }) => lane.valid).map(({ index }) => index)
    const highlightedLanes = byIndication.length > 0 ? byIndication : validLanes.length > 0 ? validLanes : fallbackHighlight(arrow, totalLanes)
    return { arrow, totalLanes, highlightedLanes, label: ARROW_LABEL[arrow] }
  }

  const totalLanes = DEFAULT_LANE_COUNT
  return { arrow, totalLanes, highlightedLanes: fallbackHighlight(arrow, totalLanes), label: ARROW_LABEL[arrow] }
}

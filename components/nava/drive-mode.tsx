'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  RotateCw,
  Signpost,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JunctionView } from '@/components/nava/junction-view'
import { haversineDistance, formatDistance, formatDuration } from '@/lib/geo'
import { buildJunctionGuidance, isJunctionStep } from '@/lib/lane-guidance'
import type { LatLng, RouteRecord, RouteStep } from '@/lib/types'

const NEXT_STEP_THRESHOLD_M = 40
const ARRIVAL_THRESHOLD_M = 30
const OFF_ROUTE_THRESHOLD_M = 150
const JUNCTION_VIEW_THRESHOLD_M = 300

function maneuverIcon(step: RouteStep): LucideIcon {
  if (step.type === 'arrive') return Flag
  if (step.type === 'roundabout' || step.type === 'rotary' || step.type === 'roundabout turn') return RotateCw
  switch (step.modifier) {
    case 'left':
    case 'slight left':
      return CornerUpLeft
    case 'sharp left':
      return CornerDownLeft
    case 'right':
    case 'slight right':
      return CornerUpRight
    case 'sharp right':
      return CornerDownRight
    case 'uturn':
      return RotateCw
    default:
      return ArrowUp
  }
}

interface DriveModeProps {
  route: RouteRecord
  destinationLabel: string
  userPosition: LatLng
  speedMps: number | null
  onExit: () => void
  onArrive: () => void
  onOffRoute: () => void
}

export function DriveMode({ route, destinationLabel, userPosition, speedMps, onExit, onArrive, onOffRoute }: DriveModeProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const offRouteRef = useRef(false)

  useEffect(() => {
    setStepIndex(0)
    offRouteRef.current = false
  }, [route.id])

  const steps = route.steps
  const currentStep = steps[stepIndex] ?? steps[steps.length - 1]

  useEffect(() => {
    if (!currentStep) return
    const toManeuver = haversineDistance(userPosition, { lat: currentStep.location[1], lng: currentStep.location[0] })

    const isLastStep = stepIndex >= steps.length - 1
    if (isLastStep) {
      if (toManeuver < ARRIVAL_THRESHOLD_M) onArrive()
      return
    }

    if (toManeuver < NEXT_STEP_THRESHOLD_M) {
      setStepIndex((previous) => Math.min(previous + 1, steps.length - 1))
      return
    }

    const nearestRemaining = Math.min(
      ...steps.slice(stepIndex).map((step) => haversineDistance(userPosition, { lat: step.location[1], lng: step.location[0] })),
    )
    const isOffRoute = nearestRemaining > OFF_ROUTE_THRESHOLD_M
    if (isOffRoute && !offRouteRef.current) {
      offRouteRef.current = true
      onOffRoute()
    } else if (!isOffRoute) {
      offRouteRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-evaluate on position/step changes
  }, [userPosition, stepIndex, steps])

  if (!currentStep) return null

  const Icon = maneuverIcon(currentStep)
  const distanceToManeuver = haversineDistance(userPosition, { lat: currentStep.location[1], lng: currentStep.location[0] })
  const remainingDistance = steps.slice(stepIndex).reduce((sum, step) => sum + step.distance, 0)
  const remainingDuration = steps.slice(stepIndex).reduce((sum, step) => sum + step.duration, 0)
  const speedKmh = speedMps && speedMps > 0 ? Math.round(speedMps * 3.6) : 0
  const showJunctionView = isJunctionStep(currentStep) && distanceToManeuver <= JUNCTION_VIEW_THRESHOLD_M
  const junctionGuidance = showJunctionView ? buildJunctionGuidance(currentStep) : null

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3.5 shadow-lg backdrop-blur">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Icon size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-snug">{currentStep.instruction}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDistance(distanceToManeuver)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onExit} aria-label="Quitter la navigation guidée">
            <X size={18} />
          </Button>
        </div>

        {junctionGuidance ? <JunctionView guidance={junctionGuidance} roadName={currentStep.name} /> : null}
      </div>

      <div className="flex w-full max-w-sm items-center gap-4 self-center rounded-2xl border border-border bg-card/95 px-5 py-3 shadow-lg backdrop-blur">
        <div className="shrink-0 text-center">
          <p className="text-2xl font-bold leading-none tabular-nums">{speedKmh}</p>
          <p className="text-[10px] font-medium text-muted-foreground">km/h</p>
        </div>
        <div className="h-8 w-px shrink-0 bg-border" />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Signpost size={16} className="shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{destinationLabel}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatDistance(remainingDistance)} · {formatDuration(remainingDuration)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

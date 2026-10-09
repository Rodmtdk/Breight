import { ArrowUp, CornerDownLeft, CornerDownRight, CornerUpLeft, CornerUpRight, RotateCw, type LucideIcon } from 'lucide-react'
import type { JunctionArrow, JunctionGuidance } from '@/lib/lane-guidance'

const ARROW_ICON: Record<JunctionArrow, LucideIcon> = {
  straight: ArrowUp,
  'slight-left': CornerUpLeft,
  left: CornerUpLeft,
  'sharp-left': CornerDownLeft,
  'slight-right': CornerUpRight,
  right: CornerUpRight,
  'sharp-right': CornerDownRight,
  uturn: RotateCw,
}

// Perspective road geometry, in a 300x170 viewBox — a vanishing point near
// the horizon so the lanes read as "the road ahead" rather than a flat map.
const BOTTOM_Y = 170
const TOP_Y = 46
const BOTTOM_LEFT = 24
const BOTTOM_RIGHT = 276
const TOP_LEFT = 126
const TOP_RIGHT = 174

interface JunctionViewProps {
  guidance: JunctionGuidance
  roadName: string
}

export function JunctionView({ guidance, roadName }: JunctionViewProps) {
  const { totalLanes, highlightedLanes, arrow, label } = guidance
  const highlighted = new Set(highlightedLanes)
  const Icon = ARROW_ICON[arrow]

  const bottomStep = (BOTTOM_RIGHT - BOTTOM_LEFT) / totalLanes
  const topStep = (TOP_RIGHT - TOP_LEFT) / totalLanes

  const laneCenterX = (i: number) => {
    const bottomCenter = BOTTOM_LEFT + (i + 0.5) * bottomStep
    const topCenter = TOP_LEFT + (i + 0.5) * topStep
    return (bottomCenter + topCenter) / 2
  }

  const highlightedCenterX =
    highlightedLanes.length > 0
      ? highlightedLanes.reduce((sum, i) => sum + laneCenterX(i), 0) / highlightedLanes.length
      : 150

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur">
      <div className="relative">
        <svg viewBox="0 0 300 170" className="block w-full" aria-hidden="true">
          <polygon
            points={`${BOTTOM_LEFT},${BOTTOM_Y} ${BOTTOM_RIGHT},${BOTTOM_Y} ${TOP_RIGHT},${TOP_Y} ${TOP_LEFT},${TOP_Y}`}
            className="fill-foreground/[0.07]"
          />
          {Array.from({ length: totalLanes }, (_, i) => {
            const bx0 = BOTTOM_LEFT + i * bottomStep
            const bx1 = BOTTOM_LEFT + (i + 1) * bottomStep
            const tx0 = TOP_LEFT + i * topStep
            const tx1 = TOP_LEFT + (i + 1) * topStep
            return (
              <polygon
                key={i}
                points={`${bx0},${BOTTOM_Y} ${bx1},${BOTTOM_Y} ${tx1},${TOP_Y} ${tx0},${TOP_Y}`}
                className={highlighted.has(i) ? 'fill-primary/75' : 'fill-foreground/[0.04]'}
              />
            )
          })}
          {Array.from({ length: totalLanes - 1 }, (_, i) => {
            const bx = BOTTOM_LEFT + (i + 1) * bottomStep
            const tx = TOP_LEFT + (i + 1) * topStep
            return (
              <line
                key={i}
                x1={bx}
                y1={BOTTOM_Y}
                x2={tx}
                y2={TOP_Y}
                stroke="white"
                strokeOpacity="0.45"
                strokeWidth="2"
                strokeDasharray="8 7"
              />
            )
          })}
        </svg>
        <div
          className="absolute top-3 -translate-x-1/2 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
          style={{ left: `${(highlightedCenterX / 300) * 100}%` }}
        >
          <Icon size={30} strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
        <p className="text-sm font-semibold">{label}</p>
        {roadName ? <p className="max-w-[40%] truncate text-xs text-muted-foreground">{roadName}</p> : null}
      </div>
    </div>
  )
}

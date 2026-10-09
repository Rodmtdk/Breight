import { Compass, Crosshair, Layers, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetBearing: () => void
  onRecenter: () => void
  showEvents: boolean
  onToggleEvents: () => void
}

function ControlButton({ onClick, label, children, active }: { onClick: () => void; label: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-10 place-items-center rounded-lg border border-border bg-card/95 text-foreground shadow-md backdrop-blur transition-colors hover:bg-accent',
        active && 'bg-primary text-primary-foreground hover:bg-primary/90',
      )}
    >
      {children}
    </button>
  )
}

export function MapControls({ onZoomIn, onZoomOut, onResetBearing, onRecenter, showEvents, onToggleEvents }: MapControlsProps) {
  return (
    <div className="absolute right-3 top-16 z-10 flex flex-col gap-2">
      <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card/95 shadow-md backdrop-blur">
        <button type="button" onClick={onZoomIn} aria-label="Zoomer" title="Zoomer" className="grid size-10 place-items-center hover:bg-accent">
          <Plus size={17} />
        </button>
        <div className="h-px bg-border" />
        <button type="button" onClick={onZoomOut} aria-label="Dézoomer" title="Dézoomer" className="grid size-10 place-items-center hover:bg-accent">
          <Minus size={17} />
        </button>
      </div>
      <ControlButton onClick={onResetBearing} label="Réinitialiser l’orientation">
        <Compass size={17} />
      </ControlButton>
      <ControlButton onClick={onRecenter} label="Recentrer sur ma position">
        <Crosshair size={17} />
      </ControlButton>
      <ControlButton onClick={onToggleEvents} label="Afficher ou masquer les signalements" active={showEvents}>
        <Layers size={17} />
      </ControlButton>
    </div>
  )
}

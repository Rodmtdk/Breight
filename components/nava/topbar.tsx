import { Menu, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/nava/mode-toggle'

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar} aria-label="Afficher ou masquer le panneau">
          <Menu size={19} />
        </Button>
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 -rotate-6 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Navigation size={18} fill="currentColor" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-bold tracking-tight">nava</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Navigation intelligente</p>
          </div>
        </div>
      </div>
      <ModeToggle />
    </header>
  )
}

import { ShieldCheck } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { ProfileRecord } from '@/lib/types'

function reliabilityLabel(percent: number) {
  if (percent >= 90) return 'Excellente'
  if (percent >= 70) return 'Bonne'
  if (percent >= 50) return 'Correcte'
  return 'Faible'
}

export function ReliabilityCard({ profile, reliability }: { profile: ProfileRecord | null; reliability: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
        <ShieldCheck size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold">Votre fiabilité</span>
          <span className="text-xs text-muted-foreground">
            {reliabilityLabel(reliability)} · {reliability}%
          </span>
        </div>
        <Progress value={reliability} className="mt-1.5 h-1.5" />
        <p className="mt-1.5 text-[11px] text-muted-foreground">{profile?.reports_count ?? 0} signalement(s) envoyé(s)</p>
      </div>
    </div>
  )
}

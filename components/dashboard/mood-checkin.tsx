'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { MOODS } from '@/lib/prompts'
import { recordMood } from '@/app/actions/chat'
import { triggerSensory } from '@/lib/sensory'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function MoodCheckin() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSelect = async (moodId: string) => {
    setSelected(moodId)
    triggerSensory('mood')
    try {
      await recordMood(moodId, 3)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // silent
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">
          Comment tu te sens vraiment ?
        </h2>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-warm font-medium">
            <Check className="size-3.5" aria-hidden="true" />
            Noté
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => handleSelect(mood.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              selected === mood.id
                ? 'border-warm bg-warm text-warm-foreground'
                : 'border-border bg-card text-foreground hover:border-warm/50',
            )}
            aria-pressed={selected === mood.id}
          >
            {mood.label}
          </button>
        ))}
      </div>
    </Card>
  )
}

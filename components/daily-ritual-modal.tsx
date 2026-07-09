'use client'

import { useState, useEffect } from 'react'
import { completeMorningRitual, completeNightRitual, getTodayRitual } from '@/app/actions/daily-rituals'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { triggerSensory } from '@/lib/sensory'
import { X, Moon, Sun } from 'lucide-react'

interface DailyRitualModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'morning' | 'night'
}

export function DailyRitualModal({ isOpen, onClose, type }: DailyRitualModalProps) {
  const [ritual, setRitual] = useState<any>(null)
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      async function load() {
        const r = await getTodayRitual()
        setRitual(r)
      }
      load()
    }
  }, [isOpen])

  async function handleComplete() {
    setLoading(true)
    if (type === 'morning') {
      await completeMorningRitual()
      triggerSensory('success')
    } else {
      await completeNightRitual(reflection)
      triggerSensory('success')
    }
    setLoading(false)
    onClose()
  }

  if (!isOpen || !ritual) return null

  const Icon = type === 'morning' ? Sun : Moon
  const prompt = type === 'morning' ? ritual.morningIntention : 'Qui t\'a vraiment écouté aujourd\'hui ?'
  const isCompleted = type === 'morning' ? ritual.morningCompletedAt : ritual.nightCompletedAt

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      
      <div className="relative w-full rounded-t-2xl bg-card border-t border-border p-6 animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-start gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {type === 'morning' ? 'Intention du matin' : 'Reflection du soir'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isCompleted ? 'Complété aujourd\'hui' : 'À faire aujourd\'hui'}
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm leading-relaxed text-foreground italic">
            {prompt}
          </p>
        </div>

        {type === 'night' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Ta reflection
            </label>
            <Textarea
              placeholder="Écris ta pensée vraie..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-32 resize-none"
            />
          </div>
        )}

        {type === 'morning' && !isCompleted && (
          <p className="text-xs text-muted-foreground mb-6 text-center">
            En affirmant cette intention, tu crées une journée d'écoute consciente.
          </p>
        )}

        <Button
          onClick={handleComplete}
          disabled={loading || isCompleted || (type === 'night' && !reflection)}
          className="w-full"
        >
          {isCompleted ? 'Complété' : type === 'morning' ? 'Affirmer mon intention' : 'Sauvegarder ma reflection'}
        </Button>
      </div>
    </div>
  )
}

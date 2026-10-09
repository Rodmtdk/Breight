'use client'

import { useState } from 'react'
import { Loader2, MapPinPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { EVENT_ICONS } from '@/components/nava/event-icon'
import { EVENT_TYPE_CONFIG } from '@/lib/types'
import { cn } from '@/lib/utils'
import type { EventType, LatLng } from '@/lib/types'

interface ReportDialogProps {
  userPosition: LatLng
  pickedPosition: LatLng | null
  onStartPicking: () => void
  onSubmit: (input: { type: EventType; lat: number; lng: number; description: string }) => Promise<void>
}

const TYPES = Object.keys(EVENT_TYPE_CONFIG) as EventType[]

export function ReportDialog({ userPosition, pickedPosition, onStartPicking, onSubmit }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<EventType>('traffic_jam')
  const [description, setDescription] = useState('')
  const [useCurrentLocation, setUseCurrentLocation] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const position = useCurrentLocation ? userPosition : pickedPosition

  async function handleSubmit() {
    if (!position) return
    setSubmitting(true)
    try {
      await onSubmit({ type, lat: position.lat, lng: position.lng, description })
      setDescription('')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="w-full gap-2" onClick={() => setOpen(true)}>
        <MapPinPlus size={16} data-icon="inline-start" />
        Signaler un événement
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler un événement</DialogTitle>
          <DialogDescription>Aidez les autres conducteurs en partageant ce que vous observez sur la route.</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel>Type de signalement</FieldLabel>
            <div className="grid grid-cols-5 gap-2">
              {TYPES.map((candidate) => {
                const Icon = EVENT_ICONS[candidate]
                return (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => setType(candidate)}
                    aria-pressed={type === candidate}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-[11px] font-medium transition-colors',
                      type === candidate ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/50 hover:bg-accent',
                    )}
                  >
                    <Icon size={16} />
                    {EVENT_TYPE_CONFIG[candidate].label}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field>
            <FieldLabel>Position</FieldLabel>
            <div className="flex gap-2">
              <Button type="button" variant={useCurrentLocation ? 'default' : 'outline'} size="sm" onClick={() => setUseCurrentLocation(true)}>
                Ma position
              </Button>
              <Button
                type="button"
                variant={!useCurrentLocation ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setUseCurrentLocation(false)
                  onStartPicking()
                }}
              >
                Choisir sur la carte
              </Button>
            </div>
            {!useCurrentLocation ? (
              <p className="text-xs text-muted-foreground">{pickedPosition ? 'Point sélectionné sur la carte.' : 'Cliquez sur la carte pour placer le repère.'}</p>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="report-description">Détails (optionnel)</FieldLabel>
            <Textarea
              id="report-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex. : deux voies bloquées, véhicule sur la bande d’arrêt..."
              maxLength={280}
              rows={3}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Annuler</Button>} />
          <Button onClick={handleSubmit} disabled={submitting || !position} className="gap-2">
            {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
            Envoyer le signalement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

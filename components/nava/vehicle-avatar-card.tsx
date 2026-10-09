'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Camera, Car, RotateCcw, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import type { ProfileRecord } from '@/lib/types'

interface VehicleAvatarCardProps {
  profileId: string | null
  profile: ProfileRecord | null
  onUpdated: () => void
}

type ScanStatus = 'idle' | 'analyzing' | 'done' | 'error'

export function VehicleAvatarCard({ profileId, profile, onUpdated }: VehicleAvatarCardProps) {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasIcon = Boolean(profile?.vehicle_icon_url)

  function resetScan() {
    setFile(null)
    setPreviewUrl(null)
    setStatus('idle')
    setResultUrl(null)
    setErrorMessage(null)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) resetScan()
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setStatus('idle')
    setResultUrl(null)
    setErrorMessage(null)
  }

  async function handleAnalyze() {
    if (!file || !profileId) return
    setStatus('analyzing')
    setErrorMessage(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('profileId', profileId)
      const response = await fetch('/api/vehicle-scan', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Impossible de générer l’avatar')

      setResultUrl(data.iconUrl)
      setStatus('done')
      onUpdated()
      toast.success('Votre véhicule est prêt à rouler !')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Impossible de générer l’avatar')
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
        <Avatar className="size-10 shrink-0 bg-secondary">
          {profile?.vehicle_icon_url ? <AvatarImage src={profile.vehicle_icon_url} alt="Avatar de votre véhicule" /> : null}
          <AvatarFallback>
            <Car size={18} className="text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">Mon véhicule</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {hasIcon ? 'Avatar prêt pour la conduite' : 'Scannez votre véhicule pour créer votre avatar'}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setOpen(true)}>
          <ScanLine size={14} data-icon="inline-start" />
          {hasIcon ? 'Changer' : 'Scanner'}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner mon véhicule</DialogTitle>
            <DialogDescription>
              Prenez une photo de votre véhicule. Nous la transformons en icône pour vous représenter sur la carte pendant la conduite.
            </DialogDescription>
          </DialogHeader>

          <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

          {status === 'done' && resultUrl ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Avatar className="size-24 border border-border bg-secondary">
                <AvatarImage src={resultUrl} alt="Avatar généré de votre véhicule" />
                <AvatarFallback>
                  <Car size={28} />
                </AvatarFallback>
              </Avatar>
              <p className="text-center text-sm font-medium">Votre avatar est prêt !</p>
              <p className="text-center text-xs text-muted-foreground">Il apparaît maintenant à votre position pendant la conduite.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex size-32 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-secondary/50 transition-colors hover:bg-accent"
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not an optimizable remote asset
                  <img src={previewUrl} alt="Photo du véhicule sélectionnée" className="size-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <Camera size={22} />
                    <span className="text-[11px] font-medium">Prendre / choisir une photo</span>
                  </span>
                )}
              </button>
              {previewUrl ? (
                <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => inputRef.current?.click()}>
                  <RotateCcw size={13} data-icon="inline-start" />
                  Changer la photo
                </Button>
              ) : null}
              {status === 'analyzing' ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Spinner className="size-3.5" />
                  Création de votre avatar…
                </p>
              ) : null}
              {status === 'error' && errorMessage ? <p className="text-center text-xs text-destructive">{errorMessage}</p> : null}
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline">{status === 'done' ? 'Fermer' : 'Annuler'}</Button>} />
            {status !== 'done' ? (
              <Button onClick={handleAnalyze} disabled={!file || status === 'analyzing'} className="gap-2">
                {status === 'analyzing' ? <Spinner className="size-3.5" /> : null}
                Analyser le véhicule
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

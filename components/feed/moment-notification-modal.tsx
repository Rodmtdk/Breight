'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { triggerSensory } from '@/lib/sensory'

interface MomentNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { content?: string; mediaUrl?: string }) => Promise<void>
  windowClosesAt: Date
}

export function MomentNotificationModal({
  isOpen,
  onClose,
  onSubmit,
  windowClosesAt,
}: MomentNotificationModalProps) {
  const [step, setStep] = useState<'countdown' | 'compose' | 'preview'>('countdown')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('23h59m')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Update countdown timer
  useEffect(() => {
    if (!isOpen) return

    const updateTimer = () => {
      const now = new Date()
      const diff = windowClosesAt.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('0m')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeRemaining(`${hours}h${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [isOpen, windowClosesAt])

  // Start video stream on modal open
  useEffect(() => {
    if (!isOpen || step !== 'compose' || !videoRef.current) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        videoRef.current!.srcObject = stream
        triggerSensory('tap')
      } catch (err) {
        setError('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.')
        console.error('Camera error:', err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [isOpen, step])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    if (!context) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    canvasRef.current.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setFile(new File([blob], 'moment.jpg', { type: 'image/jpeg' }))
      triggerSensory('milestone')
      setStep('preview')
    })
  }

  const handleFileUpload = (f: File | null) => {
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
    setStep('preview')
  }

  const handleSubmit = async () => {
    if (isLoading) return
    setIsLoading(true)
    setError(null)

    try {
      let mediaUrl: string | undefined

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const json = await res.json()

        if (!res.ok) {
          setError(json.error ?? 'Erreur d\'upload')
          return
        }
        mediaUrl = json.pathname
      }

      await onSubmit({
        content: content.trim() || undefined,
        mediaUrl,
      })

      triggerSensory('milestone')
      setStep('countdown')
      setContent('')
      setFile(null)
      setPreviewUrl(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la publication')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-md rounded-t-3xl bg-background p-6 shadow-xl animate-fade-in">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">C&apos;est l&apos;heure</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === 'countdown' ? 'Ton moment t\'attend' : step === 'preview' ? 'Avant de partager' : 'Ajoute ta photo'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-secondary"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>

        {step === 'countdown' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <div className="text-6xl font-serif font-bold text-jade">{timeRemaining}</div>
              <p className="mt-2 text-sm text-muted-foreground">avant que ce moment disparaisse</p>
            </div>

            <div className="w-full space-y-2">
              <Button
                onClick={() => setStep('compose')}
                className="w-full h-12 text-base"
              >
                <Camera className="mr-2 size-4" />
                Prendre une photo
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  fileRef.current?.click()
                  triggerSensory('tap')
                }}
                className="w-full"
              >
                Choisir une photo
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full">
                Pas maintenant
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Les moments disparaissent après 24h. Reviens demain à 12h12 pour en poster un nouveau.
            </p>
          </div>
        )}

        {step === 'compose' && (
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <button
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-jade p-4 text-primary-foreground hover:bg-jade/90"
                aria-label="Capturer la photo"
              >
                <Camera className="size-6" />
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
            />

            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              className="w-full"
            >
              Galerie
            </Button>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex flex-col gap-4">
            {previewUrl && (
              <div className="relative overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Aperçu du moment"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décris ton moment... (optionnel)"
              rows={2}
              aria-label="Description du moment"
            />

            {error && (
              <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setStep('compose')}
                disabled={isLoading}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Publication...' : 'Partager'}
              </Button>
            </div>
          </div>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="sr-only" />
      </div>
    </div>
  )
}

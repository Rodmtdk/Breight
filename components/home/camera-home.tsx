'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageIcon, RefreshCw, Send, User } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { postMoment } from '@/app/actions/feed'
import { triggerSensory } from '@/lib/sensory'

export interface StoryChip {
  id: string
  name: string
  avatarUrl: string | null
  href: string
  mine?: boolean
}

export function CameraHome({
  name,
  stories,
  unreadCount = 0,
}: {
  name: string
  stories: StoryChip[]
  unreadCount?: number
}) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facing, setFacing] = useState<'user' | 'environment'>('environment')
  const [ready, setReady] = useState(false)
  const [denied, setDenied] = useState(false)
  const [shot, setShot] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraAttempt, setCameraAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    setDenied(false)

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setDenied(true)
        return
      }
      try {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
        setReady(true)
      } catch {
        if (!cancelled) setDenied(true)
      }
    }

    void start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [cameraAttempt, facing])

  function capture() {
    const video = videoRef.current
    if (!video || !ready) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 720
    canvas.height = video.videoHeight || 1280
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    setShot(canvas.toDataURL('image/jpeg', 0.86))
    setError(null)
    triggerSensory('tap')
  }

  async function sendStory() {
    if (!shot || busy) return
    setBusy(true)
    setError(null)
    try {
      const blob = await (await fetch(shot)).blob()
      const file = new File([blob], 'story.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', file)
      const upload = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await upload.json()
      if (!upload.ok) {
        setError(json.error ?? 'Envoi impossible')
        return
      }
      await postMoment({ mediaUrl: json.pathname, ephemeral: true })
      triggerSensory('milestone')
      setShot(null)
      router.push('/feed')
      router.refresh()
    } catch {
      setError('Envoi impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative mx-auto h-svh w-full max-w-lg overflow-hidden bg-black text-white">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 size-full object-cover"
        aria-label="Aperçu de la caméra"
      />
      {shot ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shot} alt="Photo prise" className="absolute inset-0 size-full object-cover" />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" />
      <div className="pointer-events-none absolute right-4 top-32 z-[1] hidden w-28 overflow-hidden rounded-3xl border border-white/20 bg-black/20 shadow-2xl backdrop-blur sm:block">
        <img src="/br8-avatar-art.png" alt="" className="w-[180%] max-w-none translate-x-[-28%]" />
      </div>

      <header className="absolute inset-x-0 top-0 z-10 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-black tracking-[0.22em]">BR8</p>
          <Link href="/profile" aria-label="Ouvrir mon profil" className="flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-xs text-white/85 backdrop-blur">
            <span className="max-w-24 truncate">{name}</span>
            <User className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="pointer-events-auto mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/brief" className="flex shrink-0 items-center gap-2 rounded-full border border-jade/50 bg-jade/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
            <span className="grid size-5 place-items-center rounded-full bg-jade text-[10px] text-jade-foreground">B</span>
            Débloquer un sujet
          </Link>
        </div>
        <div className="pointer-events-auto flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/feed" className="flex w-16 shrink-0 flex-col items-center gap-1">
            <span className="grid size-14 place-items-center rounded-full border-2 border-white/80 bg-white/10 text-lg font-semibold">
              +
            </span>
            <span className="text-[10px] font-medium">Ma story</span>
          </Link>
          {stories.map((story) => (
            <Link key={story.id} href={story.href} className="flex w-16 shrink-0 flex-col items-center gap-1">
              <span className="grid size-14 place-items-center overflow-hidden rounded-full border-2 border-jade bg-white/10 text-sm font-semibold">
                {story.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={story.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  story.name.slice(0, 1).toUpperCase()
                )}
              </span>
              <span className="w-full truncate text-center text-[10px] font-medium">{story.name}</span>
            </Link>
          ))}
        </div>
      </header>

      {denied && !shot ? (
        <div className="absolute inset-x-8 top-1/2 z-10 -translate-y-1/2 rounded-2xl bg-black/70 p-5 text-center backdrop-blur">
          <p className="text-sm font-medium">Caméra indisponible</p>
          <p className="mt-1 text-xs leading-relaxed text-white/70">
            Autorise la caméra pour prendre une photo, ou ouvre Stories pour publier depuis ta galerie.
          </p>
          <button
            type="button"
            onClick={() => {
              setDenied(false)
              setCameraAttempt((value) => value + 1)
            }}
            className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
          >
            Réessayer
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="absolute inset-x-6 bottom-36 z-10 text-center text-xs text-white">{error}</p>
      ) : null}

      <div className="absolute inset-x-0 bottom-24 z-10 flex items-center justify-between px-8">
        <Link
          href="/feed"
          aria-label="Stories"
          className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur"
        >
          <ImageIcon className="size-5" />
        </Link>

        {shot ? (
          <button
            type="button"
            onClick={() => void sendStory()}
            disabled={busy}
            aria-label="Envoyer la story"
            className="grid size-[4.5rem] place-items-center rounded-full bg-white text-black disabled:opacity-60"
          >
            <Send className="size-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={capture}
            disabled={!ready}
            aria-label="Prendre une photo"
            className="grid size-[4.5rem] place-items-center rounded-full border-4 border-white bg-white/20 disabled:opacity-40"
          >
            <span className="size-14 rounded-full bg-white" />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (shot) setShot(null)
            else setFacing((current) => (current === 'environment' ? 'user' : 'environment'))
          }}
          aria-label={shot ? 'Reprendre' : 'Changer de caméra'}
          className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur"
        >
          <RefreshCw className="size-5" />
        </button>
      </div>

      <BottomNav unreadCount={unreadCount} overlay />
    </div>
  )
}

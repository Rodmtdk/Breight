"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { shareMusic } from "@/app/actions/feed"
import { triggerSensory } from "@/lib/sensory"

function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim()
  // Direct ID (11 chars)
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  try {
    const url = new URL(trimmed)
    if (url.hostname === "youtu.be") return url.pathname.slice(1, 12) || null
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v")
      if (v) return v
      const shorts = url.pathname.match(/\/shorts\/([\w-]{11})/)
      if (shorts) return shorts[1]
      const embed = url.pathname.match(/\/embed\/([\w-]{11})/)
      if (embed) return embed[1]
    }
  } catch {
    return null
  }
  return null
}

export function MusicSharer() {
  const router = useRouter()
  const [link, setLink] = useState("")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleShare = async () => {
    setError(null)
    const videoId = extractYouTubeId(link)
    if (!videoId) {
      setError("Lien YouTube invalide. Colle un lien youtube.com ou youtu.be.")
      return
    }
    if (!title.trim()) {
      setError("Ajoute le titre du morceau.")
      return
    }
    setBusy(true)
    try {
      await shareMusic({
        youtubeVideoId: videoId,
        title: title.trim(),
        message: message.trim() || undefined,
      })
      triggerSensory("send")
      setLink("")
      setTitle("")
      setMessage("")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
        <Music className="size-4 text-primary" aria-hidden="true" />
        Partager un morceau
      </h2>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="yt-link">Lien YouTube</Label>
        <Input
          id="yt-link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://youtu.be/..."
          inputMode="url"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="yt-title">Titre du morceau</Label>
        <Input
          id="yt-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Artiste - Titre"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="yt-message">Pourquoi ce morceau ? (optionnel)</Label>
        <Input
          id="yt-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Il me fait penser \u00e0 toi..."
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button onClick={handleShare} disabled={busy || !link.trim() || !title.trim()}>
        {busy ? "Partage..." : "Partager"}
      </Button>
    </section>
  )
}

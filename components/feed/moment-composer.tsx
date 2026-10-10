"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, ImageIcon, Music2, Video, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { postMoment } from "@/app/actions/feed"
import { triggerSensory } from "@/lib/sensory"

export function MomentComposer() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("daily")
  const [mood, setMood] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ephemeral, setEphemeral] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (f: File | null) => {
    if (f && f.size > 50 * 1024 * 1024) {
      setError("Le fichier doit faire moins de 50 Mo.")
      return
    }
    setError(null)
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(f ? URL.createObjectURL(f) : null)
  }

  const handlePost = async () => {
    if ((!content.trim() && !file) || busy) return
    setBusy(true)
    setError(null)
    try {
      let mediaPathname: string | undefined
      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error ?? "Erreur d'upload")
          return
        }
        mediaPathname = json.pathname
      }
      const moodLine = mood.trim() ? `mood::${mood.trim()}` : ""
      await postMoment({
        content: [moodLine, content.trim()].filter(Boolean).join("\n\n") || undefined,
        mediaUrl: mediaPathname,
        feedType: category,
        ephemeral,
      })
      triggerSensory("milestone")
      setContent("")
      handleFileChange(null)
      router.refresh()
    } catch {
      setError("Impossible de publier pour le moment. Vérifie ta connexion puis réessaie.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[['daily', 'Daily'], ['offer', 'Offre'], ['sale', 'À vendre'], ['job', 'Emploi']].map(([value, label]) => (
          <button key={value} type="button" onClick={() => setCategory(value)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${category === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{label}</button>
        ))}
      </div>
      <input value={mood} onChange={(event) => setMood(event.target.value)} placeholder="Ton mood du moment..." aria-label="Mood du moment" className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Un moment vrai, sans filtre..."
        rows={2}
        aria-label="Contenu du moment"
      />

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl">
          {file?.type.startsWith("video/") ? <video src={previewUrl} controls playsInline className="max-h-64 w-full bg-black object-cover" aria-label="Aperçu de la vidéo" /> : file?.type.startsWith("audio/") ? <div className="flex items-center gap-3 bg-secondary px-4 py-5"><Music2 className="size-5" /><audio src={previewUrl} controls className="min-w-0 flex-1" /></div> : <img src={previewUrl} alt="Aperçu de la photo" className="max-h-64 w-full object-cover" />}
          <button
            type="button"
            onClick={() => handleFileChange(null)}
            aria-label="Retirer la photo"
            className="absolute top-2 right-2 rounded-full bg-foreground/60 p-1.5 text-background"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/mp4,audio/wav"
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        aria-label="Choisir une photo, une vidéo ou un audio"
      />

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            triggerSensory("tap")
            fileRef.current?.click()
          }}
        >
          <ImageIcon className="size-4" />
          Photo / vidéo / audio
        </Button>
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <Label htmlFor="ephemeral" className="text-xs text-muted-foreground">
            24h
          </Label>
          <Switch id="ephemeral" checked={ephemeral} onCheckedChange={setEphemeral} />
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <Button onClick={handlePost} disabled={busy || (!content.trim() && !file)}>
        {busy ? "Publication..." : "Partager le moment"}
      </Button>
    </section>
  )
}

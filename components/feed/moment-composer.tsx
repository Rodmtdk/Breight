"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Clock, X } from "lucide-react"
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
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ephemeral, setEphemeral] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (f: File | null) => {
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
      await postMoment({
        content: content.trim() || undefined,
        mediaUrl: mediaPathname,
        ephemeral,
      })
      triggerSensory("milestone")
      setContent("")
      handleFileChange(null)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Un moment vrai, sans filtre..."
        rows={2}
        aria-label="Contenu du moment"
      />

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl || "/placeholder.svg"} alt="Aper\u00e7u de la photo" className="max-h-64 w-full object-cover" />
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
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        aria-label="Choisir une photo"
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
          <Camera className="size-4" />
          Photo
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

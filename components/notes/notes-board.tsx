"use client"

import { useCallback, useEffect, useState } from "react"
import { StickyNote, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getNotesForRelationship, pinNote, deleteNote } from "@/app/actions/feed"
import { triggerSensory } from "@/lib/sensory"

interface Connection {
  relationshipId: string
  relationshipType: string
  userId: string
  displayName: string
}

interface Note {
  id: string
  isMine: boolean
  content: string | null
  color: string | null
  pinnedAt: string
}

const NOTE_COLORS = [
  { id: "default", class: "bg-card border-border" },
  { id: "warm", class: "bg-accent border-accent" },
  { id: "soft", class: "bg-secondary border-secondary" },
]

export function NotesBoard({ connections }: { connections: Connection[] }) {
  const [selected, setSelected] = useState<string | null>(connections[0]?.relationshipId ?? null)
  const [notes, setNotes] = useState<Note[]>([])
  const [content, setContent] = useState("")
  const [color, setColor] = useState("default")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (relationshipId: string) => {
    const rows = await getNotesForRelationship(relationshipId)
    setNotes(rows)
  }, [])

  useEffect(() => {
    if (selected) load(selected)
  }, [selected, load])

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
        <StickyNote className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Connecte-toi d&apos;abord avec quelqu&apos;un pour pingler des notes.
        </p>
      </div>
    )
  }

  const handlePin = async () => {
    if (!content.trim() || !selected || busy) return
    setBusy(true)
    try {
      await pinNote({ relationshipId: selected, content: content.trim(), color })
      triggerSensory("mood")
      setContent("")
      await load(selected)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!selected) return
    triggerSensory("tap")
    await deleteNote(id)
    await load(selected)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 overflow-x-auto">
        {connections.map((c) => (
          <button
            key={c.relationshipId}
            type="button"
            onClick={() => {
              setSelected(c.relationshipId)
              triggerSensory("tap")
            }}
            className={
              c.relationshipId === selected
                ? "shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
                : "shrink-0 rounded-full bg-secondary px-4 py-1.5 text-xs text-secondary-foreground"
            }
          >
            {c.displayName}
          </button>
        ))}
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Un petit mot doux, une pens\u00e9e, un rappel..."
          rows={2}
          aria-label="Contenu de la note"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2" role="radiogroup" aria-label="Couleur de la note">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={color === c.id}
                aria-label={`Couleur ${c.id}`}
                onClick={() => setColor(c.id)}
                className={`size-6 rounded-full border-2 ${c.class} ${color === c.id ? "ring-2 ring-ring" : ""}`}
              />
            ))}
          </div>
          <Button size="sm" onClick={handlePin} disabled={busy || !content.trim()}>
            {busy ? "..." : "Pingler"}
          </Button>
        </div>
      </section>

      {notes.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Aucune note pingl&eacute;e ici.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {notes.map((n) => {
            const colorClass = NOTE_COLORS.find((c) => c.id === n.color)?.class ?? NOTE_COLORS[0].class
            return (
              <li key={n.id}>
                <div className={`flex h-full flex-col justify-between gap-2 rounded-xl border p-3 ${colorClass}`}>
                  <p className="text-sm leading-relaxed text-foreground">{n.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.pinnedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                    {n.isMine ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        aria-label="Supprimer la note"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

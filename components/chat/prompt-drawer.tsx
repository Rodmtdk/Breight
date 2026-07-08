"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { GUIDED_PROMPTS, PROMPT_CATEGORIES, type PromptCategory } from "@/lib/prompts"

export function PromptDrawer({
  open,
  onClose,
  onPick,
}: {
  open: boolean
  onClose: () => void
  onPick: (promptId: string, text: string) => void
}) {
  const [category, setCategory] = useState<PromptCategory>("checkin")

  if (!open) return null

  const prompts = GUIDED_PROMPTS.filter((p) => p.category === category)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40" role="dialog" aria-modal="true" aria-label="Prompts guid&eacute;s">
      <div className="flex max-h-[75svh] w-full max-w-md flex-col rounded-t-2xl bg-background">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-base font-semibold text-foreground">&Eacute;coute guid&eacute;e</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>
        <p className="px-5 pb-3 text-xs leading-relaxed text-muted-foreground">
          {"Des questions con\u00e7ues par la psychologie de l'\u00e9coute active pour cr\u00e9er une vraie connexion."}
        </p>
        <div className="flex gap-2 overflow-x-auto px-5 pb-3">
          {(Object.keys(PROMPT_CATEGORIES) as PromptCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={
                cat === category
                  ? "shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  : "shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
              }
            >
              {PROMPT_CATEGORIES[cat].label}
            </button>
          ))}
        </div>
        <ul className="flex flex-col gap-2 overflow-y-auto px-5 pb-6">
          {prompts.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onPick(p.id, p.text)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm leading-relaxed text-card-foreground transition-colors hover:bg-secondary"
              >
                {p.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

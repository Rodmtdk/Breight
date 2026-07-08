"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HeartHandshake, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { inviteByEmail } from "@/app/actions/discovery"
import { triggerSensory } from "@/lib/sensory"

interface Connection {
  relationshipId: string
  relationshipType: string
  userId: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
}

const TYPE_LABELS: Record<string, string> = {
  couple: "Couple",
  friend: "Ami(e)",
  matched: "Match",
}

export function ConnectionsList({ connections }: { connections: Connection[] }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [type, setType] = useState<"couple" | "friend">("friend")
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleInvite = async () => {
    if (!email.trim() || busy) return
    setBusy(true)
    setStatus(null)
    try {
      const result = await inviteByEmail(email, type)
      if (result.ok) {
        triggerSensory("milestone")
        setStatus("Connexion cr\u00e9\u00e9e !")
        setEmail("")
        router.refresh()
      } else {
        setStatus(result.error ?? "Erreur")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-card-foreground">
        <HeartHandshake className="size-4 text-primary" aria-hidden="true" />
        Mes connexions
      </h2>

      {connections.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Aucune connexion pour le moment. Invite ton/ta partenaire ou un(e) ami(e) par email.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {connections.map((c) => (
            <li key={c.relationshipId} className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={c.avatarUrl ?? undefined} alt="" />
                <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
                  {c.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-card-foreground">{c.displayName}</span>
                <span className="text-xs text-muted-foreground">{TYPE_LABELS[c.relationshipType] ?? c.relationshipType}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Label htmlFor="invite-email" className="flex items-center gap-1.5">
          <UserPlus className="size-3.5" aria-hidden="true" />
          Inviter par email
        </Label>
        <div className="flex gap-2">
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("friend")}
            className={
              type === "friend"
                ? "flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                : "flex-1 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground"
            }
            aria-pressed={type === "friend"}
          >
            Ami(e)
          </button>
          <button
            type="button"
            onClick={() => setType("couple")}
            className={
              type === "couple"
                ? "flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                : "flex-1 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground"
            }
            aria-pressed={type === "couple"}
          >
            Couple
          </button>
        </div>
        <Button onClick={handleInvite} disabled={busy || !email.trim()}>
          {busy ? "Invitation..." : "Inviter"}
        </Button>
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      </div>
    </section>
  )
}

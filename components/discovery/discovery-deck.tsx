"use client"

import { useCallback, useState } from "react"
import { Heart, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { swipe, getDiscoveryProfiles } from "@/app/actions/discovery"
import { triggerSensory } from "@/lib/sensory"
import { MatchModal } from "@/components/discovery/match-modal"

interface DiscoveryProfile {
  userId: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  age: number | null
  location: string | null
  interests: string[]
  sharedInterests: string[]
  matchPercent: number
}

export function DiscoveryDeck({ initialProfiles }: { initialProfiles: DiscoveryProfile[] }) {
  const [deck, setDeck] = useState<DiscoveryProfile[]>(initialProfiles)
  const [matchedWith, setMatchedWith] = useState<DiscoveryProfile | null>(null)
  const [busy, setBusy] = useState(false)

  const current = deck[0] ?? null

  const handleSwipe = useCallback(
    async (action: "like" | "pass") => {
      if (!current || busy) return
      setBusy(true)
      triggerSensory("tap")
      try {
        const result = await swipe(current.userId, action)
        if (result.matched) {
          triggerSensory("match")
          setMatchedWith(current)
        }
        const rest = deck.slice(1)
        if (rest.length === 0) {
          const more = await getDiscoveryProfiles(10)
          setDeck(more)
        } else {
          setDeck(rest)
        }
      } finally {
        setBusy(false)
      }
    },
    [current, busy, deck],
  )

  if (!current) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <Heart className="size-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {"Plus de profils pour l'instant. Reviens bient\u00f4t \u2014 de nouvelles personnes rejoignent BREIGHT chaque jour."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-5">
      <article className="flex flex-1 flex-col rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar className="size-24">
            <AvatarImage src={current.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-secondary text-2xl font-medium text-secondary-foreground">
              {current.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">
              {current.displayName}
              {current.age ? <span className="font-normal text-muted-foreground">, {current.age}</span> : null}
            </h2>
            {current.location ? (
              <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden="true" />
                {current.location}
              </p>
            ) : null}
          </div>
          {current.matchPercent > 0 ? (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {current.matchPercent}% d&apos;affinit&eacute;s
            </span>
          ) : null}
        </div>

        {current.bio ? (
          <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">{current.bio}</p>
        ) : null}

        {current.interests.length > 0 ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {current.interests.map((interest) => (
              <span
                key={interest}
                className={
                  current.sharedInterests.includes(interest)
                    ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                    : "rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                }
              >
                {interest}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      <div className="flex items-center justify-center gap-6 py-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-14 rounded-full"
          aria-label="Passer"
          disabled={busy}
          onClick={() => handleSwipe("pass")}
        >
          <X className="size-6" />
        </Button>
        <Button
          type="button"
          size="icon"
          className="size-16 rounded-full"
          aria-label="Aimer"
          disabled={busy}
          onClick={() => handleSwipe("like")}
        >
          <Heart className="size-7" />
        </Button>
      </div>

      <MatchModal profile={matchedWith} onClose={() => setMatchedWith(null)} />
    </div>
  )
}

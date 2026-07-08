"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MatchProfile {
  userId: string
  displayName: string
  avatarUrl: string | null
}

export function MatchModal({ profile, onClose }: { profile: MatchProfile | null; onClose: () => void }) {
  if (!profile) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Nouveau match"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl bg-background p-8 text-center">
        <Heart className="size-10 text-primary" aria-hidden="true" />
        <Avatar className="size-20">
          <AvatarImage src={profile.avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-secondary text-xl font-medium text-secondary-foreground">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold text-foreground">{"C'est une connexion !"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {profile.displayName} et toi vous appr&eacute;ciez mutuellement. Commencez par une vraie question.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button asChild>
            <Link href="/chat">Ouvrir la conversation</Link>
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Continuer &agrave; d&eacute;couvrir
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { triggerSensory } from "@/lib/sensory"

interface ConversationItem {
  conversationId: string
  otherUserId: string
  displayName: string
  avatarUrl: string | null
  lastMessageAt: string | null
}

export function ChatList({
  conversations,
}: {
  conversations: ConversationItem[]
  currentUserId: string
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <MessageCircle className="size-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {"Aucune conversation pour l'instant. Trouve des connexions dans l'onglet D\u00e9couverte."}
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col">
      {conversations.map((c) => (
        <li key={c.conversationId}>
          <Link
            href={`/chat/${c.conversationId}`}
            onClick={() => triggerSensory("tap")}
            className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary"
          >
            <Avatar className="size-11">
              <AvatarImage src={c.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-secondary text-sm font-medium text-secondary-foreground">
                {c.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{c.displayName}</span>
              <span className="text-xs text-muted-foreground">
                {c.lastMessageAt
                  ? new Date(c.lastMessageAt).toLocaleString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Nouvelle conversation"}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

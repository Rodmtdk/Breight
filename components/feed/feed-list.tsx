"use client"

import { useRouter } from "next/navigation"
import { Clock, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deleteMoment } from "@/app/actions/feed"
import { triggerSensory } from "@/lib/sensory"

interface FeedItem {
  id: string
  isMine: boolean
  authorName: string
  authorAvatar: string | null
  mediaUrl: string | null
  content: string | null
  feedType: string
  createdAt: string
  expiresAt: string | null
}

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "expir\u00e9"
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 1) return `${hours}h restantes`
  return `${Math.max(1, Math.floor(ms / 60_000))}min restantes`
}

export function FeedList({ items }: { items: FeedItem[] }) {
  const router = useRouter()

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm leading-relaxed text-muted-foreground">
        Aucun moment pour l&apos;instant. Sois le/la premi&egrave;re &agrave; partager un instant vrai.
      </p>
    )
  }

  const handleDelete = async (id: string) => {
    triggerSensory("tap")
    await deleteMoment(id)
    router.refresh()
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <article className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar className="size-9">
                <AvatarImage src={item.authorAvatar ?? undefined} alt="" />
                <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
                  {item.authorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-card-foreground">{item.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {item.expiresAt ? (
                <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">
                  <Clock className="size-3" aria-hidden="true" />
                  {timeLeft(item.expiresAt)}
                </span>
              ) : null}
              {item.isMine ? (
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  aria-label="Supprimer ce moment"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              ) : null}
            </div>
            {item.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/file?pathname=${encodeURIComponent(item.mediaUrl)}`}
                alt={item.content ?? "Moment partag\u00e9"}
                className="max-h-96 w-full object-cover"
              />
            ) : null}
            {item.content ? (
              <p className="px-4 py-3 text-sm leading-relaxed text-card-foreground">{item.content}</p>
            ) : null}
          </article>
        </li>
      ))}
    </ul>
  )
}

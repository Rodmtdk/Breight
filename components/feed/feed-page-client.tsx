'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { postMoment } from '@/app/actions/feed'
import { BottomNav } from '@/components/bottom-nav'
import { MomentComposer } from '@/components/feed/moment-composer'
import { FeedList } from '@/components/feed/feed-list'
import { MomentNotificationModal } from '@/components/feed/moment-notification-modal'

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

interface FeedPageClientProps {
  items: FeedItem[]
  hasPostedToday: boolean
  windowClosesAt: string
}

export function FeedPageClient({
  items,
  hasPostedToday,
  windowClosesAt,
}: FeedPageClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(!hasPostedToday)

  const handleMomentSubmit = async (data: { content?: string; mediaUrl?: string }) => {
    await postMoment({
      content: data.content,
      mediaUrl: data.mediaUrl,
      ephemeral: true,
    })
    router.refresh()
    setIsModalOpen(false)
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <header className="px-5 pt-8 pb-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Moments du jour
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Des instants vrais, partagés avec tes proches. Les moments éphémères disparaissent après 24h.
        </p>
      </header>
      <div className="flex flex-col gap-5 px-5">
        <MomentComposer />
        <FeedList items={items} />
      </div>
      <MomentNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleMomentSubmit}
        windowClosesAt={new Date(windowClosesAt)}
      />
      <BottomNav />
    </main>
  )
}

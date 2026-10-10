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
  windowClosesAt,
}: FeedPageClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('Tout')
  const filters = ['Tout', 'Daily', 'Emploi', 'À vendre']
  const filteredItems = activeFilter === 'Tout' ? items : items.filter((item) => activeFilter === 'Daily' ? item.feedType === 'daily' || item.feedType === 'status' || item.feedType === 'moment' : activeFilter === 'Emploi' ? item.feedType === 'job' : item.feedType === 'À vendre' ? item.feedType === 'sale' : item.feedType === 'offer')

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
      <div className="h-1 w-full bg-gradient-to-r from-jade via-cobalt to-ruby" aria-hidden="true" />
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Stories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Un fil pour les offres, les ventes et les vrais moments.</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Types de publications">
          {filters.map((filter) => <button key={filter} type="button" onClick={() => setActiveFilter(filter)} aria-pressed={activeFilter === filter} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${activeFilter === filter ? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground'}`}>{filter}</button>)}
        </div>
      </header>
      <div className="flex flex-col gap-5 px-5">
        <MomentComposer />
        <FeedList items={filteredItems} />
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

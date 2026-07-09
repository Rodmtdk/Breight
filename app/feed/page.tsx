import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getFeed } from '@/app/actions/feed'
import { getMomentPostWindow } from '@/app/actions/moment-window'
import { BottomNav } from '@/components/bottom-nav'
import { MomentComposer } from '@/components/feed/moment-composer'
import { FeedList } from '@/components/feed/feed-list'
import { FeedPageClient } from '@/components/feed/feed-page-client'

export default async function FeedPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const items = await getFeed()
  const window = await getMomentPostWindow()

  return (
    <FeedPageClient
      items={items}
      hasPostedToday={window.hasPostedToday}
      windowClosesAt={window.postWindowClosesAt}
    />
  )
}

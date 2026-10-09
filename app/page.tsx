import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getMyProfile } from '@/app/actions/profile'
import { getFeed } from '@/app/actions/feed'
import { getUnreadNotificationCount } from '@/app/actions/social'
import { CameraHome } from '@/components/home/camera-home'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/welcome')

  const profile = await getMyProfile()
  if (!profile) redirect('/profile?setup=1')

  const [feed, unreadCount] = await Promise.all([getFeed(), getUnreadNotificationCount()])
  const seen = new Set<string>()
  const stories = feed
    .filter((item) => !item.isMine && item.authorName && !seen.has(item.authorName) && seen.add(item.authorName))
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      name: item.authorName.split(' ')[0],
      avatarUrl: item.authorAvatar,
      href: '/feed',
    }))

  return (
    <CameraHome
      name={profile.displayName.split(' ')[0]}
      stories={stories}
      unreadCount={unreadCount}
    />
  )
}

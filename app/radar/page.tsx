import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getFeed } from '@/app/actions/feed'
import { RadarPage } from './radar-page-client'

export default async function RadarRoute() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const items = (await getFeed()).filter((item) => ['job', 'sale', 'offer'].includes(item.feedType))
  return <RadarPage items={items} />
}

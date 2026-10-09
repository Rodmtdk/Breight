import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getSharedLocations } from '@/app/actions/feed'
import { NavaApp } from '@/components/nava/nava-app'

export default async function MapPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const data = await getSharedLocations()
  const friends = data.others
    .filter((friend) => Number.isFinite(friend.latitude) && Number.isFinite(friend.longitude))
    .map((friend) => ({
      id: friend.displayName,
      name: friend.displayName,
      lat: friend.latitude,
      lng: friend.longitude,
    }))

  return <NavaApp friends={friends} />
}

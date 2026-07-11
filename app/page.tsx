import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getMyProfile } from '@/app/actions/profile'
import { HomeClient } from '@/components/home/home-client'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/welcome')

  const profile = await getMyProfile()
  if (!profile) redirect('/profile?setup=1')

  return <HomeClient profile={profile} />
}

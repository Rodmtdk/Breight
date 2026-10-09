import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function getNavaActor() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) {
    return {
      id: session.user.id,
      name: session.user.name?.split(' ')[0] || 'Moi',
    }
  }
  return { id: 'guest', name: 'Invité' }
}

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getMyProfile } from '@/app/actions/profile'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const profile = await getMyProfile()
  // If profile already complete (has bio + interests), skip to dashboard
  if (profile?.bio && (profile.interests?.length ?? 0) > 0) redirect('/')

  return <OnboardingFlow userName={session.user.name ?? ''} />
}

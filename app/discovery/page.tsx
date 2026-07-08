import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDiscoveryProfiles } from "@/app/actions/discovery"
import { BottomNav } from "@/components/bottom-nav"
import { DiscoveryDeck } from "@/components/discovery/discovery-deck"
import { DiscoveryHeader } from "@/components/discovery/discovery-header"

export default async function DiscoveryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const initialProfiles = await getDiscoveryProfiles(10)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <DiscoveryHeader />
      <DiscoveryDeck initialProfiles={initialProfiles} />
      <BottomNav />
    </main>
  )
}

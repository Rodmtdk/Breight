import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDiscoveryProfiles } from "@/app/actions/discovery"
import { BottomNav } from "@/components/bottom-nav"
import { DiscoveryDeck } from "@/components/discovery/discovery-deck"

export default async function DiscoveryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const initialProfiles = await getDiscoveryProfiles(10)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">D&eacute;couvrir</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Rencontre des personnes qui partagent tes int&eacute;r&ecirc;ts.
        </p>
      </header>
      <DiscoveryDeck initialProfiles={initialProfiles} />
      <BottomNav />
    </main>
  )
}

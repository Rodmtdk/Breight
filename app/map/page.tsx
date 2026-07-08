import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getSharedLocations } from "@/app/actions/feed"
import { BottomNav } from "@/components/bottom-nav"
import { LocationPanel } from "@/components/map/location-panel"

export default async function MapPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const data = await getSharedLocations()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Carte</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Partage ta position uniquement avec tes connexions, quand tu le d&eacute;cides.
        </p>
      </header>
      <div className="flex flex-col gap-5 px-5">
        <LocationPanel initialMine={data.mine} others={data.others} />
      </div>
      <BottomNav />
    </main>
  )
}

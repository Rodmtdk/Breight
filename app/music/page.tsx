import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getSharedMusic } from "@/app/actions/feed"
import { BottomNav } from "@/components/bottom-nav"
import { MusicSharer } from "@/components/music/music-sharer"
import { MusicList } from "@/components/music/music-list"

export default async function MusicPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const shares = await getSharedMusic()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Musique</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Partage les morceaux qui te font vibrer avec tes proches.
        </p>
      </header>
      <div className="flex flex-col gap-5 px-5">
        <MusicSharer />
        <MusicList shares={shares} />
      </div>
      <BottomNav />
    </main>
  )
}

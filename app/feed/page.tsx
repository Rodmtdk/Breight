import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getFeed } from "@/app/actions/feed"
import { BottomNav } from "@/components/bottom-nav"
import { MomentComposer } from "@/components/feed/moment-composer"
import { FeedList } from "@/components/feed/feed-list"

export default async function FeedPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const items = await getFeed()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Moments</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Des instants vrais, partag&eacute;s avec tes proches. Les moments &eacute;ph&eacute;m&egrave;res disparaissent apr&egrave;s 24h.
        </p>
      </header>
      <div className="flex flex-col gap-5 px-5">
        <MomentComposer />
        <FeedList items={items} />
      </div>
      <BottomNav />
    </main>
  )
}

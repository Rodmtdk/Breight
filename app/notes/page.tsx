import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getMyConnections } from "@/app/actions/discovery"
import { BottomNav } from "@/components/bottom-nav"
import { NotesBoard } from "@/components/notes/notes-board"

export default async function NotesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const connections = await getMyConnections()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Notes</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Des petits mots pingl&eacute;s, comme un post-it sur le frigo.
        </p>
      </header>
      <div className="px-5">
        <NotesBoard connections={connections} />
      </div>
      <BottomNav />
    </main>
  )
}

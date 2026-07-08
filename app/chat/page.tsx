import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getMyConversations } from "@/app/actions/chat"
import { BottomNav } from "@/components/bottom-nav"
import { ChatList } from "@/components/chat/chat-list"

export default async function ChatPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const conversations = await getMyConversations()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Messages</h1>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          E2E chiffr&eacute;
        </span>
      </header>
      <ChatList conversations={conversations} currentUserId={session.user.id} />
      <BottomNav />
    </main>
  )
}

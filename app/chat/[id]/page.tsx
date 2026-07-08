import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ChatWindow } from "@/components/chat/chat-window"

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  const { id } = await params

  return <ChatWindow conversationId={id} />
}

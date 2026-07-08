"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Lock, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getConversationInfo, getMessages, sendEncryptedMessage } from "@/app/actions/chat"
import { decryptMessage, encryptMessage } from "@/lib/crypto"
import { triggerSensory } from "@/lib/sensory"
import { getPromptById } from "@/lib/prompts"
import { PromptDrawer } from "@/components/chat/prompt-drawer"

interface DecryptedMessage {
  id: string
  senderId: string
  text: string | null
  messageType: string
  promptId: string | null
  createdAt: string
}

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const [input, setInput] = useState("")
  const [promptOpen, setPromptOpen] = useState(false)
  const [activePromptId, setActivePromptId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)

  const { data: info } = useSWR(["convo-info", conversationId], () => getConversationInfo(conversationId))

  const { data: rawMessages, mutate } = useSWR(
    ["messages", conversationId],
    () => getMessages(conversationId),
    { refreshInterval: 4000 },
  )

  const [decrypted, setDecrypted] = useState<DecryptedMessage[]>([])

  useEffect(() => {
    if (!rawMessages || !info?.otherPublicKey) return
    let cancelled = false
    async function run() {
      const out: DecryptedMessage[] = []
      for (const m of rawMessages!) {
        const text = await decryptMessage(m.ciphertext, m.nonce, info!.otherPublicKey!)
        out.push({
          id: m.id,
          senderId: m.senderId,
          text,
          messageType: m.messageType,
          promptId: m.promptId,
          createdAt: m.createdAt,
        })
      }
      if (!cancelled) {
        setDecrypted(out)
        if (out.length > prevCountRef.current && prevCountRef.current > 0) {
          const last = out[out.length - 1]
          if (last.senderId !== info!.myUserId) triggerSensory("receive")
        }
        prevCountRef.current = out.length
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [rawMessages, info])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [decrypted.length])

  const activePrompt = useMemo(
    () => (activePromptId ? getPromptById(activePromptId) : null),
    [activePromptId],
  )

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !info?.otherPublicKey || sending) return
    setSending(true)
    try {
      const { ciphertext, nonce } = await encryptMessage(text, info.otherPublicKey)
      const isQuestion = text.includes("?")
      await sendEncryptedMessage({
        conversationId,
        ciphertext,
        nonce,
        messageType: activePromptId ? "prompt" : "text",
        promptId: activePromptId ?? undefined,
        isQuestion,
      })
      triggerSensory(activePromptId ? "support" : "send")
      setInput("")
      setActivePromptId(null)
      await mutate()
    } finally {
      setSending(false)
    }
  }, [input, info, sending, conversationId, activePromptId, mutate])

  const handlePickPrompt = useCallback((promptId: string, text: string) => {
    setActivePromptId(promptId)
    setInput(text)
    setPromptOpen(false)
    triggerSensory("tap")
  }, [])

  if (!info) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-md items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Chargement s&eacute;curis&eacute;&hellip;</p>
      </main>
    )
  }

  const keyMissing = !info.otherPublicKey

  return (
    <main className="mx-auto flex h-svh w-full max-w-md flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link href="/chat" aria-label="Retour aux messages" className="text-muted-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <Avatar className="size-9">
          <AvatarImage src={info.otherAvatarUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
            {info.otherDisplayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{info.otherDisplayName}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" />
            Chiffr&eacute; de bout en bout
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {keyMissing ? (
          <div className="rounded-lg bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground">
            {"Cette personne n'a pas encore ouvert BREIGHT sur son appareil. Les cl\u00e9s de chiffrement seront \u00e9chang\u00e9es \u00e0 sa premi\u00e8re connexion."}
          </div>
        ) : decrypted.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Sparkles className="size-8 text-primary" aria-hidden="true" />
            <p className="max-w-60 text-sm leading-relaxed text-muted-foreground">
              {"Commence par une vraie question. Appuie sur l'\u00e9tincelle pour un prompt guid\u00e9."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {decrypted.map((m) => {
              const mine = m.senderId === info.myUserId
              const prompt = m.promptId ? getPromptById(m.promptId) : null
              return (
                <li key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      mine
                        ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground"
                        : "max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-secondary-foreground"
                    }
                  >
                    {prompt ? (
                      <span className="mb-1 flex items-center gap-1 text-xs opacity-80">
                        <Sparkles className="size-3" aria-hidden="true" />
                        Prompt guid&eacute;
                      </span>
                    ) : null}
                    <p className="text-sm leading-relaxed">
                      {m.text ?? "Message chiffr\u00e9 (cl\u00e9 d'un autre appareil)"}
                    </p>
                    <span className="mt-1 block text-right text-[10px] opacity-70">
                      {new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {activePrompt ? (
        <div className="mx-4 mb-1 rounded-lg bg-accent px-3 py-2 text-xs leading-relaxed text-accent-foreground">
          <span className="font-medium">Prompt actif&nbsp;:</span> {activePrompt.text}
        </div>
      ) : null}

      <div className="flex items-end gap-2 border-t border-border px-4 py-3">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Ouvrir les prompts guidés"
          onClick={() => {
            setPromptOpen(true)
            triggerSensory("tap")
          }}
        >
          <Sparkles className="size-4" />
        </Button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder={keyMissing ? "En attente des cl\u00e9s..." : "\u00c9cris avec pr\u00e9sence..."}
          disabled={keyMissing}
          rows={1}
          className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          aria-label="Message"
        />
        <Button
          type="button"
          size="icon"
          aria-label="Envoyer"
          disabled={!input.trim() || keyMissing || sending}
          onClick={handleSend}
        >
          <Send className="size-4" />
        </Button>
      </div>

      <PromptDrawer open={promptOpen} onClose={() => setPromptOpen(false)} onPick={handlePickPrompt} />
    </main>
  )
}

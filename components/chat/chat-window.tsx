"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Camera, Lock, Phone, Send, Sparkles, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getConversationInfo, getMessages, sendEncryptedMessage } from "@/app/actions/chat"
import { decryptMessage, encryptMessage } from "@/lib/crypto"
import { triggerSensory } from "@/lib/sensory"
import { getPromptById } from "@/lib/prompts"
import { PromptDrawer } from "@/components/chat/prompt-drawer"
import { useCall } from "@/components/chat/call-provider"

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
  const [snapPreview, setSnapPreview] = useState<string | null>(null)
  const snapInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)
  const { startCall, busy } = useCall()

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

  const handleSnapSelected = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== "string") return
      const image = new Image()
      image.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(image.naturalWidth * scale)
        canvas.height = Math.round(image.naturalHeight * scale)
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height)
        setSnapPreview(canvas.toDataURL("image/jpeg", 0.78))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSendSnap = useCallback(async () => {
    if (!snapPreview || !info?.otherPublicKey || sending) return
    setSending(true)
    try {
      const payload = JSON.stringify({ kind: "snap", image: snapPreview })
      const { ciphertext, nonce } = await encryptMessage(payload, info.otherPublicKey)
      await sendEncryptedMessage({ conversationId, ciphertext, nonce, messageType: "snap" })
      setSnapPreview(null)
      await mutate()
    } finally {
      setSending(false)
    }
  }, [snapPreview, info, sending, conversationId, mutate])

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
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Link href="/chat" aria-label="Retour aux messages" className="text-muted-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <Link href={`/profile/${info.otherUserId}`} aria-label={`Voir le profil de ${info.otherDisplayName}`}>
          <Avatar className="size-9">
            <AvatarImage src={info.otherAvatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
              {info.otherDisplayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/profile/${info.otherUserId}`} className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{info.otherDisplayName}</span>
          <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" />
            Chiffr&eacute; de bout en bout
          </span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          aria-label={`Appeler ${info.otherDisplayName}`}
          disabled={busy}
          onClick={() => {
            triggerSensory("tap")
            startCall({
              conversationId,
              kind: "audio",
              peerName: info.otherDisplayName,
              peerAvatar: info.otherAvatarUrl,
            })
          }}
        >
          <Phone className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          aria-label={`Appel vidéo avec ${info.otherDisplayName}`}
          disabled={busy}
          onClick={() => {
            triggerSensory("tap")
            startCall({
              conversationId,
              kind: "video",
              peerName: info.otherDisplayName,
              peerAvatar: info.otherAvatarUrl,
            })
          }}
        >
          <Video className="size-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {keyMissing ? (
          <div className="rounded-lg bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground">
            {"Cette personne n'a pas encore ouvert BR8 sur son appareil. Les cl\u00e9s de chiffrement seront \u00e9chang\u00e9es \u00e0 sa premi\u00e8re connexion."}
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
                    {m.messageType === "snap" && m.text ? (() => { try { const snap = JSON.parse(m.text) as { kind?: string; image?: string }; return snap.kind === "snap" && snap.image ? <img src={snap.image} alt="Snap reçu" className="max-h-72 max-w-full rounded-xl object-cover" /> : <p className="text-sm">Snap illisible</p> } catch { return <p className="text-sm">Snap illisible</p> } })() : <p className="text-sm leading-relaxed">{m.text ?? "Message chiffré (clé d'un autre appareil)"}</p>}
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

      {snapPreview ? <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-2"><img src={snapPreview} alt="Aperçu du snap" className="size-14 rounded-xl object-cover" /><span className="flex-1 text-xs text-muted-foreground">Snap prêt à envoyer</span><Button type="button" size="sm" onClick={handleSendSnap} disabled={sending}>Envoyer</Button><Button type="button" variant="ghost" size="sm" onClick={() => setSnapPreview(null)}>Annuler</Button></div> : null}
      <div className="flex items-end gap-2 border-t border-border px-4 py-3">
        <input ref={snapInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => { handleSnapSelected(event.target.files?.[0]); event.currentTarget.value = "" }} />
        <Button type="button" variant="secondary" size="icon" aria-label="Envoyer un snap" onClick={() => snapInputRef.current?.click()} disabled={keyMissing || sending}><Camera className="size-4" /></Button>
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

"use server"

import { db } from "@/lib/db"
import {
  conversations,
  messages,
  profiles,
  empathyMetrics,
  moodEntries,
  auditLogs,
} from "@/lib/db/schema"
import { and, asc, desc, eq, or, sql } from "drizzle-orm"
import { getUserId } from "./profile"

async function assertParticipant(conversationId: string, userId: string) {
  const convo = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.userId1, userId), eq(conversations.userId2, userId)),
      ),
    )
    .limit(1)
  if (convo.length === 0) throw new Error("Unauthorized")
  return convo[0]
}

export async function getMyConversations() {
  const userId = await getUserId()
  const convos = await db
    .select()
    .from(conversations)
    .where(or(eq(conversations.userId1, userId), eq(conversations.userId2, userId)))

  const results = []
  for (const convo of convos) {
    const otherId = convo.userId1 === userId ? convo.userId2 : convo.userId1
    const prof = await db.select().from(profiles).where(eq(profiles.userId, otherId)).limit(1)
    const lastMsg = await db
      .select({ createdAt: messages.createdAt, senderId: messages.senderId })
      .from(messages)
      .where(eq(messages.conversationId, convo.id))
      .orderBy(desc(messages.createdAt))
      .limit(1)
    results.push({
      conversationId: convo.id,
      otherUserId: otherId,
      displayName: prof[0]?.displayName ?? "Utilisateur",
      avatarUrl: prof[0]?.avatarUrl ?? null,
      lastMessageAt: lastMsg[0]?.createdAt?.toISOString() ?? null,
    })
  }
  return results.sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""))
}

/**
 * Get conversation info + the other party's E2E public key (needed by the
 * client to encrypt outgoing and decrypt incoming messages).
 */
export async function getConversationInfo(conversationId: string) {
  const userId = await getUserId()
  const convo = await assertParticipant(conversationId, userId)
  const otherId = convo.userId1 === userId ? convo.userId2 : convo.userId1
  const prof = await db.select().from(profiles).where(eq(profiles.userId, otherId)).limit(1)
  return {
    conversationId,
    myUserId: userId,
    otherUserId: otherId,
    otherDisplayName: prof[0]?.displayName ?? "Utilisateur",
    otherAvatarUrl: prof[0]?.avatarUrl ?? null,
    otherPublicKey: prof[0]?.publicKey ?? null,
  }
}

export async function getMessages(conversationId: string) {
  const userId = await getUserId()
  await assertParticipant(conversationId, userId)
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(200)
  return rows.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    ciphertext: m.ciphertext,
    nonce: m.nonce,
    messageType: m.messageType,
    promptId: m.promptId,
    moodTag: m.moodTag,
    createdAt: m.createdAt.toISOString(),
  }))
}

/**
 * Store an E2E-encrypted message. The server only ever sees ciphertext.
 * Also updates today's empathy metrics for the sender.
 */
export async function sendEncryptedMessage(data: {
  conversationId: string
  ciphertext: string
  nonce: string
  messageType?: "text" | "prompt" | "mood" | "music"
  promptId?: string
  moodTag?: string
  isQuestion?: boolean
}) {
  const userId = await getUserId()
  await assertParticipant(data.conversationId, userId)

  await db.insert(messages).values({
    conversationId: data.conversationId,
    senderId: userId,
    ciphertext: data.ciphertext,
    nonce: data.nonce,
    messageType: data.messageType ?? "text",
    promptId: data.promptId ?? null,
    moodTag: data.moodTag ?? null,
  })

  // Update daily empathy metrics (metadata only — content stays encrypted)
  const isPrompt = data.messageType === "prompt"
  const isMood = data.messageType === "mood"
  await db
    .insert(empathyMetrics)
    .values({
      conversationId: data.conversationId,
      userId,
      messagesSent: 1,
      questionsAsked: data.isQuestion ? 1 : 0,
      promptsUsed: isPrompt ? 1 : 0,
      moodShares: isMood ? 1 : 0,
      connectionScore: computeScoreDelta({ isPrompt, isMood, isQuestion: !!data.isQuestion }),
    })
    .onConflictDoUpdate({
      target: [empathyMetrics.conversationId, empathyMetrics.userId, empathyMetrics.date],
      set: {
        messagesSent: sql`${empathyMetrics.messagesSent} + 1`,
        questionsAsked: sql`${empathyMetrics.questionsAsked} + ${data.isQuestion ? 1 : 0}`,
        promptsUsed: sql`${empathyMetrics.promptsUsed} + ${isPrompt ? 1 : 0}`,
        moodShares: sql`${empathyMetrics.moodShares} + ${isMood ? 1 : 0}`,
        connectionScore: sql`LEAST(${empathyMetrics.connectionScore} + ${computeScoreDelta({ isPrompt, isMood, isQuestion: !!data.isQuestion })}, 100)`,
      },
    })

  await db.insert(auditLogs).values({ userId, action: "message.send", resource: "messages" })
  return { ok: true }
}

function computeScoreDelta(opts: { isPrompt: boolean; isMood: boolean; isQuestion: boolean }) {
  let delta = 1
  if (opts.isQuestion) delta += 2
  if (opts.isPrompt) delta += 4
  if (opts.isMood) delta += 3
  return delta
}

export async function recordMood(mood: string, intensity: number, note?: string) {
  const userId = await getUserId()
  await db.insert(moodEntries).values({ userId, mood, intensity, note: note ?? null })
  await db.insert(auditLogs).values({ userId, action: "mood.record", resource: "mood_entries" })
  return { ok: true }
}

/**
 * Live daily empathy report for the current user across all conversations.
 */
export async function getTodayEmpathyReport() {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(empathyMetrics)
    .where(and(eq(empathyMetrics.userId, userId), eq(empathyMetrics.date, sql`CURRENT_DATE`)))

  const totals = rows.reduce(
    (acc, r) => ({
      messagesSent: acc.messagesSent + r.messagesSent,
      questionsAsked: acc.questionsAsked + r.questionsAsked,
      promptsUsed: acc.promptsUsed + r.promptsUsed,
      moodShares: acc.moodShares + r.moodShares,
      connectionScore: Math.max(acc.connectionScore, r.connectionScore),
    }),
    { messagesSent: 0, questionsAsked: 0, promptsUsed: 0, moodShares: 0, connectionScore: 0 },
  )

  const recentMoods = await db
    .select()
    .from(moodEntries)
    .where(eq(moodEntries.userId, userId))
    .orderBy(desc(moodEntries.createdAt))
    .limit(5)

  return {
    ...totals,
    conversationsActive: rows.length,
    recentMoods: recentMoods.map((m) => ({
      mood: m.mood,
      intensity: m.intensity,
      createdAt: m.createdAt.toISOString(),
    })),
  }
}

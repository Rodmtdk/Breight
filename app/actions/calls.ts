"use server"

import { db, pool } from "@/lib/db"
import { calls, conversations, profiles, type IceCandidateJSON } from "@/lib/db/schema"
import { and, desc, eq, inArray, sql } from "drizzle-orm"
import { getSessionUser, getUserId } from "./profile"

export type CallKind = "audio" | "video"
export type CallStatus = "ringing" | "accepted" | "declined" | "ended" | "missed"

const RING_MS = 45_000

let callsTableReady: Promise<void> | null = null
let callsUnavailableUntil = 0

function ensureCallsTable() {
  if (Date.now() < callsUnavailableUntil) {
    return Promise.reject(new Error("Call storage unavailable"))
  }
  if (!callsTableReady) {
    callsTableReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS calls (
          id text PRIMARY KEY,
          "conversationId" text NOT NULL,
          "callerId" text NOT NULL,
          "calleeId" text NOT NULL,
          kind text NOT NULL,
          status text NOT NULL DEFAULT 'ringing',
          "offerSdp" text,
          "answerSdp" text,
          "callerIce" jsonb NOT NULL DEFAULT '[]'::jsonb,
          "calleeIce" jsonb NOT NULL DEFAULT '[]'::jsonb,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now(),
          "endedAt" timestamp
        )
      `)
      await pool.query(
        `CREATE INDEX IF NOT EXISTS calls_callee_status_idx ON calls ("calleeId", status)`,
      )
      await pool.query(
        `CREATE INDEX IF NOT EXISTS calls_conversation_status_idx ON calls ("conversationId", status)`,
      )
    })().catch((error) => {
      callsTableReady = null
      callsUnavailableUntil = Date.now() + 30_000
      throw error
    })
  }
  return callsTableReady
}

function asIce(value: unknown): IceCandidateJSON[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? safeParse(value)
      : []
  return list.filter(isIce)
}

function safeParse(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function isIce(value: unknown): value is IceCandidateJSON {
  if (!value || typeof value !== "object") return false
  const candidate = (value as { candidate?: unknown }).candidate
  return typeof candidate === "string" && candidate.length > 0 && candidate.length < 2000
}

function sanitizeCandidate(value: unknown): IceCandidateJSON | null {
  if (!isIce(value)) return null
  const raw = value as IceCandidateJSON
  return {
    candidate: raw.candidate,
    sdpMid: typeof raw.sdpMid === "string" ? raw.sdpMid.slice(0, 32) : null,
    sdpMLineIndex: typeof raw.sdpMLineIndex === "number" ? raw.sdpMLineIndex : null,
  }
}

function isSdp(value: string) {
  return value.startsWith("v=0") && value.length < 60_000
}

async function loadOwnedCall(callId: string, userId: string) {
  await ensureCallsTable()
  const rows = await db.select().from(calls).where(eq(calls.id, callId)).limit(1)
  const call = rows[0]
  if (!call || (call.callerId !== userId && call.calleeId !== userId)) {
    throw new Error("Unauthorized")
  }
  return call
}

async function assertParticipant(conversationId: string, userId: string) {
  const convo = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1)

  const match = convo[0]
  if (!match || (match.userId1 !== userId && match.userId2 !== userId)) {
    throw new Error("Unauthorized")
  }
  return match
}

function serialize(call: typeof calls.$inferSelect, status: CallStatus = call.status as CallStatus) {
  return {
    id: call.id,
    conversationId: call.conversationId,
    callerId: call.callerId,
    calleeId: call.calleeId,
    kind: call.kind as CallKind,
    status,
    offerSdp: call.offerSdp,
    answerSdp: call.answerSdp,
    callerIce: asIce(call.callerIce),
    calleeIce: asIce(call.calleeIce),
    createdAt: call.createdAt.toISOString(),
  }
}

async function expireIfStale(call: typeof calls.$inferSelect) {
  if (call.status !== "ringing") return call.status as CallStatus
  if (Date.now() - call.createdAt.getTime() < RING_MS) return "ringing"
  await db
    .update(calls)
    .set({ status: "missed", endedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(calls.id, call.id), eq(calls.status, "ringing")))
  return "missed" as const
}

export async function startCall(input: {
  conversationId: string
  kind: CallKind
  offerSdp: string
}) {
  const userId = await getUserId()
  await ensureCallsTable()
  if (input.kind !== "audio" && input.kind !== "video") throw new Error("Invalid call")
  if (!isSdp(input.offerSdp)) throw new Error("Invalid offer")

  const convo = await assertParticipant(input.conversationId, userId)
  const calleeId = convo.userId1 === userId ? convo.userId2 : convo.userId1

  await db
    .update(calls)
    .set({ status: "ended", endedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(calls.conversationId, input.conversationId),
        inArray(calls.status, ["ringing", "accepted"]),
      ),
    )

  const id = crypto.randomUUID()
  await db.insert(calls).values({
    id,
    conversationId: input.conversationId,
    callerId: userId,
    calleeId,
    kind: input.kind,
    status: "ringing",
    offerSdp: input.offerSdp,
    callerIce: [],
    calleeIce: [],
  })

  return { callId: id }
}

export async function getCall(callId: string) {
  const userId = await getUserId()
  const call = await loadOwnedCall(callId, userId)
  const status = await expireIfStale(call)
  return serialize(call, status)
}

export async function getIncomingCall() {
  const session = await getSessionUser()
  if (!session) return null

  try {
    await ensureCallsTable()
    const rows = await db
      .select()
      .from(calls)
      .where(and(eq(calls.calleeId, session.id), eq(calls.status, "ringing")))
      .orderBy(desc(calls.createdAt))
      .limit(1)

    const call = rows[0]
    if (!call) return null
    const status = await expireIfStale(call)
    if (status !== "ringing" || !call.offerSdp) return null

    const prof = await db.select().from(profiles).where(eq(profiles.userId, call.callerId)).limit(1)
    return {
      callId: call.id,
      conversationId: call.conversationId,
      kind: call.kind as CallKind,
      offerSdp: call.offerSdp,
      callerIce: asIce(call.callerIce),
      callerName: prof[0]?.displayName ?? "Quelqu'un",
      callerAvatar: prof[0]?.avatarUrl ?? null,
    }
  } catch (error) {
    console.error(
      "[v0] incoming call lookup failed:",
      error instanceof Error ? error.message : "unknown",
    )
    return null
  }
}

export async function acceptCall(input: { callId: string; answerSdp: string }) {
  const userId = await getUserId()
  if (!isSdp(input.answerSdp)) throw new Error("Invalid answer")
  const call = await loadOwnedCall(input.callId, userId)
  if (call.calleeId !== userId) throw new Error("Unauthorized")
  if (call.status !== "ringing") return { ok: false as const }

  await db
    .update(calls)
    .set({ status: "accepted", answerSdp: input.answerSdp, updatedAt: new Date() })
    .where(and(eq(calls.id, input.callId), eq(calls.status, "ringing")))

  return { ok: true as const }
}

export async function declineCall(callId: string) {
  const userId = await getUserId()
  const call = await loadOwnedCall(callId, userId)
  if (call.calleeId !== userId) throw new Error("Unauthorized")
  await db
    .update(calls)
    .set({ status: "declined", endedAt: new Date(), updatedAt: new Date() })
    .where(eq(calls.id, callId))
  return { ok: true }
}

export async function endCall(callId: string) {
  const userId = await getUserId()
  await loadOwnedCall(callId, userId)
  await db
    .update(calls)
    .set({ status: "ended", endedAt: new Date(), updatedAt: new Date() })
    .where(eq(calls.id, callId))
  return { ok: true }
}

export async function pushIce(input: { callId: string; candidate: IceCandidateJSON }) {
  const userId = await getUserId()
  const candidate = sanitizeCandidate(input.candidate)
  if (!candidate) return { ok: false }
  const call = await loadOwnedCall(input.callId, userId)
  if (call.status === "ended" || call.status === "declined" || call.status === "missed") {
    return { ok: false }
  }

  const column = call.callerId === userId ? '"callerIce"' : '"calleeIce"'
  await db.execute(sql`
    UPDATE calls
    SET ${sql.raw(column)} = COALESCE(${sql.raw(column)}, '[]'::jsonb) || ${JSON.stringify([candidate])}::jsonb,
        "updatedAt" = NOW()
    WHERE id = ${input.callId}
  `)
  return { ok: true }
}

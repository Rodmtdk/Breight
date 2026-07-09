"use server"

import { db } from "@/lib/db"
import { feedItems, notes, profiles, relationships, musicShares, locations, auditLogs } from "@/lib/db/schema"
import { and, desc, eq, gt, inArray, isNull, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId } from "./profile"

async function getConnectedUserIds(userId: string): Promise<string[]> {
  const rels = await db
    .select()
    .from(relationships)
    .where(
      and(
        or(eq(relationships.userId1, userId), eq(relationships.userId2, userId)),
        eq(relationships.status, "active"),
      ),
    )
  return rels.map((r) => (r.userId1 === userId ? r.userId2 : r.userId1))
}

// ---------- Feed (BeReal-style moments) ----------

export async function getFeed() {
  const userId = await getUserId()
  const connectedIds = await getConnectedUserIds(userId)
  const visibleIds = [userId, ...connectedIds]

  const rows = await db
    .select()
    .from(feedItems)
    .where(
      and(
        inArray(feedItems.userId, visibleIds),
        or(isNull(feedItems.expiresAt), gt(feedItems.expiresAt, new Date())),
      ),
    )
    .orderBy(desc(feedItems.createdAt))
    .limit(50)

  const authorIds = [...new Set(rows.map((r) => r.userId))]
  const authors =
    authorIds.length > 0
      ? await db.select().from(profiles).where(inArray(profiles.userId, authorIds))
      : []
  const authorMap = new Map(authors.map((a) => [a.userId, a]))

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    isMine: r.userId === userId,
    authorName: authorMap.get(r.userId)?.displayName ?? "Utilisateur",
    authorAvatar: authorMap.get(r.userId)?.avatarUrl ?? null,
    mediaUrl: r.mediaUrl,
    content: r.content,
    feedType: r.feedType,
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt?.toISOString() ?? null,
  }))
}

export async function postMoment(data: {
  content?: string
  mediaUrl?: string
  ephemeral?: boolean
}) {
  const userId = await getUserId()
  await db.insert(feedItems).values({
    userId,
    content: data.content ?? null,
    mediaUrl: data.mediaUrl ?? null,
    feedType: data.mediaUrl ? "moment" : "status",
    expiresAt: data.ephemeral ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
  })
  
  // Mark user as having posted today (if ephemeral/daily moment)
  if (data.ephemeral) {
    const { markMomentPosted } = await import("./moment-window")
    await markMomentPosted()
  }
  
  await db.insert(auditLogs).values({ userId, action: "feed.post", resource: "feed_items" })
  revalidatePath("/feed")
  return { ok: true }
}

export async function deleteMoment(id: string) {
  const userId = await getUserId()
  await db.delete(feedItems).where(and(eq(feedItems.id, id), eq(feedItems.userId, userId)))
  revalidatePath("/feed")
}

// ---------- Notes (Locket-style) ----------

export async function getNotesForRelationship(relationshipId: string) {
  const userId = await getUserId()
  const rel = await db
    .select()
    .from(relationships)
    .where(
      and(
        eq(relationships.id, relationshipId),
        or(eq(relationships.userId1, userId), eq(relationships.userId2, userId)),
      ),
    )
    .limit(1)
  if (rel.length === 0) throw new Error("Unauthorized")

  const rows = await db
    .select()
    .from(notes)
    .where(eq(notes.relationshipId, relationshipId))
    .orderBy(desc(notes.pinnedAt))
    .limit(50)

  return rows.map((n) => ({
    id: n.id,
    userId: n.userId,
    isMine: n.userId === userId,
    content: n.content,
    imageUrl: n.imageUrl,
    color: n.color,
    pinnedAt: n.pinnedAt.toISOString(),
  }))
}

export async function pinNote(data: {
  relationshipId: string
  content?: string
  imageUrl?: string
  color?: string
}) {
  const userId = await getUserId()
  const rel = await db
    .select()
    .from(relationships)
    .where(
      and(
        eq(relationships.id, data.relationshipId),
        or(eq(relationships.userId1, userId), eq(relationships.userId2, userId)),
      ),
    )
    .limit(1)
  if (rel.length === 0) throw new Error("Unauthorized")

  await db.insert(notes).values({
    userId,
    relationshipId: data.relationshipId,
    content: data.content ?? null,
    imageUrl: data.imageUrl ?? null,
    color: data.color ?? "default",
  })
  await db.insert(auditLogs).values({ userId, action: "note.pin", resource: "notes" })
  revalidatePath("/notes")
  return { ok: true }
}

export async function deleteNote(id: string) {
  const userId = await getUserId()
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
  revalidatePath("/notes")
}

// ---------- Music shares ----------

export async function shareMusic(data: {
  youtubeVideoId: string
  title: string
  artist?: string
  message?: string
}) {
  const userId = await getUserId()
  await db.insert(musicShares).values({
    userId,
    youtubeVideoId: data.youtubeVideoId,
    title: data.title,
    artist: data.artist ?? null,
    message: data.message ?? null,
  })
  await db.insert(auditLogs).values({ userId, action: "music.share", resource: "music_shares" })
  revalidatePath("/music")
  return { ok: true }
}

export async function getSharedMusic() {
  const userId = await getUserId()
  const connectedIds = await getConnectedUserIds(userId)
  const visibleIds = [userId, ...connectedIds]

  const rows = await db
    .select()
    .from(musicShares)
    .where(inArray(musicShares.userId, visibleIds))
    .orderBy(desc(musicShares.sharedAt))
    .limit(50)

  const authorIds = [...new Set(rows.map((r) => r.userId))]
  const authors =
    authorIds.length > 0
      ? await db.select().from(profiles).where(inArray(profiles.userId, authorIds))
      : []
  const authorMap = new Map(authors.map((a) => [a.userId, a]))

  return rows.map((r) => ({
    id: r.id,
    isMine: r.userId === userId,
    authorName: authorMap.get(r.userId)?.displayName ?? "Utilisateur",
    youtubeVideoId: r.youtubeVideoId,
    title: r.title,
    artist: r.artist,
    message: r.message,
    sharedAt: r.sharedAt.toISOString(),
  }))
}

// ---------- Locations (prototype mode) ----------

export async function updateMyLocation(data: {
  latitude: number
  longitude: number
  label?: string
  isSharing: boolean
}) {
  const userId = await getUserId()
  const existing = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1)
  if (existing.length > 0) {
    await db
      .update(locations)
      .set({
        latitude: data.latitude,
        longitude: data.longitude,
        label: data.label ?? null,
        isSharing: data.isSharing,
        updatedAt: new Date(),
      })
      .where(eq(locations.userId, userId))
  } else {
    await db.insert(locations).values({
      userId,
      latitude: data.latitude,
      longitude: data.longitude,
      label: data.label ?? null,
      isSharing: data.isSharing,
    })
  }
  revalidatePath("/map")
  return { ok: true }
}

export async function getSharedLocations() {
  const userId = await getUserId()
  const connectedIds = await getConnectedUserIds(userId)

  const mine = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1)

  const others =
    connectedIds.length > 0
      ? await db
          .select()
          .from(locations)
          .where(and(inArray(locations.userId, connectedIds), eq(locations.isSharing, true)))
      : []

  const authorIds = others.map((o) => o.userId)
  const authors =
    authorIds.length > 0
      ? await db.select().from(profiles).where(inArray(profiles.userId, authorIds))
      : []
  const authorMap = new Map(authors.map((a) => [a.userId, a]))

  return {
    mine: mine[0]
      ? {
          latitude: mine[0].latitude,
          longitude: mine[0].longitude,
          label: mine[0].label,
          isSharing: mine[0].isSharing,
        }
      : null,
    others: others.map((o) => ({
      displayName: authorMap.get(o.userId)?.displayName ?? "Utilisateur",
      latitude: o.latitude,
      longitude: o.longitude,
      label: o.label,
      updatedAt: o.updatedAt.toISOString(),
    })),
  }
}

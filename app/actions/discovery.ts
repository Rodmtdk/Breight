"use server"

import { db } from "@/lib/db"
import {
  profiles,
  swipes,
  matches,
  relationships,
  conversations,
  auditLogs,
} from "@/lib/db/schema"
import { and, eq, ne, notInArray, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId } from "./profile"

/**
 * Fetch discoverable profiles the current user has not swiped yet.
 * Weighted client-side by shared interests.
 */
export async function getDiscoveryProfiles(limit = 10) {
  const userId = await getUserId()

  const mySwipes = await db
    .select({ userIdTo: swipes.userIdTo })
    .from(swipes)
    .where(eq(swipes.userIdFrom, userId))
  const swipedIds = mySwipes.map((s) => s.userIdTo)

  const conditions = [eq(profiles.isDiscoverable, true), ne(profiles.userId, userId)]
  if (swipedIds.length > 0) {
    conditions.push(notInArray(profiles.userId, swipedIds))
  }

  const candidates = await db
    .select()
    .from(profiles)
    .where(and(...conditions))
    .limit(limit)

  const me = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  const myInterests = new Set(me[0]?.interests ?? [])

  return candidates
    .map((p) => {
      const shared = (p.interests ?? []).filter((i) => myInterests.has(i))
      return {
        userId: p.userId,
        displayName: p.displayName,
        bio: p.bio,
        avatarUrl: p.avatarUrl,
        age: p.age,
        location: p.location,
        interests: p.interests ?? [],
        sharedInterests: shared,
        matchPercent:
          myInterests.size > 0
            ? Math.round((shared.length / Math.max(myInterests.size, 1)) * 100)
            : 0,
      }
    })
    .sort((a, b) => b.matchPercent - a.matchPercent)
}

/**
 * Record a swipe. If mutual like → create a match + relationship + conversation.
 * Returns { matched } so the UI can celebrate with the sensory match event.
 */
export async function swipe(targetUserId: string, action: "like" | "pass") {
  const userId = await getUserId()
  if (targetUserId === userId) throw new Error("Invalid target")

  await db
    .insert(swipes)
    .values({ userIdFrom: userId, userIdTo: targetUserId, action })
    .onConflictDoNothing()

  await db.insert(auditLogs).values({ userId, action: `discovery.swipe.${action}`, resource: "swipes" })

  if (action === "pass") return { matched: false }

  // Check for mutual like
  const reverse = await db
    .select()
    .from(swipes)
    .where(and(eq(swipes.userIdFrom, targetUserId), eq(swipes.userIdTo, userId), eq(swipes.action, "like")))
    .limit(1)

  if (reverse.length === 0) return { matched: false }

  // Canonical ordering so unique constraint holds
  const [u1, u2] = [userId, targetUserId].sort()

  const rel = await db
    .insert(relationships)
    .values({ userId1: u1, userId2: u2, relationshipType: "matched", status: "active" })
    .onConflictDoNothing()
    .returning()

  const relationshipId =
    rel[0]?.id ??
    (
      await db
        .select()
        .from(relationships)
        .where(and(eq(relationships.userId1, u1), eq(relationships.userId2, u2)))
        .limit(1)
    )[0]?.id

  await db
    .insert(matches)
    .values({ userId1: u1, userId2: u2, relationshipId })
    .onConflictDoNothing()

  await db
    .insert(conversations)
    .values({ userId1: u1, userId2: u2, relationshipId })
    .onConflictDoNothing()

  await db.insert(auditLogs).values({ userId, action: "discovery.match", resource: "matches" })

  revalidatePath("/chat")
  return { matched: true }
}

/**
 * Invite a friend or partner directly by email (couple mode).
 */
export async function inviteByEmail(email: string, type: "couple" | "friend") {
  const userId = await getUserId()
  const { user } = await import("@/lib/db/schema")
  const target = await db.select().from(user).where(eq(user.email, email.toLowerCase().trim())).limit(1)
  if (target.length === 0) return { ok: false, error: "Aucun utilisateur avec cet email." }
  if (target[0].id === userId) return { ok: false, error: "Tu ne peux pas t'inviter toi-même." }

  const [u1, u2] = [userId, target[0].id].sort()
  const existing = await db
    .select()
    .from(relationships)
    .where(and(eq(relationships.userId1, u1), eq(relationships.userId2, u2)))
    .limit(1)
  if (existing.length > 0) return { ok: false, error: "Vous êtes déjà connectés." }

  const rel = await db
    .insert(relationships)
    .values({ userId1: u1, userId2: u2, relationshipType: type, status: "active" })
    .returning()

  await db
    .insert(conversations)
    .values({ userId1: u1, userId2: u2, relationshipId: rel[0].id })
    .onConflictDoNothing()

  await db.insert(auditLogs).values({ userId, action: "relationship.invite", resource: "relationships" })
  revalidatePath("/chat")
  return { ok: true }
}

export async function getMyConnections() {
  const userId = await getUserId()
  const rels = await db
    .select()
    .from(relationships)
    .where(
      and(
        or(eq(relationships.userId1, userId), eq(relationships.userId2, userId)),
        eq(relationships.status, "active"),
      ),
    )

  const results = []
  for (const rel of rels) {
    const otherId = rel.userId1 === userId ? rel.userId2 : rel.userId1
    const prof = await db.select().from(profiles).where(eq(profiles.userId, otherId)).limit(1)
    results.push({
      relationshipId: rel.id,
      relationshipType: rel.relationshipType,
      userId: otherId,
      displayName: prof[0]?.displayName ?? "Utilisateur",
      avatarUrl: prof[0]?.avatarUrl ?? null,
      bio: prof[0]?.bio ?? null,
    })
  }
  return results
}

'use server'

import { db } from '@/lib/db'
import { 
  reactions, 
  echoComments, 
  follows, 
  socialNotifications, 
  trending 
} from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Not authenticated')
  return session.user.id
}

// ---- REACTIONS (Likes) ----

export async function toggleReaction(echoId: string, emoji: string = 'heart') {
  const userId = await getUserId()
  
  const existing = await db
    .select()
    .from(reactions)
    .where(and(eq(reactions.userId, userId), eq(reactions.echoId, echoId)))
    .limit(1)

  if (existing.length > 0) {
    // Unlike
    await db
      .delete(reactions)
      .where(and(eq(reactions.userId, userId), eq(reactions.echoId, echoId)))
  } else {
    // Like
    await db.insert(reactions).values({ userId, echoId, emoji })
    
    // Create notification for echo owner
    // TODO: Fetch echoOwnerId from echoes table and create notification
  }

  revalidatePath('/feed')
  return { ok: true }
}

export async function getReactionCount(echoId: string) {
  const count = await db
    .select({ count: sql`count(*)` })
    .from(reactions)
    .where(eq(reactions.echoId, echoId))
  
  return Number(count[0]?.count || 0)
}

export async function getUserReaction(echoId: string) {
  const userId = await getUserId()
  
  const reaction = await db
    .select()
    .from(reactions)
    .where(and(eq(reactions.userId, userId), eq(reactions.echoId, echoId)))
    .limit(1)

  return reaction[0]?.emoji || null
}

// ---- COMMENTS ----

export async function addComment(echoId: string, content: string) {
  const userId = await getUserId()
  
  const comment = await db
    .insert(echoComments)
    .values({ echoId, userId, content })
    .returning()

  // Create notification for echo owner
  // TODO: Create notification

  revalidatePath('/feed')
  return comment[0]
}

export async function getEchoComments(echoId: string) {
  const comments = await db
    .select()
    .from(echoComments)
    .where(eq(echoComments.echoId, echoId))
    .orderBy(desc(echoComments.createdAt))

  return comments
}

// ---- FOLLOWS ----

export async function toggleFollow(userId: string) {
  const currentUserId = await getUserId()
  
  if (currentUserId === userId) throw new Error('Cannot follow yourself')

  const existing = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, userId)))
    .limit(1)

  if (existing.length > 0) {
    // Unfollow
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, userId)))
  } else {
    // Follow
    await db.insert(follows).values({ followerId: currentUserId, followingId: userId })
    
    // Create follow notification
    await db.insert(socialNotifications).values({
      userId,
      actionUserId: currentUserId,
      type: 'follow',
      targetId: userId,
    })
  }

  revalidatePath('/discover')
  return { ok: true }
}

export async function isFollowing(userId: string) {
  const currentUserId = await getUserId()
  
  const follow = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, userId)))
    .limit(1)

  return follow.length > 0
}

export async function getFollowerCount(userId: string) {
  const count = await db
    .select({ count: sql`count(*)` })
    .from(follows)
    .where(eq(follows.followingId, userId))
  
  return Number(count[0]?.count || 0)
}

// ---- TRENDING ----

export async function getTrending(period: 'today' | 'week' | 'all' = 'today', limit: number = 10) {
  const trendingEchoes = await db
    .select()
    .from(trending)
    .where(eq(trending.period, period))
    .orderBy(desc(trending.score))
    .limit(limit)

  return trendingEchoes
}

// ---- NOTIFICATIONS ----

export async function getNotifications(limit: number = 20) {
  const userId = await getUserId()
  
  const notifs = await db
    .select()
    .from(socialNotifications)
    .where(eq(socialNotifications.userId, userId))
    .orderBy(desc(socialNotifications.createdAt))
    .limit(limit)

  return notifs
}

export async function getUnreadNotificationCount() {
  const userId = await getUserId()
  
  const count = await db
    .select({ count: sql`count(*)` })
    .from(socialNotifications)
    .where(and(eq(socialNotifications.userId, userId), eq(socialNotifications.read, false)))
  
  return Number(count[0]?.count || 0)
}

export async function markNotificationsAsRead(notificationIds: string[]) {
  if (notificationIds.length === 0) return { ok: true }

  await db
    .update(socialNotifications)
    .set({ read: true })
    .where(sql`id IN (${sql.join(notificationIds, sql`, `)})`)

  return { ok: true }
}

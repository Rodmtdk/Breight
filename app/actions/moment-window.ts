'use server'

import { db } from '@/lib/db'
import { momentPostWindow } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getUserId } from './profile'

export async function getMomentPostWindow() {
  const userId = await getUserId()

  const existing = await db
    .select()
    .from(momentPostWindow)
    .where(eq(momentPostWindow.userId, userId))
    .limit(1)

  if (existing.length === 0) {
    // Create first-time window
    const now = new Date()
    const opens = getNext1212UTC()
    const closes = new Date(opens.getTime() + 24 * 60 * 60 * 1000)

    await db.insert(momentPostWindow).values({
      userId,
      postWindowOpensAt: opens,
      postWindowClosesAt: closes,
      hasPostedToday: false,
      notificationSentAt: now,
    })

    return {
      userId,
      lastPostedAt: null,
      hasPostedToday: false,
      postWindowOpensAt: opens.toISOString(),
      postWindowClosesAt: closes.toISOString(),
      timeRemaining: calculateTimeRemaining(closes),
    }
  }

  const window = existing[0]
  return {
    userId,
    lastPostedAt: window.lastPostedAt?.toISOString() ?? null,
    hasPostedToday: window.hasPostedToday,
    postWindowOpensAt: window.postWindowOpensAt.toISOString(),
    postWindowClosesAt: window.postWindowClosesAt.toISOString(),
    timeRemaining: calculateTimeRemaining(window.postWindowClosesAt),
  }
}

export async function markMomentPosted() {
  const userId = await getUserId()
  const now = new Date()

  await db
    .update(momentPostWindow)
    .set({
      hasPostedToday: true,
      lastPostedAt: now,
      updatedAt: now,
    })
    .where(eq(momentPostWindow.userId, userId))
}

function getNext1212UTC(): Date {
  const now = new Date()
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 12, 0))

  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1)
  }

  return next
}

function calculateTimeRemaining(closesAt: Date): string {
  const diff = closesAt.getTime() - Date.now()

  if (diff <= 0) return '0m'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours >= 1) return `${hours}h${minutes}m`
  return `${Math.max(1, minutes)}m`
}

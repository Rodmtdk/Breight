import { db } from "@/lib/db"
import { feedItems, momentPostWindow } from "@/lib/db/schema"
import { lt, and, eq, isNotNull } from "drizzle-orm"

/**
 * Cron endpoint — runs hourly
 * Deletes expired moments and resets post windows for users who didn't post
 * 
 * Usage: Add to Vercel cron via vercel.json
 */
export async function GET(req: Request) {
  // Verify cron secret
  const secret = req.headers.get("authorization")
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const now = new Date()

    // 1. Delete all expired moments
    const deletedMoments = await db
      .delete(feedItems)
      .where(and(isNotNull(feedItems.expiresAt), lt(feedItems.expiresAt, now)))
      .returning()

    // 2. Reset post windows that have closed and user didn't post
    const expiredWindows = await db
      .select()
      .from(momentPostWindow)
      .where(and(lt(momentPostWindow.postWindowClosesAt, now), eq(momentPostWindow.hasPostedToday, false)))

    for (const window of expiredWindows) {
      const next1212 = getNext1212UTC()
      await db
        .update(momentPostWindow)
        .set({
          postWindowOpensAt: next1212,
          postWindowClosesAt: new Date(next1212.getTime() + 24 * 60 * 60 * 1000),
          hasPostedToday: false,
          updatedAt: now,
        })
        .where(eq(momentPostWindow.userId, window.userId))
    }

    return new Response(
      JSON.stringify({
        ok: true,
        deletedMoments: deletedMoments.length,
        resetWindows: expiredWindows.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("[Cron cleanup-expired-moments]", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

/**
 * Get next 12:12 UTC time
 */
function getNext1212UTC(): Date {
  const now = new Date()
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 12, 0))

  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1)
  }

  return next
}

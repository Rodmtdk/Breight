import { db } from "@/lib/db"
import { user, momentPostWindow } from "@/lib/db/schema"
import { eq, lt, isNull } from "drizzle-orm"

/**
 * Cron endpoint — runs daily at 12:12 UTC
 * Sends notification to all users to post their moment
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
    
    // Get or create post window for all users
    const allUsers = await db.select({ id: user.id }).from(user)
    
    for (const u of allUsers) {
      // Check if user has post window entry
      const existing = await db
        .select()
        .from(momentPostWindow)
        .where(eq(momentPostWindow.userId, u.id))
        .limit(1)
      
      const windowOpens = getNext1212UTC()
      const windowCloses = new Date(windowOpens.getTime() + 24 * 60 * 60 * 1000)
      
      if (existing.length === 0) {
        // Create new post window
        await db.insert(momentPostWindow).values({
          userId: u.id,
          postWindowOpensAt: windowOpens,
          postWindowClosesAt: windowCloses,
          hasPostedToday: false,
          notificationSentAt: now,
        })
      } else {
        const window = existing[0]
        
        // Check if window has closed and reset for new day
        if (now >= window.postWindowClosesAt) {
          await db
            .update(momentPostWindow)
            .set({
              postWindowOpensAt: windowOpens,
              postWindowClosesAt: windowCloses,
              hasPostedToday: false,
              notificationSentAt: now,
              updatedAt: now,
            })
            .where(eq(momentPostWindow.userId, u.id))
        } else if (!window.notificationSentAt || 
                   (now.getTime() - window.notificationSentAt.getTime() > 60 * 60 * 1000)) {
          // Send notification if not sent in last hour
          await db
            .update(momentPostWindow)
            .set({
              notificationSentAt: now,
              updatedAt: now,
            })
            .where(eq(momentPostWindow.userId, u.id))
          
          // TODO: Send push notification via web push service
          // Example: sendPushNotification(u.id, "C'est l'heure de ton moment !")
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: allUsers.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[Cron notify-moments]", error)
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
  
  // If 12:12 has already passed today, return tomorrow's 12:12
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1)
  }
  
  return next
}

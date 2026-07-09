'use server'

import { db } from '@/lib/db'
import { echoes, messages, conversations } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getUserId } from './profile'

// Quand une réponse crée un echo — le contenu devient visible aux amis
export async function createEcho(data: {
  conversationId: string
  originalMessageId: string
  content: string
  visibility?: 'friends' | 'network' | 'public'
}) {
  const userId = await getUserId()
  
  // Verify user is in conversation
  const convo = await db.select().from(conversations).where(
    and(
      eq(conversations.id, data.conversationId),
      (db => db.or(eq(conversations.userId1, userId), eq(conversations.userId2, userId)) as any)
    )
  ).limit(1)
  
  if (!convo.length) throw new Error('Unauthorized')

  await db.insert(echoes).values({
    conversationId: data.conversationId,
    originalMessageId: data.originalMessageId,
    authorId: userId,
    content: data.content,
    visibility: data.visibility || 'friends',
  })

  return { ok: true }
}

// Récupérer tous les echoes visibles pour l'utilisateur
export async function getMyEchoes() {
  const userId = await getUserId()
  
  const userEchoes = await db.select().from(echoes)
    .where(eq(echoes.authorId, userId))
    .orderBy(desc(echoes.echoedAt))
    .limit(50)

  return userEchoes.map(e => ({
    id: e.id,
    content: e.content,
    visibility: e.visibility,
    likeCount: e.likeCount,
    createdAt: e.echoedAt.toISOString(),
  }))
}

// Liker un echo (montrer de l'appréciation)
export async function likeEcho(echoId: string) {
  await db.update(echoes)
    .set({ likeCount: (db => db.sql`${echoes.likeCount} + 1` as any) })
    .where(eq(echoes.id, echoId))
  
  return { ok: true }
}

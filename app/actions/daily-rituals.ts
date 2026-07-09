'use server'

import { db } from '@/lib/db'
import { dailyRituals } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getUserId } from './profile'

const MORNING_PROMPTS = [
  'Je vais écouter sans juger aujourd\'hui',
  'Mon intention d\'écoute : être pleinement présent',
  'Je vais poser une question qui compte vraiment',
  'Aujourd\'hui, je crée un espace sûr pour quelqu\'un',
  'Je vais honorer la vulnérabilité de mes proches',
]

const NIGHT_PROMPTS = [
  'Qui m\'a vraiment écouté aujourd\'hui ?',
  'Quand ai-je écouté le plus profondément ?',
  'Quelle conversation m\'a transformé ?',
  'Comment puis-je mieux écouter demain ?',
  'Qui avait besoin que je les écoute ?',
]

// Obtenir ou créer le rituel du jour
export async function getTodayRitual() {
  const userId = await getUserId()
  const today = new Date().toISOString().split('T')[0]

  let ritual = await db.select().from(dailyRituals)
    .where(and(
      eq(dailyRituals.userId, userId),
      eq(dailyRituals.date, sql`DATE '${today}'`)
    ))
    .limit(1)

  if (!ritual.length) {
    // Créer un nouveau rituel du jour
    const morningIntention = MORNING_PROMPTS[Math.floor(Math.random() * MORNING_PROMPTS.length)]
    
    await db.insert(dailyRituals).values({
      userId,
      date: new Date(today),
      morningIntention,
    })

    ritual = await db.select().from(dailyRituals)
      .where(and(
        eq(dailyRituals.userId, userId),
        eq(dailyRituals.date, sql`DATE '${today}'`)
      ))
      .limit(1)
  }

  return {
    morningIntention: ritual[0]?.morningIntention,
    nightReflection: ritual[0]?.nightReflection,
    morningCompletedAt: ritual[0]?.morningCompletedAt?.toISOString(),
    nightCompletedAt: ritual[0]?.nightCompletedAt?.toISOString(),
  }
}

// Compléter le rituel du matin (l'utilisateur affirme son intention)
export async function completeMorningRitual() {
  const userId = await getUserId()
  const today = new Date().toISOString().split('T')[0]

  await db.update(dailyRituals)
    .set({ morningCompletedAt: new Date() })
    .where(and(
      eq(dailyRituals.userId, userId),
      eq(dailyRituals.date, sql`DATE '${today}'`)
    ))

  return { ok: true }
}

// Compléter le rituel de la nuit (reflection personnelle)
export async function completeNightRitual(reflection: string) {
  const userId = await getUserId()
  const today = new Date().toISOString().split('T')[0]

  // Récupérer le rituel d'aujourd'hui pour obtenir une night prompt
  const ritual = await db.select().from(dailyRituals)
    .where(and(
      eq(dailyRituals.userId, userId),
      eq(dailyRituals.date, sql`DATE '${today}'`)
    ))
    .limit(1)

  if (!ritual.length) throw new Error('No ritual for today')

  const nightPrompt = NIGHT_PROMPTS[Math.floor(Math.random() * NIGHT_PROMPTS.length)]

  await db.update(dailyRituals)
    .set({
      nightReflection: reflection,
      nightCompletedAt: new Date(),
    })
    .where(and(
      eq(dailyRituals.userId, userId),
      eq(dailyRituals.date, sql`DATE '${today}'`)
    ))

  return { ok: true, tomorrowPrompt: nightPrompt }
}

// Streak de rituels complétés
export async function getRitualStreak() {
  const userId = await getUserId()
  
  const completions = await db.select().from(dailyRituals)
    .where(eq(dailyRituals.userId, userId))
    .orderBy((r) => r.date)

  // Compter les jours consécutifs avec morning ritual complété
  let streak = 0
  const today = new Date()
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = checkDate.toISOString().split('T')[0]
    const completion = completions.find(c => 
      c.date.toISOString().split('T')[0] === dateStr && c.morningCompletedAt
    )
    
    if (completion) streak++
    else if (i > 0) break
  }

  return { streak }
}

'use server'

import { db } from '@/lib/db'
import { passages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getUserId } from './profile'

const RITUAL_REQUIREMENTS = [
  { level: 0, name: 'Sprout', description: '5 conversations started', points: 50 },
  { level: 1, name: 'Listener', description: '50 deep questions asked', points: 150 },
  { level: 2, name: 'Empath', description: 'Help 3 friends through moments', points: 250 },
  { level: 3, name: 'Sage', description: 'Achieve 80+ listening score', points: 400 },
  { level: 4, name: 'Heart Listener', description: 'Master all listening styles', points: 500 },
]

// Obtenir le passage/rituel actuel de l'utilisateur
export async function getCurrentPassage() {
  const userId = await getUserId()
  
  const passages_list = await db.select().from(passages)
    .where(eq(passages.userId, userId))
    .orderBy((p) => p.level)

  // Trouver le passage en cours (non complété)
  const current = passages_list.find(p => !p.ritualCompleted)
  
  if (!current) {
    // L'utilisateur a complété tous les rituels — créer le prochain niveau si possible
    const maxLevel = passages_list[passages_list.length - 1]?.level || -1
    if (maxLevel < 4) {
      const nextLevel = maxLevel + 1
      await db.insert(passages).values({
        userId,
        level: nextLevel,
        ritualCompleted: false,
      })
      return RITUAL_REQUIREMENTS[nextLevel]
    }
    return null
  }

  return {
    level: current.level,
    ...RITUAL_REQUIREMENTS[current.level],
  }
}

// Compléter un rituel (déverrouille le suivant)
export async function completeRitual(level: number) {
  const userId = await getUserId()
  
  const passage = await db.select().from(passages)
    .where(and(
      eq(passages.userId, userId),
      eq(passages.level, level)
    ))
    .limit(1)

  if (!passage.length) throw new Error('Ritual not found')
  if (passage[0].ritualCompleted) throw new Error('Ritual already completed')

  // Compléter le rituel
  await db.update(passages)
    .set({
      ritualCompleted: true,
      ritualCompletedAt: new Date(),
      badge: `${RITUAL_REQUIREMENTS[level].name.toLowerCase()}_ritual`,
    })
    .where(and(
      eq(passages.userId, userId),
      eq(passages.level, level)
    ))

  // Créer le prochain rituel
  if (level < 4) {
    await db.insert(passages).values({
      userId,
      level: level + 1,
      ritualCompleted: false,
    })
  }

  return { ok: true, nextLevel: level < 4 ? level + 1 : null }
}

// Obtenir tous les rituels complétés
export async function getCompletedRituals() {
  const userId = await getUserId()
  
  const completed = await db.select().from(passages)
    .where(and(
      eq(passages.userId, userId),
      eq(passages.ritualCompleted, true)
    ))

  return completed.map(p => ({
    level: p.level,
    name: RITUAL_REQUIREMENTS[p.level].name,
    badge: p.badge,
    completedAt: p.ritualCompletedAt?.toISOString(),
  }))
}

'use server'

import { db } from '@/lib/db'
import { weeklyReflections, empathyMetrics } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { getUserId } from './profile'

// Générer une reflection narrative poétique pour la semaine
export async function generateWeeklyReflection(weekStart: Date) {
  const userId = await getUserId()
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  // Récupérer les métriques d'écoute pour la semaine
  const metrics = await db.select().from(empathyMetrics)
    .where(and(
      eq(empathyMetrics.userId, userId),
      sql`${empathyMetrics.date} >= ${weekStart} AND ${empathyMetrics.date} < ${weekEnd}`
    ))

  const stats = metrics.reduce(
    (acc, m) => ({
      messagesSent: acc.messagesSent + m.messagesSent,
      questionsAsked: acc.questionsAsked + m.questionsAsked,
      promptsUsed: acc.promptsUsed + m.promptsUsed,
      moodShares: acc.moodShares + m.moodShares,
      listeningScore: Math.max(acc.listeningScore, m.connectionScore),
    }),
    { messagesSent: 0, questionsAsked: 0, promptsUsed: 0, moodShares: 0, listeningScore: 0 }
  )

  // Générer une narration poétique basée sur les stats
  const narrative = generatePoetticNarrative(stats)

  // Sauvegarder la reflection
  await db.insert(weeklyReflections).values({
    userId,
    weekStart: new Date(weekStart.toISOString().split('T')[0]),
    narrative,
    stats,
    listeningScore: stats.listeningScore,
  })

  return { narrative, stats }
}

// Obtenir la dernière reflection
export async function getLatestWeeklyReflection() {
  const userId = await getUserId()
  
  const reflection = await db.select().from(weeklyReflections)
    .where(eq(weeklyReflections.userId, userId))
    .orderBy(desc(weeklyReflections.weekStart))
    .limit(1)

  if (!reflection.length) return null

  return {
    narrative: reflection[0].narrative,
    stats: reflection[0].stats,
    listeningScore: reflection[0].listeningScore,
    weekStart: reflection[0].weekStart.toISOString(),
  }
}

function generatePoetticNarrative(stats: {
  messagesSent: number
  questionsAsked: number
  promptsUsed: number
  moodShares: number
  listeningScore: number
}): string {
  const parts = []

  if (stats.questionsAsked >= 50) {
    parts.push('Tu as posé ' + stats.questionsAsked + ' questions profondes cette semaine — chacune était une invitation à se connaitre davantage.')
  } else if (stats.questionsAsked >= 20) {
    parts.push('Avec ' + stats.questionsAsked + ' questions, tu as créé des espaces de curiosité.')
  } else {
    parts.push('Tu as exploré ' + stats.questionsAsked + ' domaines avec tes proches.')
  }

  if (stats.moodShares >= 10) {
    parts.push('Tu as partagé ta vulnérabilité ' + stats.moodShares + ' fois — cet acte de courage crée la confiance.')
  }

  if (stats.listeningScore >= 80) {
    parts.push('Ton score d\'écoute de ' + stats.listeningScore + ' reflète une présence exceptionnelle.')
  } else if (stats.listeningScore >= 60) {
    parts.push('Avec un score d\'écoute de ' + stats.listeningScore + ', tu construis des fondations solides.')
  }

  return parts.join(' ') || 'Cette semaine, tu as continué ton voyage d\'écoute. Chaque message, chaque question, chaque moment partagé te rapproche de ta vraie nature d\'empathie.'
}

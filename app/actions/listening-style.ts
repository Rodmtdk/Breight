'use server'

import { db } from '@/lib/db'
import { listeningStyle, profiles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getUserId } from './profile'

const STYLES = ['Patient', 'Direct', 'Empathetic', 'Curious', 'Reflective'] as const

// Initialiser le style d'écoute pour un utilisateur
export async function initializeListeningStyle() {
  const userId = await getUserId()
  
  // Déterminer le style d'écoute basé sur un quiz
  // Pour maintenant: style aléatoire
  const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)]
  
  const traits = {
    asks_follow_ups: Math.random() * 10,
    shares_emotions: Math.random() * 10,
    asks_deep_questions: Math.random() * 10,
    responds_quickly: Math.random() * 10,
    gives_advice: Math.random() * 10,
  }
  
  // Calculer la compatibilité avec d'autres styles
  const compatibility = {
    Patient: 85 + Math.random() * 15,
    Direct: 70 + Math.random() * 20,
    Empathetic: 75 + Math.random() * 25,
    Curious: 80 + Math.random() * 20,
    Reflective: 82 + Math.random() * 18,
  }

  await db.insert(listeningStyle).values({
    userId,
    style: randomStyle,
    traits,
    compatibility,
  })

  return { style: randomStyle, traits, compatibility }
}

// Obtenir son style d'écoute
export async function getMyListeningStyle() {
  const userId = await getUserId()
  const style = await db.select().from(listeningStyle)
    .where(eq(listeningStyle.userId, userId))
    .limit(1)

  if (!style.length) return null

  return {
    style: style[0].style,
    traits: style[0].traits,
    compatibility: style[0].compatibility,
  }
}

// Matcher avec quelqu'un basé sur le style d'écoute
export async function getListeningStyleMatches() {
  const userId = await getUserId()
  
  const myStyle = await db.select().from(listeningStyle)
    .where(eq(listeningStyle.userId, userId))
    .limit(1)

  if (!myStyle.length) return []

  // Récupérer d'autres profils avec styles compatibles
  const allStyles = await db.select({
    userId: listeningStyle.userId,
    style: listeningStyle.style,
    compatibility: listeningStyle.compatibility,
  }).from(listeningStyle)

  // Calculer le match score basé sur la compatibilité mutuelle
  const matches = allStyles
    .filter(s => s.userId !== userId)
    .map(s => ({
      userId: s.userId,
      theirStyle: s.style,
      myCompatibility: (myStyle[0].compatibility as any)[s.style] || 0,
      theirCompatibility: (s.compatibility as any)[myStyle[0].style] || 0,
      matchScore: ((myStyle[0].compatibility as any)[s.style] || 0 + (s.compatibility as any)[myStyle[0].style] || 0) / 2,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10)

  return matches
}

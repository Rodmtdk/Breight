import { BREIGHT, type Badge } from '@/lib/breight-brand'

// Mock implementation for listening score
// TODO: Replace with actual DB queries using Drizzle

export function getBadgeForScore(score: number): Badge {
  return BREIGHT.badges.find((b) => score >= b.min && score < b.max) || BREIGHT.badges[0]
}

export function formatListeningScore(score: number): { emoji: string; level: string; color: string } {
  const badge = getBadgeForScore(score)
  return { emoji: badge.emoji, level: badge.name, color: badge.color }
}

export function getListeningLevel(score: number): string {
  const badge = getBadgeForScore(score)
  return badge.name
}

export async function getListeningScore(userId?: string): Promise<number> {
  // TODO: Fetch from DB when listeningScore field is added to users table
  // For now, return mock score between 0-100
  return Math.floor(Math.random() * 100)
}

export async function addListeningScore(points: number, reason: string) {
  // TODO: Update DB when user earns points
  const currentScore = await getListeningScore()
  const newScore = Math.min(100, currentScore + points)

  return {
    score: newScore,
    pointsAdded: points,
    reason,
    badge: getBadgeForScore(newScore),
  }
}



// Reward points for various actions
export const SCORE_REWARDS = {
  MESSAGE_SENT: 1,
  FOLLOW_UP_QUESTION: 5,
  LONG_MESSAGE: (chars: number) => Math.min(10, Math.floor(chars / 100)),
  MOMENT_POSTED: 10,
  MOOD_CHECKIN: 2,
  CONVERSATION_MILESTONE: (messages: number) => messages >= 20 ? 15 : messages >= 10 ? 10 : 0,
} as const

// Award points when:
// - User sends message (+1)
// - User sends follow-up question (+5)
// - User writes long empathetic response (+5-10 based on length)
// - User posts daily moment (+10)
// - User checks mood (+2)
// - User has 10+ message conversation (+10-15)

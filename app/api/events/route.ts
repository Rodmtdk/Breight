import { NextResponse } from 'next/server'
import { createEvent, listActiveEvents } from '@/lib/nava/store'
import { getNavaActor } from '@/lib/nava/actor'
import { EVENT_EXPIRY_MS } from '@/lib/types'
import type { EventType } from '@/lib/types'

const EVENT_TYPES = Object.keys(EVENT_EXPIRY_MS)

export async function GET() {
  try {
    const events = await listActiveEvents()
    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: 'Signalements indisponibles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })

  const { type, lat, lng, description } = body as {
    type?: string
    lat?: number
    lng?: number
    description?: string
  }

  if (!type || !EVENT_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Type de signalement invalide' }, { status: 400 })
  }
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: 'Coordonnées invalides' }, { status: 400 })
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Coordonnées hors limites' }, { status: 400 })
  }

  const actor = await getNavaActor()
  try {
    const event = await createEvent({
      type: type as EventType,
      lat,
      lng,
      description: description?.toString().slice(0, 280) || null,
      reporterId: actor.id,
    })
    return NextResponse.json({ event }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Impossible d’envoyer le signalement' }, { status: 500 })
  }
}

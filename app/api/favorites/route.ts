import { NextResponse } from 'next/server'
import { getNavaActor } from '@/lib/nava/actor'
import { addFavorite, listFavorites } from '@/lib/nava/store'
import type { FavoriteKind } from '@/lib/types'

export async function GET() {
  const actor = await getNavaActor()
  try {
    const favorites = await listFavorites(actor.id)
    return NextResponse.json({ favorites })
  } catch {
    return NextResponse.json({ error: 'Favoris indisponibles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const { kind, label, lat, lng } = body ?? {}
  const actor = await getNavaActor()

  if (kind !== 'home' && kind !== 'work' && kind !== 'custom') {
    return NextResponse.json({ error: 'Type de favori invalide' }, { status: 400 })
  }
  if (typeof label !== 'string' || !label.trim()) {
    return NextResponse.json({ error: 'Libellé manquant' }, { status: 400 })
  }
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: 'Coordonnées invalides' }, { status: 400 })
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Coordonnées hors limites' }, { status: 400 })
  }

  try {
    const favorite = await addFavorite({
      profileId: actor.id,
      kind: kind as FavoriteKind,
      label: label.trim(),
      lat,
      lng,
    })
    return NextResponse.json({ favorite }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Impossible d’enregistrer le favori' }, { status: 500 })
  }
}

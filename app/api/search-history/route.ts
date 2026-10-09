import { NextResponse } from 'next/server'
import { getNavaActor } from '@/lib/nava/actor'
import { addSearchHistory, clearSearchHistory, listSearchHistory } from '@/lib/nava/store'

export async function GET() {
  const actor = await getNavaActor()
  try {
    const history = await listSearchHistory(actor.id)
    return NextResponse.json({ history })
  } catch {
    return NextResponse.json({ error: 'Historique indisponible' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const { label, lat, lng } = body ?? {}
  const actor = await getNavaActor()

  if (typeof label !== 'string' || !label.trim()) {
    return NextResponse.json({ error: 'Libellé manquant' }, { status: 400 })
  }
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: 'Coordonnées invalides' }, { status: 400 })
  }

  try {
    const entry = await addSearchHistory({ profileId: actor.id, label: label.trim(), lat, lng })
    return NextResponse.json({ entry }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Impossible d’enregistrer la recherche' }, { status: 500 })
  }
}

export async function DELETE() {
  const actor = await getNavaActor()
  try {
    await clearSearchHistory(actor.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Impossible d’effacer l’historique' }, { status: 500 })
  }
}

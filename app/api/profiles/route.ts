import { NextResponse } from 'next/server'
import { getNavaActor } from '@/lib/nava/actor'
import { upsertNavaProfile } from '@/lib/nava/store'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const actor = await getNavaActor()
  const displayName =
    typeof body?.displayName === 'string' && body.displayName.trim()
      ? body.displayName.trim().slice(0, 60)
      : actor.name

  try {
    const profile = await upsertNavaProfile(actor.id, displayName)
    return NextResponse.json({ profile }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Profil indisponible' }, { status: 500 })
  }
}

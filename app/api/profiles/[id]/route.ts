import { NextResponse } from 'next/server'
import { getNavaActor } from '@/lib/nava/actor'
import { getNavaProfile } from '@/lib/nava/store'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await getNavaActor()
  if (id !== actor.id) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  try {
    const profile = await getNavaProfile(id)
    if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Profil indisponible' }, { status: 500 })
  }
}

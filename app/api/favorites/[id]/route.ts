import { NextResponse } from 'next/server'
import { getNavaActor } from '@/lib/nava/actor'
import { removeFavorite } from '@/lib/nava/store'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await getNavaActor()
  try {
    await removeFavorite(id, actor.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Impossible de supprimer le favori' }, { status: 500 })
  }
}

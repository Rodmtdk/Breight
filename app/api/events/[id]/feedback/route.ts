import { NextResponse } from 'next/server'
import { applyEventFeedback } from '@/lib/nava/store'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const action = body?.action as string | undefined

  if (action !== 'confirm' && action !== 'reject') {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  try {
    await applyEventFeedback(id, action)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Impossible d’enregistrer votre retour' }, { status: 500 })
  }
}

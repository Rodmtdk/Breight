import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'L’avatar véhicule n’est pas disponible ici.' }, { status: 501 })
}

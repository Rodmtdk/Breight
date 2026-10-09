import { NextResponse } from 'next/server'
import type { GeocodeResult } from '@/lib/types'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] satisfies GeocodeResult[] })
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '6')
  url.searchParams.set('addressdetails', '0')

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Breight/1.0 (navigation; contact: support@breight.app)' },
      signal: AbortSignal.timeout(6000),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Recherche indisponible' }, { status: 502 })
    }

    const data = (await response.json()) as Array<{ display_name: string; lat: string; lon: string }>
    const results: GeocodeResult[] = data.map((item) => ({
      label: item.display_name,
      lat: Number.parseFloat(item.lat),
      lng: Number.parseFloat(item.lon),
    }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'Recherche indisponible' }, { status: 502 })
  }
}

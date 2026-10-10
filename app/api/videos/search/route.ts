import { NextResponse } from "next/server"

const INSTANCES = ["https://inv.nadeko.net", "https://invidious.nerdvpn.de", "https://yewtu.be"]

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim()
  if (!query) return NextResponse.json({ items: [] })
  for (const instance of INSTANCES) {
    try {
      const response = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&page=1`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(7000) })
      if (!response.ok) continue
      const data = await response.json()
      return NextResponse.json({ items: data.filter((item: { type?: string }) => item.type === "video").slice(0, 12) })
    } catch { continue }
  }
  return NextResponse.json({ error: "Le service vidéo est temporairement indisponible." }, { status: 503 })
}

import { NextResponse } from "next/server"

const INSTANCES = ["https://inv.nadeko.net", "https://invidious.nerdvpn.de", "https://yewtu.be"]

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")
  if (!id || !/^[\w-]{6,20}$/.test(id)) return NextResponse.json({ error: "Vidéo invalide" }, { status: 400 })
  for (const instance of INSTANCES) {
    try {
      const response = await fetch(`${instance}/api/v1/videos/${id}`, { next: { revalidate: 120 }, signal: AbortSignal.timeout(7000) })
      if (!response.ok) continue
      const data = await response.json()
      const audio = (data.adaptiveFormats ?? []).filter((format: { type?: string; url?: string }) => format.type?.startsWith("audio/") && format.url).sort((a: { bitrate?: number }, b: { bitrate?: number }) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]
      return NextResponse.json({ title: data.title, author: data.author, duration: data.lengthSeconds, videoId: data.videoId, audioUrl: audio?.url ?? null })
    } catch { continue }
  }
  return NextResponse.json({ error: "La lecture est momentanément indisponible." }, { status: 503 })
}

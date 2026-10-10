"use client"

import { useState } from "react"
import { Headphones, Loader2, Play, Search, Video } from "lucide-react"
import { Button } from "@/components/ui/button"

type VideoItem = { videoId: string; title: string; author: string; lengthSeconds?: number; videoThumbnails?: { url: string }[] }
type Player = { title: string; author: string; videoId: string; audioUrl: string | null }

export function VideoExplorer() {
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<VideoItem[]>([])
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function search() {
    if (!query.trim()) return
    setLoading(true); setError("")
    try { const response = await fetch(`/api/videos/search?q=${encodeURIComponent(query)}`); const data = await response.json(); if (!response.ok) throw new Error(data.error); setItems(data.items ?? []) } catch (cause) { setError(cause instanceof Error ? cause.message : "Recherche indisponible") } finally { setLoading(false) }
  }

  async function openVideo(item: VideoItem) {
    setLoading(true); setError("")
    try { const response = await fetch(`/api/videos/player?id=${item.videoId}`); const data = await response.json(); if (!response.ok) throw new Error(data.error); setPlayer(data) } catch (cause) { setError(cause instanceof Error ? cause.message : "Lecture indisponible") } finally { setLoading(false) }
  }

  return <section className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
    <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-cobalt/15 text-cobalt"><Video className="size-5" /></div><div><p className="font-semibold">Explorer</p><p className="text-xs text-muted-foreground">Vidéos publiques, sans compte plateforme</p></div></div>
    <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); void search() }}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une vidéo..." className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-cobalt" aria-label="Rechercher une vidéo" /><Button type="submit" size="icon" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}</Button></form>
    {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    {player && <div className="mt-4 rounded-2xl bg-secondary/60 p-3"><div className="aspect-video overflow-hidden rounded-xl bg-black"><iframe title={player.title} src={`https://www.youtube-nocookie.com/embed/${player.videoId}?rel=0`} className="size-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div><p className="mt-3 line-clamp-2 text-sm font-semibold">{player.title}</p>{player.audioUrl ? <audio controls autoPlay src={player.audioUrl} className="mt-3 w-full" aria-label={`Écouter ${player.title} en arrière-plan`} /> : <p className="mt-2 text-xs text-muted-foreground">Audio arrière-plan indisponible pour cette vidéo.</p>}</div>}
    <div className="mt-4 grid gap-2">{items.map((item) => <button key={item.videoId} type="button" onClick={() => void openVideo(item)} className="flex gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-secondary"><img src={item.videoThumbnails?.[0]?.url ?? `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} alt="" className="h-16 w-28 shrink-0 rounded-xl object-cover" /><span className="min-w-0"><span className="line-clamp-2 text-sm font-semibold">{item.title}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{item.author}</span></span><Play className="mt-2 size-4 shrink-0 text-cobalt" /></button>)}</div>
    {!items.length && !player && <div className="py-8 text-center text-sm text-muted-foreground"><Headphones className="mx-auto mb-2 size-6 opacity-60" />Recherche une vidéo pour la regarder ou l&apos;écouter écran verrouillé.</div>}
  </section>
}

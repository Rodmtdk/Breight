"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createPublicPage } from "@/app/actions/profile"

export function PublicPageEditor() {
  const [pageType, setPageType] = useState<"company" | "project">("project")
  const [form, setForm] = useState({ name: "", slug: "", tagline: "", description: "", location: "", websiteUrl: "", contactEmail: "", highlights: "" })
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const save = async () => {
    if (!form.name.trim() || !form.slug.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const page = await createPublicPage({ ...form, pageType, highlights: form.highlights.split(",").map((value) => value.trim()).filter(Boolean) })
      setSavedSlug(page.slug)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Impossible de créer la page")
    } finally {
      setSaving(false)
    }
  }

  return <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-jade">BR8 Pages</p><h2 className="mt-1 text-lg font-semibold">Créer une page publique</h2><p className="mt-1 text-sm text-muted-foreground">Présente ton activité comme un mini-site partageable.</p></div>
    <div className="grid grid-cols-2 gap-2">{([["project", "Projet"], ["company", "Entreprise"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setPageType(value)} className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${pageType === value ? "border-jade bg-jade/10 text-foreground" : "border-border text-muted-foreground"}`}>{label}</button>)}</div>
    <div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="page-name">Nom</Label><Input id="page-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="103 Diablo ou Pizzalena" /></div><div><Label htmlFor="page-slug">Adresse BR8</Label><Input id="page-slug" value={form.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="103-diablo" /></div></div>
    <div><Label htmlFor="page-tagline">Phrase d&apos;accroche</Label><Input id="page-tagline" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="La pizza qui rassemble le quartier" /></div>
    <div><Label htmlFor="page-description">Présentation</Label><Textarea id="page-description" value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Ce que tu fais, pour qui, et pourquoi..." /></div>
    <div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="page-location">Lieu</Label><Input id="page-location" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Paris, France" /></div><div><Label htmlFor="page-website">Site web</Label><Input id="page-website" value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://..." /></div></div>
    <div><Label htmlFor="page-highlights">Points forts</Label><Input id="page-highlights" value={form.highlights} onChange={(e) => update("highlights", e.target.value)} placeholder="Livraison, Fait maison, Ouvert 7j/7" /><p className="mt-1 text-xs text-muted-foreground">Sépare les points forts par des virgules.</p></div>
    {error ? <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
    <Button onClick={save} disabled={saving || !form.name.trim() || !form.slug.trim()}>{saving ? "Création..." : "Publier ma page"}</Button>
    {savedSlug ? <a href={`/p/${savedSlug}`} className="rounded-2xl bg-jade/10 px-4 py-3 text-center text-sm font-semibold text-jade">Voir ma page publique</a> : null}
  </section>
}

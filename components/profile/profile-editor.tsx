"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { upsertProfile } from "@/app/actions/profile"
import { authClient } from "@/lib/auth-client"
import { triggerSensory } from "@/lib/sensory"

const SUGGESTED_INTERESTS = [
  "Musique",
  "Sport",
  "Voyage",
  "Cuisine",
  "Gaming",
  "Lecture",
  "Cin\u00e9ma",
  "Nature",
  "Art",
  "Tech",
  "Photo",
  "Danse",
]

interface ProfileData {
  displayName: string
  bio: string
  age: number | null
  location: string
  interests: string[]
  isDiscoverable: boolean
}

export function ProfileEditor({ initial }: { initial: ProfileData }) {
  const router = useRouter()
  const [form, setForm] = useState<ProfileData>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleInterest = (interest: string) => {
    triggerSensory("tap")
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }))
  }

  const handleSave = async () => {
    if (!form.displayName.trim() || saving) return
    setSaving(true)
    setSaved(false)
    try {
      await upsertProfile({
        displayName: form.displayName.trim(),
        bio: form.bio.trim() || undefined,
        age: form.age ?? undefined,
        location: form.location.trim() || undefined,
        interests: form.interests,
        isDiscoverable: form.isDiscoverable,
      })
      triggerSensory("milestone")
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-card-foreground">Mon profil</h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">Nom affich&eacute;</Label>
        <Input
          id="displayName"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          placeholder="Ton pr\u00e9nom"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Qui es-tu, vraiment ?"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="age">&Acirc;ge</Label>
          <Input
            id="age"
            type="number"
            min={13}
            max={120}
            value={form.age ?? ""}
            onChange={(e) => setForm({ ...form, age: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="flex flex-[2] flex-col gap-1.5">
          <Label htmlFor="location">Ville</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Paris, Montr\u00e9al..."
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Int&eacute;r&ecirc;ts</Label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_INTERESTS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={
                form.interests.includes(interest)
                  ? "rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  : "rounded-full bg-secondary px-3 py-1.5 text-xs text-secondary-foreground"
              }
              aria-pressed={form.interests.includes(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-secondary-foreground">Mode d&eacute;couverte</span>
          <span className="text-xs text-muted-foreground">Appara&icirc;tre dans les suggestions</span>
        </div>
        <Switch
          checked={form.isDiscoverable}
          onCheckedChange={(v) => setForm({ ...form, isDiscoverable: v })}
          aria-label="Activer le mode d\u00e9couverte"
        />
      </div>

      <Button onClick={handleSave} disabled={saving || !form.displayName.trim()}>
        {saving ? "Enregistrement..." : saved ? "Enregistr\u00e9" : "Enregistrer"}
      </Button>

      <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground">
        Se d&eacute;connecter
      </Button>
    </section>
  )
}

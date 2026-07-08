"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateMyLocation } from "@/app/actions/feed"
import { triggerSensory } from "@/lib/sensory"

const LocationMap = dynamic(() => import("./location-map").then((m) => m.LocationMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-2xl border border-border bg-card">
      <p className="text-sm text-muted-foreground">Chargement de la carte&hellip;</p>
    </div>
  ),
})

interface MyLocation {
  latitude: number | null
  longitude: number | null
  label: string | null
  isSharing: boolean
}

interface OtherLocation {
  displayName: string
  latitude: number | null
  longitude: number | null
  label: string | null
  updatedAt: string
}

export function LocationPanel({
  initialMine,
  others,
}: {
  initialMine: MyLocation | null
  others: OtherLocation[]
}) {
  const router = useRouter()
  const [sharing, setSharing] = useState(initialMine?.isSharing ?? false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdatePosition = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("G\u00e9olocalisation non disponible"))
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      })
      await updateMyLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        isSharing: sharing,
      })
      triggerSensory("mood")
      router.refresh()
    } catch {
      setError("Impossible d'obtenir ta position. V\u00e9rifie les autorisations du navigateur.")
    } finally {
      setBusy(false)
    }
  }

  const handleToggleSharing = async (value: boolean) => {
    setSharing(value)
    if (initialMine?.latitude != null && initialMine?.longitude != null) {
      await updateMyLocation({
        latitude: initialMine.latitude,
        longitude: initialMine.longitude,
        label: initialMine.label ?? undefined,
        isSharing: value,
      })
      router.refresh()
    }
  }

  const markers = [
    ...(initialMine?.latitude != null && initialMine?.longitude != null
      ? [{ label: "Moi", latitude: initialMine.latitude, longitude: initialMine.longitude, isMe: true }]
      : []),
    ...others
      .filter((o) => o.latitude != null && o.longitude != null)
      .map((o) => ({
        label: o.displayName,
        latitude: o.latitude as number,
        longitude: o.longitude as number,
        isMe: false,
      })),
  ]

  return (
    <>
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Label htmlFor="sharing" className="text-sm font-medium">
              Partager ma position
            </Label>
            <span className="text-xs text-muted-foreground">Visible par tes connexions uniquement</span>
          </div>
          <Switch id="sharing" checked={sharing} onCheckedChange={handleToggleSharing} />
        </div>
        <Button onClick={handleUpdatePosition} disabled={busy} variant="secondary">
          <MapPin className="size-4" />
          {busy ? "Localisation..." : "Mettre à jour ma position"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </section>

      {markers.length > 0 ? (
        <LocationMap markers={markers} />
      ) : (
        <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card px-8 text-center">
          <MapPin className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Aucune position partag&eacute;e. Mets &agrave; jour ta position pour appara&icirc;tre sur la carte.
          </p>
        </div>
      )}
    </>
  )
}

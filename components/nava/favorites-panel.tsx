'use client'

import { useState } from 'react'
import { Briefcase, Home, MapPin, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FavoriteKind, FavoriteRecord, GeocodeResult, LatLng } from '@/lib/types'

interface FavoritesPanelProps {
  favorites: FavoriteRecord[]
  userPosition: LatLng
  onAddFavorite: (kind: FavoriteKind, label: string, lat: number, lng: number) => void
  onRemoveFavorite: (id: string) => void
  onSelect: (result: GeocodeResult) => void
}

function SlotButton({
  kind,
  favorite,
  userPosition,
  onAddFavorite,
  onSelect,
}: {
  kind: 'home' | 'work'
  favorite?: FavoriteRecord
  userPosition: LatLng
  onAddFavorite: FavoritesPanelProps['onAddFavorite']
  onSelect: FavoritesPanelProps['onSelect']
}) {
  const Icon = kind === 'home' ? Home : Briefcase
  const label = kind === 'home' ? 'Domicile' : 'Travail'

  if (favorite) {
    return (
      <button
        type="button"
        onClick={() => onSelect({ label: favorite.label, lat: favorite.lat, lng: favorite.lng })}
        className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold">{label}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{favorite.label}</span>
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onAddFavorite(kind, 'Position actuelle', userPosition.lat, userPosition.lng)}
      className="flex flex-1 items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 px-3 py-2.5 text-left text-muted-foreground transition-colors hover:bg-accent"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary">
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold">{label}</span>
        <span className="block text-[11px]">Définir avec ma position</span>
      </span>
    </button>
  )
}

export function FavoritesPanel({ favorites, userPosition, onAddFavorite, onRemoveFavorite, onSelect }: FavoritesPanelProps) {
  const [addingCustom, setAddingCustom] = useState(false)
  const [customLabel, setCustomLabel] = useState('')

  const home = favorites.find((favorite) => favorite.kind === 'home')
  const work = favorites.find((favorite) => favorite.kind === 'work')
  const custom = favorites.filter((favorite) => favorite.kind === 'custom')

  function handleAddCustom() {
    const label = customLabel.trim() || 'Lieu favori'
    onAddFavorite('custom', label, userPosition.lat, userPosition.lng)
    setCustomLabel('')
    setAddingCustom(false)
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">Favoris</p>
      <div className="flex gap-2">
        <SlotButton kind="home" favorite={home} userPosition={userPosition} onAddFavorite={onAddFavorite} onSelect={onSelect} />
        <SlotButton kind="work" favorite={work} userPosition={userPosition} onAddFavorite={onAddFavorite} onSelect={onSelect} />
      </div>

      {custom.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1">
          {custom.map((favorite) => (
            <li key={favorite.id} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-accent/60">
              <button
                type="button"
                onClick={() => onSelect({ label: favorite.label, lat: favorite.lat, lng: favorite.lng })}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <MapPin size={13} className="shrink-0 text-muted-foreground" />
                <span className="truncate text-xs">{favorite.label}</span>
              </button>
              <button
                type="button"
                onClick={() => onRemoveFavorite(favorite.id)}
                aria-label="Retirer ce favori"
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {addingCustom ? (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            autoFocus
            value={customLabel}
            onChange={(event) => setCustomLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleAddCustom()
              if (event.key === 'Escape') setAddingCustom(false)
            }}
            placeholder="Nom du lieu (ex. Chez mamie)"
            maxLength={60}
            className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-secondary/60 px-2 text-xs outline-none placeholder:text-muted-foreground"
          />
          <Button size="sm" className="h-8 px-2.5 text-xs" onClick={handleAddCustom}>
            Ajouter
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingCustom(true)}
          className={cn('mt-2 flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline')}
        >
          <Plus size={13} />
          Ajouter ma position comme favori
        </button>
      )}
    </div>
  )
}

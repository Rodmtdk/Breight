'use client'

import useSWR from 'swr'
import type { FavoriteKind, FavoriteRecord } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export function useFavorites(profileId: string | null) {
  const { data, mutate } = useSWR<{ favorites: FavoriteRecord[] }>(
    profileId ? `/api/favorites?profileId=${profileId}` : null,
    fetcher,
  )

  async function addFavorite(kind: FavoriteKind, label: string, lat: number, lng: number) {
    if (!profileId) return
    await fetch('/api/favorites', { method: 'POST', body: JSON.stringify({ profileId, kind, label, lat, lng }) })
    mutate()
  }

  async function removeFavorite(id: string) {
    if (!profileId) return
    await fetch(`/api/favorites/${id}?profileId=${profileId}`, { method: 'DELETE' })
    mutate()
  }

  return { favorites: data?.favorites ?? [], addFavorite, removeFavorite }
}

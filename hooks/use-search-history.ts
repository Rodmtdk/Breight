'use client'

import useSWR from 'swr'
import type { SearchHistoryRecord } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export function useSearchHistory(profileId: string | null) {
  const { data, mutate } = useSWR<{ history: SearchHistoryRecord[] }>(
    profileId ? `/api/search-history?profileId=${profileId}` : null,
    fetcher,
  )

  async function addToHistory(label: string, lat: number, lng: number) {
    if (!profileId) return
    await fetch('/api/search-history', { method: 'POST', body: JSON.stringify({ profileId, label, lat, lng }) })
    mutate()
  }

  async function clearHistory() {
    if (!profileId) return
    await fetch(`/api/search-history?profileId=${profileId}`, { method: 'DELETE' })
    mutate()
  }

  return { history: data?.history ?? [], addToHistory, clearHistory }
}

'use client'

import useSWR from 'swr'
import type { EventRecord } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

/** Active traffic reports, refreshed on a short interval. */
export function useRealtimeEvents() {
  const { data, mutate, isLoading } = useSWR<{ events: EventRecord[] }>('/api/events', fetcher, {
    refreshInterval: 12_000,
  })

  return { events: data?.events ?? [], isLoading, refresh: mutate }
}

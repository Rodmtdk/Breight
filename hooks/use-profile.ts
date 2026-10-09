'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'
import { setLocalProfileId } from '@/lib/profile-id'
import type { ProfileRecord } from '@/lib/types'

async function ensureProfile(): Promise<string> {
  const response = await fetch('/api/profiles', { method: 'POST', body: JSON.stringify({}) })
  const { profile } = await response.json()
  setLocalProfileId(profile.id)
  return profile.id
}

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export function useProfile() {
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    ensureProfile().then(setProfileId).catch(() => setProfileId(null))
  }, [])

  const { data, mutate } = useSWR<{ profile: ProfileRecord }>(profileId ? `/api/profiles/${profileId}` : null, fetcher, {
    refreshInterval: 15_000,
  })

  const profile = data?.profile ?? null
  const total = profile ? profile.confirmed_count + profile.rejected_count : 0
  const reliability = total === 0 ? 100 : Math.round((profile!.confirmed_count / total) * 100)

  return { profileId, profile, reliability, refresh: mutate }
}

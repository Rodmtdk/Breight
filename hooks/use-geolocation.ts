'use client'

import { useEffect, useRef, useState } from 'react'
import { haversineDistance } from '@/lib/geo'
import type { LatLng } from '@/lib/types'

// Paris, used as a sensible fallback center when geolocation is unavailable
// or denied by the user.
export const FALLBACK_POSITION: LatLng = { lat: 48.8566, lng: 2.3522 }

// Raw GPS fixes jitter by several meters even while stationary, which makes
// the marker visibly "dance" on screen. These constants tame that noise
// without introducing noticeable lag while actually moving:
// - A fix much less accurate than the one we already trust is likely a
//   stray reading (e.g. momentary multipath); only accept it if the
//   reported movement is large enough to plausibly be real.
// - Below STATIONARY_JITTER_M, treat the device as not having moved at all
//   — this is what kills the "stuck but jittering" dance.
// - Above that, blend toward the new fix with an exponential filter so the
//   marker still tracks real movement responsively.
const STATIONARY_JITTER_M = 4
const MAX_ACCURACY_DEGRADATION_M = 30
const SMOOTHING_ALPHA = 0.35

interface GeolocationState {
  position: LatLng
  heading: number | null
  accuracy: number | null
  /** Ground speed in meters per second, when the device reports it. */
  speed: number | null
  status: 'locating' | 'active' | 'denied' | 'unsupported'
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: FALLBACK_POSITION,
    heading: null,
    accuracy: null,
    speed: null,
    status: 'locating',
  })

  const smoothedRef = useRef<LatLng | null>(null)
  const lastAccuracyRef = useRef<number | null>(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState((previous) => ({ ...previous, status: 'unsupported' }))
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (result) => {
        const raw: LatLng = { lat: result.coords.latitude, lng: result.coords.longitude }
        const accuracy = result.coords.accuracy
        const previous = smoothedRef.current
        const previousAccuracy = lastAccuracyRef.current

        let next = raw

        if (previous) {
          const moved = haversineDistance(previous, raw)
          const accuracyWorsened = previousAccuracy != null && accuracy - previousAccuracy > MAX_ACCURACY_DEGRADATION_M

          if (accuracyWorsened && moved < accuracy) {
            // Much noisier fix than before, and the "movement" it implies
            // is within its own error margin — almost certainly just noise.
            // Keep the previous smoothed position.
            next = previous
          } else if (moved < STATIONARY_JITTER_M) {
            // Effectively stationary: ignore the jitter entirely.
            next = previous
          } else {
            // Real movement: ease toward the new fix instead of snapping,
            // so the marker glides rather than teleports.
            next = {
              lat: previous.lat + (raw.lat - previous.lat) * SMOOTHING_ALPHA,
              lng: previous.lng + (raw.lng - previous.lng) * SMOOTHING_ALPHA,
            }
          }
        }

        smoothedRef.current = next
        lastAccuracyRef.current = accuracy

        setState({
          position: next,
          heading: result.coords.heading,
          accuracy,
          speed: result.coords.speed,
          status: 'active',
        })
      },
      () => {
        setState((previous) => ({ ...previous, status: 'denied' }))
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 10_000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return state
}

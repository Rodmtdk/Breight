'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getOrCreateKeyPair } from '@/lib/crypto'
import { publishPublicKey } from '@/app/actions/profile'

/**
 * Ensures the device has an E2E keypair and that the PUBLIC key is published
 * to the server so other users can encrypt messages for this user.
 * The private key never leaves the device.
 */
export function E2EKeySync() {
  const pathname = usePathname()

  useEffect(() => {
    // Skip on public auth pages — there is no session there.
    if (pathname === '/sign-in' || pathname === '/sign-up') return

    let cancelled = false
    async function sync() {
      try {
        const kp = await getOrCreateKeyPair()
        if (!cancelled) {
          await publishPublicKey(kp.publicKey)
        }
      } catch {
        // Not signed in or crypto unavailable — silent
      }
    }
    sync()
    return () => {
      cancelled = true
    }
  }, [pathname])

  return null
}

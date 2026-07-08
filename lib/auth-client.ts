'use client'

import { createAuthClient } from 'better-auth/react'

// Use the runtime URL env var so the auth client always points to the correct
// Next.js server origin — avoids the "Invalid origin" error in the v0 preview iframe.
// NEXT_PUBLIC_V0_RUNTIME_URL is injected at build time from V0_RUNTIME_URL.
// Falls back to window.location.origin for normal (non-iframe) deployments.
function getBaseURL() {
  const url = process.env.NEXT_PUBLIC_V0_RUNTIME_URL
  if (url && url.startsWith('http')) return url
  if (typeof window !== 'undefined') return window.location.origin
  return undefined
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})

export const { signIn, signUp, signOut, useSession } = authClient

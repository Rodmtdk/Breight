'use client'

import { createAuthClient } from 'better-auth/react'

// Use the runtime URL env var so the auth client always points to the correct
// Next.js server origin — avoids the "Invalid origin" error in the v0 preview iframe.
// NEXT_PUBLIC_V0_RUNTIME_URL is injected at build time from V0_RUNTIME_URL.
// Falls back to window.location.origin in the browser.
//
// This file is a client component, but it is still *module-evaluated* on the
// server during SSR (no `window`). If we return `undefined` here, better-auth
// falls back to reading `BETTER_AUTH_URL` from the environment directly — and
// if that project variable is ever malformed (not a full URL), the module
// throws at import time and crashes the whole page. So on the server we must
// resolve a real fallback ourselves instead of returning undefined.
function getBaseURL() {
  const publicURL = process.env.NEXT_PUBLIC_V0_RUNTIME_URL
  if (publicURL && publicURL.startsWith('http')) return publicURL

  if (typeof window !== 'undefined') return window.location.origin

  // Server-side (SSR) fallback — mirrors the resolution in lib/auth.ts.
  const deploymentHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    process.env.V0_RUNTIME_URL

  if (!deploymentHost) return undefined
  return deploymentHost.startsWith('http') ? deploymentHost : `https://${deploymentHost}`
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})

export const { signIn, signUp, signOut, useSession } = authClient

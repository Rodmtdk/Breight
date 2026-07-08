'use client'

import { createAuthClient } from 'better-auth/react'

// NEXT_PUBLIC_APP_URL is set to V0_RUNTIME_URL (the actual Next.js server origin).
// Without an explicit baseURL, Better Auth uses window.location.origin which inside
// the v0 preview iframe is a *different* origin than the server — causing "Invalid origin".
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
})

export const { signIn, signUp, signOut, useSession } = authClient

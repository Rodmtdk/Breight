import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

function getAuthBaseURL() {
  const configuredURL = process.env.BETTER_AUTH_URL?.trim()
  if (configuredURL) {
    try {
      const parsedURL = new URL(configuredURL)
      if (parsedURL.protocol === 'http:' || parsedURL.protocol === 'https:') {
        return parsedURL.origin
      }
    } catch {
      // Ignore malformed project values and use the deployment URL below.
    }
  }

  const deploymentHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    process.env.V0_RUNTIME_URL

  if (!deploymentHost) return undefined
  return deploymentHost.startsWith('http') ? deploymentHost : `https://${deploymentHost}`
}

export const auth = betterAuth({
  database: pool,
  baseURL: getAuthBaseURL(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    // Local dev
    ...(process.env.NODE_ENV === 'development'
      ? ['http://localhost:3000', 'http://localhost:3001']
      : []),
    // v0 preview — the iframe and the runtime URL must both be trusted
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.V0_CALLBACK_URL ? [process.env.V0_CALLBACK_URL] : []),
    // Vercel deployment URLs
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          // In dev (v0 preview iframe), force cross-site cookies so the
          // session cookie is stored by the browser.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

function databaseUrl() {
  const configured = process.env.DATABASE_URL
  if (configured?.startsWith('postgres')) return configured
  // DATABASE_URL can be left as a stale non-URL value. The Neon integration
  // still injects a usable connection string under these names.
  return process.env.NEON_DATABASE_URL ?? process.env.NEON_POSTGRES_URL
}

export const pool = new Pool({
  connectionString: databaseUrl(),
})

export const db = drizzle(pool, { schema })

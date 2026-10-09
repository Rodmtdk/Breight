import { randomUUID } from 'node:crypto'
import { pool } from '@/lib/db'
import { EVENT_EXPIRY_MS } from '@/lib/types'
import type { EventType, FavoriteKind } from '@/lib/types'

let ready: Promise<void> | null = null

function ensureTables() {
  if (!ready) {
    ready = pool
      .query(`
        CREATE TABLE IF NOT EXISTS nava_profiles (
          id text PRIMARY KEY,
          display_name text NOT NULL,
          reports_count integer NOT NULL DEFAULT 0,
          confirmed_count integer NOT NULL DEFAULT 0,
          rejected_count integer NOT NULL DEFAULT 0,
          vehicle_icon_url text,
          vehicle_label text,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS nava_events (
          id text PRIMARY KEY,
          type text NOT NULL,
          lat double precision NOT NULL,
          lng double precision NOT NULL,
          description text,
          reporter_id text,
          confirmations integer NOT NULL DEFAULT 0,
          rejections integer NOT NULL DEFAULT 0,
          active boolean NOT NULL DEFAULT true,
          created_at timestamptz NOT NULL DEFAULT now(),
          expires_at timestamptz NOT NULL
        );
        CREATE TABLE IF NOT EXISTS nava_favorites (
          id text PRIMARY KEY,
          profile_id text NOT NULL,
          kind text NOT NULL,
          label text NOT NULL,
          lat double precision NOT NULL,
          lng double precision NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS nava_search_history (
          id text PRIMARY KEY,
          profile_id text NOT NULL,
          label text NOT NULL,
          lat double precision NOT NULL,
          lng double precision NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        );
      `)
      .then(() => undefined)
      .catch((error) => {
        ready = null
        throw error
      })
  }
  return ready
}

function rowDates<T extends { created_at?: Date | string; updated_at?: Date | string; expires_at?: Date | string }>(row: T) {
  return {
    ...row,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    expires_at: row.expires_at ? new Date(row.expires_at).toISOString() : undefined,
  }
}

export async function upsertNavaProfile(id: string, displayName: string) {
  await ensureTables()
  const result = await pool.query(
    `INSERT INTO nava_profiles (id, display_name)
     VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET updated_at = now()
     RETURNING *`,
    [id, displayName.slice(0, 60)],
  )
  return rowDates(result.rows[0])
}

export async function getNavaProfile(id: string) {
  await ensureTables()
  const result = await pool.query('SELECT * FROM nava_profiles WHERE id = $1', [id])
  return result.rows[0] ? rowDates(result.rows[0]) : null
}

export async function listActiveEvents() {
  await ensureTables()
  const result = await pool.query(
    `SELECT * FROM nava_events
     WHERE active = true AND expires_at > now()
     ORDER BY created_at DESC
     LIMIT 200`,
  )
  return result.rows.map(rowDates)
}

export async function createEvent(input: {
  type: EventType
  lat: number
  lng: number
  description: string | null
  reporterId: string | null
}) {
  await ensureTables()
  const id = randomUUID()
  const expiresAt = new Date(Date.now() + EVENT_EXPIRY_MS[input.type])
  const result = await pool.query(
    `INSERT INTO nava_events (id, type, lat, lng, description, reporter_id, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, input.type, input.lat, input.lng, input.description, input.reporterId, expiresAt],
  )
  if (input.reporterId) {
    await pool.query(
      `UPDATE nava_profiles SET reports_count = reports_count + 1, updated_at = now() WHERE id = $1`,
      [input.reporterId],
    )
  }
  return rowDates(result.rows[0])
}

export async function applyEventFeedback(eventId: string, action: 'confirm' | 'reject') {
  await ensureTables()
  const column = action === 'confirm' ? 'confirmations' : 'rejections'
  const profileColumn = action === 'confirm' ? 'confirmed_count' : 'rejected_count'
  const updated = await pool.query(
    `UPDATE nava_events
     SET ${column} = ${column} + 1
     WHERE id = $1
     RETURNING reporter_id`,
    [eventId],
  )
  const reporterId = updated.rows[0]?.reporter_id
  if (reporterId) {
    await pool.query(
      `UPDATE nava_profiles SET ${profileColumn} = ${profileColumn} + 1, updated_at = now() WHERE id = $1`,
      [reporterId],
    )
  }
}

export async function listFavorites(profileId: string) {
  await ensureTables()
  const result = await pool.query(
    `SELECT * FROM nava_favorites WHERE profile_id = $1 ORDER BY created_at DESC`,
    [profileId],
  )
  return result.rows.map(rowDates)
}

export async function addFavorite(input: {
  profileId: string
  kind: FavoriteKind
  label: string
  lat: number
  lng: number
}) {
  await ensureTables()
  if (input.kind === 'home' || input.kind === 'work') {
    await pool.query(`DELETE FROM nava_favorites WHERE profile_id = $1 AND kind = $2`, [input.profileId, input.kind])
  }
  const result = await pool.query(
    `INSERT INTO nava_favorites (id, profile_id, kind, label, lat, lng)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [randomUUID(), input.profileId, input.kind, input.label.slice(0, 200), input.lat, input.lng],
  )
  if (input.kind === 'custom') {
    await pool.query(
      `DELETE FROM nava_favorites
       WHERE id IN (
         SELECT id FROM nava_favorites
         WHERE profile_id = $1 AND kind = 'custom'
         ORDER BY created_at DESC
         OFFSET 20
       )`,
      [input.profileId],
    )
  }
  return rowDates(result.rows[0])
}

export async function removeFavorite(id: string, profileId: string) {
  await ensureTables()
  await pool.query(`DELETE FROM nava_favorites WHERE id = $1 AND profile_id = $2`, [id, profileId])
}

export async function listSearchHistory(profileId: string) {
  await ensureTables()
  const result = await pool.query(
    `SELECT * FROM nava_search_history WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 8`,
    [profileId],
  )
  return result.rows.map(rowDates)
}

export async function addSearchHistory(input: { profileId: string; label: string; lat: number; lng: number }) {
  await ensureTables()
  const label = input.label.slice(0, 200)
  await pool.query(`DELETE FROM nava_search_history WHERE profile_id = $1 AND label = $2`, [input.profileId, label])
  const result = await pool.query(
    `INSERT INTO nava_search_history (id, profile_id, label, lat, lng)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [randomUUID(), input.profileId, label, input.lat, input.lng],
  )
  await pool.query(
    `DELETE FROM nava_search_history
     WHERE id IN (
       SELECT id FROM nava_search_history
       WHERE profile_id = $1
       ORDER BY created_at DESC
       OFFSET 8
     )`,
    [input.profileId],
  )
  return rowDates(result.rows[0])
}

export async function clearSearchHistory(profileId: string) {
  await ensureTables()
  await pool.query(`DELETE FROM nava_search_history WHERE profile_id = $1`, [profileId])
}

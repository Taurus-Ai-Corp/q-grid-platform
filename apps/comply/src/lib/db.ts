/**
 * Singleton Drizzle DB client for the comply app.
 *
 * Returns null when DATABASE_URL is not set so callers can fall back
 * to in-memory stores (dev mode without Neon provisioned).
 */

import { createDb } from '@taurus/db'

let _db: ReturnType<typeof createDb> | null = null

export function getDb(): ReturnType<typeof createDb> | null {
  const url = process.env['DATABASE_URL']
  if (!url) return null
  if (!_db) {
    _db = createDb(url)
  }
  return _db
}

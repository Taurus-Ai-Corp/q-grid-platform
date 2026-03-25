import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'

export const pqcKeys = pgTable('pqc_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  publicKey: text('public_key').notNull(),
  encryptedSecretKey: text('encrypted_secret_key').notNull(),
  algorithm: text('algorithm').default('ML-DSA-65').notNull(),
  status: text('status').default('active').notNull(),
  rotatedAt: timestamp('rotated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

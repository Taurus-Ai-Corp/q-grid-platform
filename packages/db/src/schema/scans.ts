import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jurisdictionEnum } from './enums.js'
import { organizations } from './organizations.js'

export const scans = pgTable('scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  domain: text('domain').notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  qrsScore: integer('qrs_score'),
  algorithms: jsonb('algorithms'),
  certificates: jsonb('certificates'),
  recommendations: jsonb('recommendations'),
  jurisdiction: jurisdictionEnum('jurisdiction'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // PQC columns
  pqcHash: text('pqc_hash'),
  pqcSignature: text('pqc_signature'),
  hederaTxId: text('hedera_tx_id'),
})

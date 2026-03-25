import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'

export const billing = pgTable('billing', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  stripeEventId: text('stripe_event_id').unique(),
  type: text('type').notNull(),
  amountCents: integer('amount_cents'),
  currency: text('currency'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // PQC columns
  pqcHash: text('pqc_hash'),
  pqcSignature: text('pqc_signature'),
  hederaTxId: text('hedera_tx_id'),
})

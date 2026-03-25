import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jurisdictionEnum, planEnum } from './enums.js'
import { organizations } from './organizations.js'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  jurisdiction: jurisdictionEnum('jurisdiction'),
  plan: planEnum('plan'),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // PQC columns
  pqcHash: text('pqc_hash'),
  pqcSignature: text('pqc_signature'),
  hederaTxId: text('hedera_tx_id'),
})

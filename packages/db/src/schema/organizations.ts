import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jurisdictionEnum, planEnum } from './enums.js'

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  jurisdiction: jurisdictionEnum('jurisdiction').notNull(),
  plan: planEnum('plan').default('free').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  pqcPublicKey: text('pqc_public_key'),
  pqcSecretKeyEncrypted: text('pqc_secret_key_encrypted'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // PQC columns
  pqcHash: text('pqc_hash'),
  pqcSignature: text('pqc_signature'),
  hederaTxId: text('hedera_tx_id'),
})

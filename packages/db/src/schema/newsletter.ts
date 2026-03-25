import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jurisdictionEnum } from './enums.js'

export const newsletter = pgTable('newsletter', {
  id: uuid('id').primaryKey().defaultRandom(),
  emailHash: text('email_hash').unique().notNull(),
  jurisdiction: jurisdictionEnum('jurisdiction'),
  source: text('source'),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  consentTextHash: text('consent_text_hash'),
  consentPqcSignature: text('consent_pqc_signature'),
  consentHederaTxId: text('consent_hedera_tx_id'),
})

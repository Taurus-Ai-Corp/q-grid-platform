import { bigint, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const auditTrail = pgTable('audit_trail', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(),
  hederaTopicId: text('hedera_topic_id'),
  hederaTxId: text('hedera_tx_id'),
  hederaSequence: bigint('hedera_sequence', { mode: 'bigint' }),
  hash: text('hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // PQC column
  pqcSignature: text('pqc_signature'),
})

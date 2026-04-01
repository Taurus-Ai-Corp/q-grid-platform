import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { assessments } from './assessments'
import { organizations } from './organizations'

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').references(() => assessments.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  contentMarkdown: text('content_markdown'),
  aiModel: text('ai_model'),
  aiCostCents: integer('ai_cost_cents'),
  mode: text('mode').default('template'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // PQC columns
  pqcHash: text('pqc_hash'),
  pqcSignature: text('pqc_signature'),
  hederaTxId: text('hedera_tx_id'),
})

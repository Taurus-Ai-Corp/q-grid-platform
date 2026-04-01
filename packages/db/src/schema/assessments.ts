import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jurisdictionEnum } from './enums'
import { organizations } from './organizations'
import { systems } from './systems'

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  systemId: uuid('system_id').references(() => systems.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  jurisdiction: jurisdictionEnum('jurisdiction').notNull(),
  framework: text('framework').notNull(),
  status: text('status').default('draft').notNull(),
  responses: jsonb('responses'),
  qrsScore: integer('qrs_score'),
  currentSection: integer('current_section').default(0),
  riskLevel: text('risk_level'),
  recommendations: jsonb('recommendations'),
  keyFindings: jsonb('key_findings'),
  categoryScores: jsonb('category_scores'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  // PQC columns
  pqcHash: text('pqc_hash'),
  pqcSignature: text('pqc_signature'),
  hederaTxId: text('hedera_tx_id'),
})

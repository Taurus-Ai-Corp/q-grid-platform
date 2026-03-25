import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jurisdictionEnum } from './enums.js'
import { organizations } from './organizations.js'

export const systems = pgTable('systems', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  riskLevel: text('risk_level'),
  jurisdiction: jurisdictionEnum('jurisdiction').notNull(),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // PQC columns
  pqcHash: text('pqc_hash'),
  pqcSignature: text('pqc_signature'),
  hederaTxId: text('hedera_tx_id'),
})

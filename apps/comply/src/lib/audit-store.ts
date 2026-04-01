/**
 * In-memory audit event store.
 * Shared across all route handlers in a single Next.js server process.
 * Swap for Neon DB queries when DATABASE_URL is provisioned.
 */

export interface AuditEvent {
  id: string
  userId: string
  entityType: 'system' | 'assessment' | 'report' | 'organization'
  entityId: string
  action: 'created' | 'updated' | 'completed' | 'generated' | 'signed'
  details: string
  pqcHash?: string
  pqcSignature?: string
  hederaTopicId?: string
  hederaTxId?: string
  hederaStatus: 'pending' | 'anchored' | 'failed' | 'skipped'
  createdAt: string
}

// Module-level singleton — persists for the lifetime of the server process
// Key: userId, Value: array of events (newest first)
export const auditStore = new Map<string, AuditEvent[]>()

/** Return all audit events for a user (newest first). */
export function getAuditEvents(userId: string): AuditEvent[] {
  return auditStore.get(userId) ?? []
}

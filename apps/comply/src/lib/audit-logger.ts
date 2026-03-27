/**
 * Audit logger — creates PQC-signed, Hedera-anchored audit events.
 *
 * Design:
 * - PQC signing is synchronous (fast, in-process)
 * - Hedera anchoring is fire-and-forget async (never blocks the response)
 * - All failures are silently swallowed — audit logging must never crash a request
 */

import { createStamp } from '@taurus/pqc-crypto'
import { auditStore, type AuditEvent } from './audit-store'

export async function logAuditEvent(params: {
  userId: string
  entityType: AuditEvent['entityType']
  entityId: string
  action: AuditEvent['action']
  details: string
}): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    ...params,
    hederaStatus: 'skipped',
    createdAt: new Date().toISOString(),
  }

  // PQC sign the event with ML-DSA-65 if platform keys are configured
  const publicKeyHex = process.env['PLATFORM_PQC_PUBLIC_KEY']
  const secretKeyHex = process.env['PLATFORM_PQC_SECRET_KEY']

  if (publicKeyHex && secretKeyHex) {
    try {
      const pk = Uint8Array.from(Buffer.from(publicKeyHex, 'hex'))
      const sk = Uint8Array.from(Buffer.from(secretKeyHex, 'hex'))
      const stamp = createStamp(
        {
          type: 'audit',
          id: event.id,
          payload: {
            entityType: params.entityType,
            entityId: params.entityId,
            action: params.action,
          },
          jurisdiction: (process.env['JURISDICTION'] ?? 'eu') as 'eu' | 'na' | 'in' | 'ae',
        },
        sk,
        pk,
      )
      event.pqcHash = stamp.hash
      event.pqcSignature = stamp.signature
    } catch {
      // Signing failed — continue without signature (dev mode / bad keys)
    }
  }

  // Hedera HCS anchor (async, non-blocking, fire-and-forget)
  const hederaOperatorId = process.env['HEDERA_OPERATOR_ID']
  const hederaOperatorKey = process.env['HEDERA_OPERATOR_KEY']
  const hederaTopicId = process.env['HEDERA_AUDIT_TOPIC_ID']

  if (hederaOperatorId && hederaOperatorKey && hederaTopicId && event.pqcHash) {
    event.hederaStatus = 'pending'
    event.hederaTopicId = hederaTopicId
    // Fire and forget — do NOT await
    void anchorToHedera(event)
  }

  // Persist in store (newest first per user)
  const existing = auditStore.get(params.userId) ?? []
  auditStore.set(params.userId, [event, ...existing])

  return event
}

async function anchorToHedera(event: AuditEvent): Promise<void> {
  try {
    const { createHederaClient, loadHederaConfig, submitToHCS } = await import('@taurus/hedera')

    const config = loadHederaConfig()
    const client = createHederaClient(config)
    const message = JSON.stringify({
      version: '1.0',
      type: event.entityType,
      entityId: event.entityId,
      action: event.action,
      hash: event.pqcHash,
      timestamp: event.createdAt,
    })

    const result = await submitToHCS(client, event.hederaTopicId!, message)
    event.hederaTxId = result.txId
    event.hederaStatus = 'anchored'
  } catch {
    event.hederaStatus = 'failed'
  }
}

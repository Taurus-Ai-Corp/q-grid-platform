import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { assessmentsStore } from '@/lib/assessment-store'
import { scoreAssessment } from '@/lib/assessment-scorer'
import { createStamp } from '@taurus/pqc-crypto'
import { logAuditEvent } from '@/lib/audit-logger'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const assessments = assessmentsStore.get(userId) ?? []
  const idx = assessments.findIndex((a) => a.id === id)

  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const current = assessments[idx]!

  if (current.status === 'completed') {
    return NextResponse.json({ error: 'Assessment already completed' }, { status: 400 })
  }

  // Run scoring engine
  const result = scoreAssessment(current.responses)

  // PQC sign the completed assessment (if platform keys are configured)
  let pqcHash: string | undefined
  let pqcSignature: string | undefined
  let pqcPublicKey: string | undefined

  const platformPkHex = process.env['PLATFORM_PQC_PUBLIC_KEY']
  const platformSkHex = process.env['PLATFORM_PQC_SECRET_KEY']

  if (platformPkHex && platformSkHex) {
    try {
      const pk = Uint8Array.from(Buffer.from(platformPkHex, 'hex'))
      const sk = Uint8Array.from(Buffer.from(platformSkHex, 'hex'))
      const stamp = createStamp(
        {
          type: 'assessment',
          id,
          payload: {
            score: result.score,
            riskLevel: result.riskLevel,
            categoryScores: result.categoryScores,
          },
          jurisdiction: (process.env['JURISDICTION'] ?? 'eu') as 'eu' | 'na' | 'in' | 'ae',
        },
        sk,
        pk,
      )
      pqcHash = stamp.hash
      pqcSignature = stamp.signature
      pqcPublicKey = stamp.publicKey
    } catch (err) {
      console.error('[assessments/submit] PQC signing failed (dev mode):', err)
    }
  }

  const completed = {
    ...current,
    status: 'completed' as const,
    score: result.score,
    riskLevel: result.riskLevel,
    categoryScores: result.categoryScores,
    recommendations: result.recommendations,
    keyFindings: result.keyFindings,
    pqcHash,
    pqcSignature,
    pqcPublicKey,
    completedAt: new Date().toISOString(),
  }

  assessments[idx] = completed
  assessmentsStore.set(userId, assessments)

  // Audit log (fire-and-forget PQC + HCS)
  void logAuditEvent({
    userId,
    entityType: 'assessment',
    entityId: id,
    action: 'completed',
    details: `Assessment completed with score ${result.score}/100 (${result.riskLevel} risk)`,
  })

  return NextResponse.json(completed)
}

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { assessmentsStore } from '@/lib/assessment-store'
import { systemsStore } from '@/lib/systems-store'
import { reportsStore } from '@/lib/report-store'
import { scoreAssessment } from '@/lib/assessment-scorer'
import { generateReport } from '@/lib/report-generator'
import { createStamp } from '@taurus/pqc-crypto'
import { logAuditEvent } from '@/lib/audit-logger'

// GET /api/reports — list all reports for the current user
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reports = reportsStore.get(userId) ?? []
  // Return without full content for list view
  return NextResponse.json(
    reports.map((r) => ({
      id: r.id,
      assessmentId: r.assessmentId,
      mode: r.mode,
      model: r.model,
      pqcHash: r.pqcHash,
      hederaTxId: r.hederaTxId,
      createdAt: r.createdAt,
    })),
  )
}

// POST /api/reports — generate a new report
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  type PostBody = {
    assessmentId: string
    mode?: 'template' | 'cloud' | 'sovereign'
    sovereignEndpoint?: string
    sovereignModel?: string
  }

  const body = (await req.json()) as PostBody
  const { assessmentId, mode = 'template', sovereignEndpoint, sovereignModel } = body

  if (!assessmentId) {
    return NextResponse.json({ error: 'assessmentId is required' }, { status: 400 })
  }

  // Load assessment
  const assessments = assessmentsStore.get(userId) ?? []
  const assessment = assessments.find((a) => a.id === assessmentId)
  if (!assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
  }

  // Load system
  const systems = systemsStore.get(userId) ?? []
  const system = systems.find((s) => s.id === assessment.systemId)
  if (!system) {
    return NextResponse.json({ error: 'System not found' }, { status: 404 })
  }

  // Score the assessment if not already scored
  const scoringResult =
    assessment.score !== undefined &&
    assessment.riskLevel !== undefined &&
    assessment.categoryScores !== undefined &&
    assessment.recommendations !== undefined &&
    assessment.keyFindings !== undefined
      ? {
          score: assessment.score,
          riskLevel: assessment.riskLevel,
          categoryScores: assessment.categoryScores,
          recommendations: assessment.recommendations,
          keyFindings: assessment.keyFindings,
        }
      : scoreAssessment(assessment.responses ?? {})

  const reportId = randomUUID()

  // Build report config
  const cloudApiKey = process.env['REPORT_AI_API_KEY']
  const cloudBaseUrl = process.env['REPORT_AI_BASE_URL']
  const cloudModel = process.env['REPORT_AI_MODEL']

  // Generate the report content
  const content = await generateReport(
    {
      system,
      assessment,
      scoringResult,
      jurisdiction: system.jurisdiction ?? 'eu',
      reportId,
    },
    {
      mode,
      cloudApiKey,
      cloudBaseUrl,
      cloudModel,
      sovereignEndpoint,
      sovereignModel,
    },
  )

  // PQC signing (if platform keys are available)
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
        { type: 'report', id: reportId, payload: content, jurisdiction: 'eu' },
        sk,
        pk,
      )
      pqcHash = stamp.hash
      pqcSignature = stamp.signature
      pqcPublicKey = stamp.publicKey
    } catch (err) {
      console.error('[reports/route] PQC signing failed (dev mode):', err)
    }
  }

  // Determine which model was actually used
  let resolvedModel: string | undefined
  if (mode === 'sovereign') resolvedModel = sovereignModel ?? 'mistral:7b'
  else if (mode === 'cloud') resolvedModel = cloudModel ?? 'gpt-4o-mini'

  const report = {
    id: reportId,
    assessmentId,
    userId,
    content,
    mode: (cloudApiKey || sovereignEndpoint ? mode : 'template') as 'template' | 'cloud' | 'sovereign',
    model: resolvedModel,
    pqcHash,
    pqcSignature,
    pqcPublicKey,
    hederaTxId: undefined,
    createdAt: new Date().toISOString(),
  }

  // Persist
  const existing = reportsStore.get(userId) ?? []
  reportsStore.set(userId, [report, ...existing])

  // Audit log (fire-and-forget PQC + HCS)
  void logAuditEvent({
    userId,
    entityType: 'report',
    entityId: reportId,
    action: 'generated',
    details: `Report generated for assessment ${assessmentId} (mode: ${report.mode}${report.model ? `, model: ${report.model}` : ''})`,
  })

  return NextResponse.json(report, { status: 201 })
}

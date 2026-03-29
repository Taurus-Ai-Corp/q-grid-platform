import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { assessments as assessmentsTable, reports as reportsTable, systems as systemsTable } from '@taurus/db'
import { getDb } from '@/lib/db'
import { assessmentsStore } from '@/lib/assessment-store'
import { systemsStore } from '@/lib/systems-store'
import { reportsStore } from '@/lib/report-store'
import { scoreAssessment } from '@/lib/assessment-scorer'
import { generateReport } from '@/lib/report-generator'
import { createStamp } from '@taurus/pqc-crypto'
import { logAuditEvent } from '@/lib/audit-logger'
import { createReportSchema } from '@/lib/validation'

// GET /api/reports — list all reports for the current user
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getDb()
    if (!db) {
      // Fallback: in-memory store
      const reports = reportsStore.get(userId) ?? []
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

    const rows = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.organizationId, userId))

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        assessmentId: r.assessmentId,
        mode: 'template', // not stored in DB schema; default for list view
        model: r.aiModel ?? undefined,
        pqcHash: r.pqcHash ?? undefined,
        hederaTxId: r.hederaTxId ?? undefined,
        createdAt: r.createdAt.toISOString(),
      })),
    )
  } catch (error) {
    console.error('[reports/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/reports — generate a new report
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const parsed = createReportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { assessmentId, mode = 'template', sovereignEndpoint, sovereignModel } = parsed.data

    const db = getDb()
    if (!db) {
      // Fallback: in-memory store
      const assessments = assessmentsStore.get(userId) ?? []
      const assessment = assessments.find((a) => a.id === assessmentId)
      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      }

      const systems = systemsStore.get(userId) ?? []
      const system = systems.find((s) => s.id === assessment.systemId)
      if (!system) {
        return NextResponse.json({ error: 'System not found' }, { status: 404 })
      }

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
      const cloudApiKey = process.env['REPORT_AI_API_KEY']
      const cloudBaseUrl = process.env['REPORT_AI_BASE_URL']
      const cloudModel = process.env['REPORT_AI_MODEL']

      const content = await generateReport(
        { system, assessment, scoringResult, jurisdiction: system.jurisdiction ?? 'eu', reportId },
        { mode, cloudApiKey, cloudBaseUrl, cloudModel, sovereignEndpoint, sovereignModel },
      )

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

      const existing = reportsStore.get(userId) ?? []
      reportsStore.set(userId, [report, ...existing])

      void logAuditEvent({
        userId,
        entityType: 'report',
        entityId: reportId,
        action: 'generated',
        details: `Report generated for assessment ${assessmentId} (mode: ${report.mode}${report.model ? `, model: ${report.model}` : ''})`,
      })

      return NextResponse.json(report, { status: 201 })
    }

    // Neon DB path — load assessment
    const [assessmentRow] = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.id, assessmentId))

    if (!assessmentRow || assessmentRow.organizationId !== userId) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Load system
    const [systemRow] = await db
      .select()
      .from(systemsTable)
      .where(eq(systemsTable.id, assessmentRow.systemId))

    if (!systemRow) {
      return NextResponse.json({ error: 'System not found' }, { status: 404 })
    }

    // Reconstruct assessment shape for report generator
    const storedBlob = (assessmentRow.responses ?? {}) as Record<string, unknown>
    const meta = (storedBlob['_meta'] ?? {}) as Record<string, unknown>
    const answers = (storedBlob['answers'] ?? {}) as Record<string, string | boolean>

    const assessmentForReport = {
      id: assessmentRow.id,
      systemId: assessmentRow.systemId,
      userId: assessmentRow.organizationId,
      status: assessmentRow.status as 'draft' | 'in_progress' | 'completed',
      responses: answers,
      currentSection: (meta['currentSection'] as number) ?? 0,
      score: (meta['score'] as number) ?? undefined,
      riskLevel: (meta['riskLevel'] as string) ?? undefined,
      recommendations: (meta['recommendations'] as { id: string; priority: 'critical' | 'high' | 'medium' | 'low'; title: string; description: string; category: string }[]) ?? undefined,
      keyFindings: (meta['keyFindings'] as string[]) ?? undefined,
      categoryScores: (meta['categoryScores'] as Record<string, number>) ?? undefined,
      createdAt: assessmentRow.createdAt.toISOString(),
      completedAt: assessmentRow.completedAt?.toISOString(),
    }

    const systemForReport = {
      id: systemRow.id,
      name: systemRow.name,
      description: systemRow.description ?? '',
      deploymentScope: '',
      useCase: '',
      industry: '',
      autonomyLevel: '',
      riskLevel: systemRow.riskLevel ?? 'unknown',
      status: systemRow.status,
      jurisdiction: systemRow.jurisdiction,
      createdAt: systemRow.createdAt.toISOString(),
    }

    const scoringResult =
      assessmentForReport.score !== undefined &&
      assessmentForReport.riskLevel !== undefined &&
      assessmentForReport.categoryScores !== undefined &&
      assessmentForReport.recommendations !== undefined &&
      assessmentForReport.keyFindings !== undefined
        ? {
            score: assessmentForReport.score,
            riskLevel: assessmentForReport.riskLevel,
            categoryScores: assessmentForReport.categoryScores,
            recommendations: assessmentForReport.recommendations,
            keyFindings: assessmentForReport.keyFindings,
          }
        : scoreAssessment(answers)

    const reportId = randomUUID()
    const cloudApiKey = process.env['REPORT_AI_API_KEY']
    const cloudBaseUrl = process.env['REPORT_AI_BASE_URL']
    const cloudModel = process.env['REPORT_AI_MODEL']

    const content = await generateReport(
      {
        system: systemForReport,
        assessment: assessmentForReport,
        scoringResult,
        jurisdiction: systemRow.jurisdiction ?? 'eu',
        reportId,
      },
      { mode, cloudApiKey, cloudBaseUrl, cloudModel, sovereignEndpoint, sovereignModel },
    )

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
        console.error('[reports/route] PQC signing failed:', err)
      }
    }

    let resolvedModel: string | undefined
    if (mode === 'sovereign') resolvedModel = sovereignModel ?? 'mistral:7b'
    else if (mode === 'cloud') resolvedModel = cloudModel ?? 'gpt-4o-mini'

    const resolvedMode = (cloudApiKey || sovereignEndpoint ? mode : 'template') as 'template' | 'cloud' | 'sovereign'

    const [row] = await db
      .insert(reportsTable)
      .values({
        assessmentId,
        organizationId: userId,
        contentMarkdown: content,
        aiModel: resolvedModel,
        pqcHash,
        pqcSignature,
      })
      .returning()

    if (!row) {
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
    }

    void logAuditEvent({
      userId,
      entityType: 'report',
      entityId: row.id,
      action: 'generated',
      details: `Report generated for assessment ${assessmentId} (mode: ${resolvedMode}${resolvedModel ? `, model: ${resolvedModel}` : ''})`,
    })

    return NextResponse.json(
      {
        id: row.id,
        assessmentId: row.assessmentId,
        userId: row.organizationId,
        content: row.contentMarkdown ?? '',
        mode: resolvedMode,
        model: row.aiModel ?? undefined,
        pqcHash: row.pqcHash ?? undefined,
        pqcSignature: row.pqcSignature ?? undefined,
        pqcPublicKey,
        hederaTxId: row.hederaTxId ?? undefined,
        createdAt: row.createdAt.toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[reports/POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { systems as systemsTable } from '@taurus/db'
import { getDb } from '@/lib/db'
import { systemsStore, type SystemRecord } from '@/lib/systems-store'
import { classifyRisk } from '@/lib/risk-classifier'
import { logAuditEvent } from '@/lib/audit-logger'
import { createSystemSchema } from '@/lib/validation'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getDb()
    if (!db) {
      // Fallback: in-memory store
      const systems = systemsStore.get(userId) ?? []
      return NextResponse.json({ systems })
    }

    // Neon DB: use userId as organizationId stand-in for MVP
    const rows = await db
      .select()
      .from(systemsTable)
      .where(eq(systemsTable.organizationId, userId))

    // Map DB rows to SystemRecord shape
    const systems: SystemRecord[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? '',
      deploymentScope: '',
      useCase: '',
      industry: '',
      autonomyLevel: '',
      riskLevel: r.riskLevel ?? 'unknown',
      status: r.status,
      jurisdiction: r.jurisdiction,
      createdAt: r.createdAt.toISOString(),
    }))

    return NextResponse.json({ systems })
  } catch (error) {
    console.error('[systems/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const parsed = createSystemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { name, description, deploymentScope, useCase, industry, autonomyLevel } = parsed.data
    const riskLevel = classifyRisk(useCase, industry, autonomyLevel)
    const jurisdiction = (process.env['JURISDICTION'] ?? 'eu') as 'eu' | 'na' | 'in' | 'ae'

    const db = getDb()
    if (!db) {
      // Fallback: in-memory store
      const system: SystemRecord = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description,
        deploymentScope,
        useCase,
        industry,
        autonomyLevel,
        riskLevel,
        status: 'active',
        jurisdiction,
        createdAt: new Date().toISOString(),
      }

      const existing = systemsStore.get(userId) ?? []
      existing.push(system)
      systemsStore.set(userId, existing)

      void logAuditEvent({
        userId,
        entityType: 'system',
        entityId: system.id,
        action: 'created',
        details: `Registered AI system: ${system.name} (${system.riskLevel} risk, ${industry})`,
      })

      return NextResponse.json(system, { status: 201 })
    }

    // Neon DB insert — userId used as organizationId for MVP
    const [row] = await db
      .insert(systemsTable)
      .values({
        organizationId: userId,
        name: name.trim(),
        description,
        riskLevel,
        jurisdiction,
        status: 'active',
      })
      .returning()

    if (!row) {
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
    }

    const system: SystemRecord = {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      deploymentScope,
      useCase,
      industry,
      autonomyLevel,
      riskLevel: row.riskLevel ?? riskLevel,
      status: row.status,
      jurisdiction: row.jurisdiction,
      createdAt: row.createdAt.toISOString(),
    }

    void logAuditEvent({
      userId,
      entityType: 'system',
      entityId: system.id,
      action: 'created',
      details: `Registered AI system: ${system.name} (${system.riskLevel} risk, ${industry})`,
    })

    return NextResponse.json(system, { status: 201 })
  } catch (error) {
    console.error('[systems/POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

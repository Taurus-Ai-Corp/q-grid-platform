import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { systemsStore, type SystemRecord } from '@/lib/systems-store'
import { classifyRisk } from '@/lib/risk-classifier'
import { logAuditEvent } from '@/lib/audit-logger'
import { createSystemSchema } from '@/lib/validation'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const systems = systemsStore.get(userId) ?? []
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

    const system: SystemRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description,
      deploymentScope,
      useCase,
      industry,
      autonomyLevel,
      riskLevel: classifyRisk(useCase, industry, autonomyLevel),
      status: 'active',
      jurisdiction: process.env['JURISDICTION'] ?? 'eu',
      createdAt: new Date().toISOString(),
    }

    const existing = systemsStore.get(userId) ?? []
    existing.push(system)
    systemsStore.set(userId, existing)

    // Audit log (fire-and-forget PQC + HCS)
    void logAuditEvent({
      userId,
      entityType: 'system',
      entityId: system.id,
      action: 'created',
      details: `Registered AI system: ${system.name} (${system.riskLevel} risk, ${system.industry})`,
    })

    return NextResponse.json(system, { status: 201 })
  } catch (error) {
    console.error('[systems/POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

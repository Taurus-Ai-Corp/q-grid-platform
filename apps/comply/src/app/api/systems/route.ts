import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { systemsStore, type SystemRecord } from '@/lib/systems-store'
import { classifyRisk } from '@/lib/risk-classifier'
import { logAuditEvent } from '@/lib/audit-logger'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const systems = systemsStore.get(userId) ?? []
  return NextResponse.json({ systems })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    name?: string
    description?: string
    deploymentScope?: string
    useCase?: string
    industry?: string
    autonomyLevel?: string
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'System name is required' }, { status: 400 })
  }

  const system: SystemRecord = {
    id: crypto.randomUUID(),
    name: body.name.trim(),
    description: body.description ?? '',
    deploymentScope: body.deploymentScope ?? 'internal',
    useCase: body.useCase ?? '',
    industry: body.industry ?? 'other',
    autonomyLevel: body.autonomyLevel ?? 'advisory',
    riskLevel: classifyRisk(body.useCase ?? '', body.industry ?? '', body.autonomyLevel ?? ''),
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
}

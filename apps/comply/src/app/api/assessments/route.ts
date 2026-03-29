import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { assessmentsStore, type AssessmentRecord } from '@/lib/assessment-store'
import { systemsStore } from '@/lib/systems-store'
import { createAssessmentSchema } from '@/lib/validation'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const assessments = assessmentsStore.get(userId) ?? []

    // Enrich with system name
    const systems = systemsStore.get(userId) ?? []
    const enriched = assessments.map((a) => {
      const system = systems.find((s) => s.id === a.systemId)
      return { ...a, systemName: system?.name ?? 'Unknown System' }
    })

    return NextResponse.json({ assessments: enriched })
  } catch (error) {
    console.error('[assessments/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const parsed = createAssessmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { systemId } = parsed.data

    // Verify system belongs to user
    const systems = systemsStore.get(userId) ?? []
    const system = systems.find((s) => s.id === systemId)
    if (!system) {
      return NextResponse.json({ error: 'System not found' }, { status: 404 })
    }

    const assessment: AssessmentRecord = {
      id: crypto.randomUUID(),
      systemId,
      userId,
      status: 'draft',
      responses: {},
      currentSection: 0,
      createdAt: new Date().toISOString(),
    }

    const existing = assessmentsStore.get(userId) ?? []
    existing.push(assessment)
    assessmentsStore.set(userId, existing)

    return NextResponse.json(assessment, { status: 201 })
  } catch (error) {
    console.error('[assessments/POST] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

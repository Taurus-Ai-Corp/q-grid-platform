import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { assessmentsStore } from '@/lib/assessment-store'
import { systemsStore } from '@/lib/systems-store'
import { updateAssessmentSchema } from '@/lib/validation'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const assessments = assessmentsStore.get(userId) ?? []
    const assessment = assessments.find((a) => a.id === id)

    if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Enrich with system name
    const systems = systemsStore.get(userId) ?? []
    const system = systems.find((s) => s.id === assessment.systemId)

    return NextResponse.json({ ...assessment, systemName: system?.name ?? 'Unknown System' })
  } catch (error) {
    console.error('[assessments/[id]/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const assessments = assessmentsStore.get(userId) ?? []
    const idx = assessments.findIndex((a) => a.id === id)

    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const parsed = updateAssessmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const current = assessments[idx]!
    const updated = {
      ...current,
      responses: parsed.data.responses !== undefined ? parsed.data.responses : current.responses,
      currentSection:
        parsed.data.currentSection !== undefined
          ? parsed.data.currentSection
          : current.currentSection,
      status: parsed.data.status !== undefined ? parsed.data.status : current.status,
    }

    assessments[idx] = updated
    assessmentsStore.set(userId, assessments)

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[assessments/[id]/PUT] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

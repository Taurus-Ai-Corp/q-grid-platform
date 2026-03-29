import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { systems as systemsTable } from '@taurus/db'
import { getDb } from '@/lib/db'
import { systemsStore } from '@/lib/systems-store'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const db = getDb()
    if (!db) {
      // Fallback: in-memory store
      const systems = systemsStore.get(userId) ?? []
      const system = systems.find((s) => s.id === id)
      if (!system) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(system)
    }

    const [row] = await db
      .select()
      .from(systemsTable)
      .where(and(eq(systemsTable.id, id), eq(systemsTable.organizationId, userId)))

    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      deploymentScope: '',
      useCase: '',
      industry: '',
      autonomyLevel: '',
      riskLevel: row.riskLevel ?? 'unknown',
      status: row.status,
      jurisdiction: row.jurisdiction,
      createdAt: row.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('[systems/[id]/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const db = getDb()
    if (!db) {
      // Fallback: in-memory store
      const systems = systemsStore.get(userId) ?? []
      const filtered = systems.filter((s) => s.id !== id)
      if (filtered.length === systems.length) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      systemsStore.set(userId, filtered)
      return NextResponse.json({ success: true })
    }

    const deleted = await db
      .delete(systemsTable)
      .where(and(eq(systemsTable.id, id), eq(systemsTable.organizationId, userId)))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[systems/[id]/DELETE] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

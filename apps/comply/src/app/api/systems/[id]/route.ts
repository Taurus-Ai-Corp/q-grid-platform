import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { systemsStore } from '@/lib/systems-store'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const systems = systemsStore.get(userId) ?? []
    const system = systems.find((s) => s.id === id)

    if (!system) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(system)
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
    const systems = systemsStore.get(userId) ?? []
    const filtered = systems.filter((s) => s.id !== id)

    if (filtered.length === systems.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    systemsStore.set(userId, filtered)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[systems/[id]/DELETE] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

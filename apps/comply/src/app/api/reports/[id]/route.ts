import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { reportsStore } from '@/lib/report-store'

// GET /api/reports/[id] — get a single report with full content
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const reports = reportsStore.get(userId) ?? []
    const report = reports.find((r) => r.id === id)

    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(report)
  } catch (error) {
    console.error('[reports/[id]/GET] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

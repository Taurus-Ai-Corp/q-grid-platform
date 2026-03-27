import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getAuditEvents } from '@/lib/audit-store'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const entityType = url.searchParams.get('entityType') ?? undefined

  let events = getAuditEvents(userId)
  if (entityType) events = events.filter((e) => e.entityType === entityType)

  return NextResponse.json({ events: events.slice(0, 50) })
}

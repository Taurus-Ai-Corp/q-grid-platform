import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'

// GET /api/me — return current user's plan and stripe status
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getDb()
    if (!db) {
      return NextResponse.json({ plan: null, stripeCustomerId: null })
    }

    const { users } = await import('@taurus/db')
    const row = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: { plan: true, stripeCustomerId: true },
    })

    return NextResponse.json({
      plan: row?.plan ?? null,
      stripeCustomerId: row?.stripeCustomerId ?? null,
    })
  } catch (error) {
    console.error('[api/me] Error:', error)
    return NextResponse.json({ plan: null, stripeCustomerId: null })
  }
}

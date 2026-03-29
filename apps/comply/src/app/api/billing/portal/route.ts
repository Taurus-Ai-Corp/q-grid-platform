import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

// POST /api/billing/portal — create a Stripe Customer Portal session
// The customerId must be stored on the user record after checkout completes.
// For MVP we accept it in the request body; production should read from DB.
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Billing not configured' }, { status: 503 })
    }

    const body = await req.json().catch(() => null)
    const customerId: string | undefined = body?.customerId

    if (!customerId) {
      return NextResponse.json({ error: 'No billing account found — please subscribe first' }, { status: 400 })
    }

    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[billing/portal] Error:', error)
    return NextResponse.json({ error: 'Portal session failed' }, { status: 500 })
  }
}

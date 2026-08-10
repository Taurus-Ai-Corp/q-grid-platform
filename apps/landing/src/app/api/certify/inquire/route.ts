import { NextResponse } from 'next/server'
import { getResend } from '@/lib/billing'

/**
 * GRIDERA|Certify executive-briefing capture.
 *
 * Mirrors /api/migrate/inquire deliberately: same validation, same Resend-or-memory
 * fallback, same never-lose-the-lead posture. Certify is the "05 — Prove Trust" tile in
 * both nav and footer, so this is the primary CTA of the product ladder — the page
 * previously promised a 24-hour response while discarding every submission client-side.
 */

// In-memory fallback when RESEND_API_KEY is absent. Cleared on restart — dev/preview only.
const _inbox: Record<string, unknown>[] = []

type InquiryBody = {
  name?: string
  email?: string
  company?: string
  message?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: Request) {
  let record: {
    name: string
    email: string
    company: string
    message: string
    submittedAt: string
  } | null = null

  try {
    const body = (await req.json().catch(() => null)) as InquiryBody | null
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })

    const { name, email, company, message } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!company || typeof company !== 'string' || !company.trim()) {
      return NextResponse.json({ error: 'Company is required' }, { status: 400 })
    }

    record = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      message: message?.trim() || '',
      submittedAt: new Date().toISOString(),
    }

    const resend = getResend()
    if (!resend) {
      console.log('[certify/inquire] No RESEND_API_KEY — storing in memory:')
      console.log(JSON.stringify(record, null, 2))
      _inbox.push(record)
      return NextResponse.json({ success: true, note: 'Logged (no email service configured)' })
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
        <h1 style="color: #00CCAA;">New GRIDERA|Certify Briefing Request</h1>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding:8px 0;font-weight:600;width:120px;vertical-align:top;">Name</td><td style="padding:8px 0;">${escapeHtml(record.name)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(record.email)}" style="color:#00CCAA;">${escapeHtml(record.email)}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Company</td><td style="padding:8px 0;">${escapeHtml(record.company)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Message</td><td style="padding:8px 0;">${record.message ? escapeHtml(record.message).replace(/\n/g, '<br/>') : '<span style="color:#888;">None</span>'}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Submitted</td><td style="padding:8px 0;font-family:monospace;font-size:13px;">${escapeHtml(record.submittedAt)}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px;">
          Executive briefing request from q-grid.net/certify. The page promises a response within 24 hours.
        </p>
      </body>
      </html>
    `

    const sendResult = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resend.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resend.from,
        to: 'admin@taurusai.io',
        replyTo: record.email,
        subject: `[Certify Briefing] ${record.company} — ${record.name}`,
        html,
      }),
    })

    if (!sendResult.ok) {
      const errText = await sendResult.text().catch(() => 'unknown')
      console.error('[certify/inquire] Resend send failed:', sendResult.status, errText)
      _inbox.push(record)
      return NextResponse.json({ success: true, note: 'Logged (email send failed, stored locally)' })
    }

    console.log(`[certify/inquire] Briefing request from ${record.email} (${record.company}) — email sent`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[certify/inquire] Error:', err)
    if (record) {
      try {
        _inbox.push(record)
        return NextResponse.json({ success: true, note: 'Logged (error occurred, stored locally)' })
      } catch (storageErr) {
        console.error('[certify/inquire] Fallback storage also failed:', storageErr)
      }
    }
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Inquiry submission failed', detail: message }, { status: 500 })
  }
}

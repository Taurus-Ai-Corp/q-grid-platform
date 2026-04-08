import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const _jurisdiction = searchParams.get('jurisdiction') ?? process.env['JURISDICTION'] ?? 'eu'
  const days = parseInt(searchParams.get('days') ?? '30', 10)

  // Try to get DB — if unavailable, return zeros
  let db
  try {
    const { getDb } = await import('@/lib/db')
    db = getDb()
  } catch {
    db = null
  }

  if (!db) {
    // Return empty summary — dashboard shows "no data" state
    return NextResponse.json({
      totalCost: 0,
      totalAssessments: 0,
      avgCostPerAssessment: 0,
      selfHostedRatio: 0,
      guardPassRate: 0,
      guardBlockRate: 0,
      guardWarnRate: 0,
      avgLatencyMs: 0,
      p95LatencyMs: 0,
    })
  }

  // Query audit_trail for guard attestations
  const { auditTrail } = await import('@taurus/db/schema')
  const { eq, and, gte } = await import('drizzle-orm')

  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await db
    .select({
      costUsd: auditTrail.costUsd,
      latencyMs: auditTrail.latencyMs,
      guardVerdict: auditTrail.guardVerdict,
      model: auditTrail.model,
    })
    .from(auditTrail)
    .where(and(
      eq(auditTrail.action, 'ai_guard_attestation'),
      gte(auditTrail.createdAt, since),
    ))

  const total = rows.length
  if (total === 0) {
    return NextResponse.json({
      totalCost: 0, totalAssessments: 0, avgCostPerAssessment: 0,
      selfHostedRatio: 0, guardPassRate: 0, guardBlockRate: 0,
      guardWarnRate: 0, avgLatencyMs: 0, p95LatencyMs: 0,
    })
  }

  const totalCost = rows.reduce((sum, r) => sum + (r.costUsd ?? 0), 0)
  const selfHosted = rows.filter((r) => r.model?.startsWith('ollama/')).length
  const passes = rows.filter((r) => r.guardVerdict === 'pass').length
  const blocks = rows.filter((r) => r.guardVerdict === 'block').length
  const warns = rows.filter((r) => r.guardVerdict === 'warn').length
  const latencies = rows.map((r) => r.latencyMs ?? 0).sort((a, b) => a - b)
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / total
  const p95Index = Math.ceil(total * 0.95) - 1

  return NextResponse.json({
    totalCost,
    totalAssessments: total,
    avgCostPerAssessment: totalCost / total,
    selfHostedRatio: selfHosted / total,
    guardPassRate: passes / total,
    guardBlockRate: blocks / total,
    guardWarnRate: warns / total,
    avgLatencyMs: Math.round(avgLatency),
    p95LatencyMs: latencies[p95Index] ?? 0,
  })
}

/**
 * Tests for recommendation-engine.ts
 *
 * 4 tests covering the EU AI Act recommendation engine:
 *   1. Critical rec when autonomous_decisions=true + override_capability=false (Article 14)
 *   2. High rec when gdpr_compliant=false + data-governance score < 50
 *   3. No critical recommendations for a fully compliant system
 *   4. Recommendations sorted critical → high → medium → low
 */

import { describe, it, expect } from 'vitest'
import { generateRecommendations } from './recommendation-engine'

describe('generateRecommendations — EU AI Act recommendation engine', () => {
  it('returns critical recommendation when autonomous_decisions=true and override_capability=false', () => {
    const responses: Record<string, string | boolean> = {
      autonomous_decisions: true,
      override_capability: false,
    }
    const categoryScores: Record<string, number> = {
      'system-info': 80,
      'risk-assessment': 80,
      'data-governance': 80,
      transparency: 80,
      'human-oversight': 80,
      security: 80,
    }

    const recs = generateRecommendations(categoryScores, responses)

    const criticalRecs = recs.filter((r) => r.priority === 'critical')
    expect(criticalRecs.length).toBeGreaterThan(0)

    const overrideRec = recs.find((r) => r.id === 'rec-human-override')
    expect(overrideRec).toBeDefined()
    expect(overrideRec?.priority).toBe('critical')
    expect(overrideRec?.category).toBe('Human Oversight')
    // Should reference Article 14
    expect(overrideRec?.description).toContain('Article 14')
  })

  it('returns high recommendation when gdpr_compliant=false and data-governance score < 50', () => {
    const responses: Record<string, string | boolean> = {
      gdpr_compliant: false,
    }
    const categoryScores: Record<string, number> = {
      'system-info': 80,
      'risk-assessment': 80,
      'data-governance': 40, // below 50
      transparency: 80,
      'human-oversight': 80,
      security: 80,
    }

    const recs = generateRecommendations(categoryScores, responses)

    const gdprRec = recs.find((r) => r.id === 'rec-gdpr-governance')
    expect(gdprRec).toBeDefined()
    expect(gdprRec?.priority).toBe('high')
    expect(gdprRec?.category).toBe('Data Governance')

    // Should also get a medium rec for the low data-governance score
    const mediumRec = recs.find(
      (r) => r.id === 'rec-improve-data-governance' && r.priority === 'medium',
    )
    expect(mediumRec).toBeDefined()
  })

  it('returns no critical recommendations for a fully compliant system', () => {
    const responses: Record<string, string | boolean> = {
      // Risk booleans set to safe values (false = non-autonomous, no rights impact)
      autonomous_decisions: false,
      fundamental_rights: false,
      // Positive booleans all true
      gdpr_compliant: true,
      documentation: true,
      override_capability: true,
      adversarial_testing: true,
      user_notification: true,
    }
    const categoryScores: Record<string, number> = {
      'system-info': 90,
      'risk-assessment': 85,
      'data-governance': 88,
      transparency: 92,
      'human-oversight': 95,
      security: 87,
    }

    const recs = generateRecommendations(categoryScores, responses)

    const criticalRecs = recs.filter((r) => r.priority === 'critical')
    expect(criticalRecs).toHaveLength(0)
  })

  it('recommendations are sorted critical → high → medium → low', () => {
    const responses: Record<string, string | boolean> = {
      // Trigger critical (autonomous without override)
      autonomous_decisions: true,
      override_capability: false,
      // Trigger critical (fundamental rights)
      fundamental_rights: true,
      // Trigger high (no docs, no adversarial testing)
      documentation: false,
      adversarial_testing: false,
      // GDPR false → high
      gdpr_compliant: false,
    }
    const categoryScores: Record<string, number> = {
      'system-info': 30,      // below 50 → medium
      'risk-assessment': 20,  // below 50 → medium
      'data-governance': 40,  // below 50 → medium
      transparency: 55,       // above 50 → no medium rec
      'human-oversight': 60,  // above 50 → no medium rec
      security: 45,           // below 50 → medium
    }

    const recs = generateRecommendations(categoryScores, responses)

    expect(recs.length).toBeGreaterThan(0)

    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    for (let i = 1; i < recs.length; i++) {
      const prev = priorityOrder[recs[i - 1]!.priority] ?? 3
      const curr = priorityOrder[recs[i]!.priority] ?? 3
      expect(curr).toBeGreaterThanOrEqual(prev)
    }

    // Verify the first recommendation is critical
    expect(recs[0]?.priority).toBe('critical')
  })
})

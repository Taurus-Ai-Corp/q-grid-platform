/**
 * Weighted scoring algorithm tests for assessment-scorer.ts
 * 7 tests verifying the Gen 3 weighted scoring behaviour.
 */

import { describe, it, expect } from 'vitest'
import { scoreAssessment } from './assessment-scorer'

describe('scoreAssessment — weighted algorithm', () => {
  // Test 1: Empty responses → unacceptable risk, score ≤ 25
  it('empty responses yield unacceptable risk with score ≤ 25', () => {
    const result = scoreAssessment({})
    expect(result.score).toBeLessThanOrEqual(25)
    expect(result.riskLevel).toBe('unacceptable')
  })

  // Test 2: Boolean risk questions (autonomous_decisions, fundamental_rights) scored inversely
  it('risk boolean questions: true scores 0, false scores 100 for that question', () => {
    // autonomous_decisions=true → that question contributes 0 (risky)
    // autonomous_decisions=false → that question contributes 100 (safe)
    const riskyResult = scoreAssessment({ autonomous_decisions: true })
    const safeResult = scoreAssessment({ autonomous_decisions: false })
    expect(safeResult.score).toBeGreaterThan(riskyResult.score)

    const riskyRights = scoreAssessment({ fundamental_rights: true })
    const safeRights = scoreAssessment({ fundamental_rights: false })
    expect(safeRights.score).toBeGreaterThan(riskyRights.score)
  })

  // Test 3: Boolean positive questions (gdpr_compliant, documentation, etc.) scored directly
  it('positive boolean questions: true scores 100, false scores 0 for that question', () => {
    const withGdpr = scoreAssessment({ gdpr_compliant: true })
    const withoutGdpr = scoreAssessment({ gdpr_compliant: false })
    expect(withGdpr.score).toBeGreaterThan(withoutGdpr.score)

    const withDocs = scoreAssessment({ documentation: true })
    const withoutDocs = scoreAssessment({ documentation: false })
    expect(withDocs.score).toBeGreaterThan(withoutDocs.score)

    const withOverride = scoreAssessment({ override_capability: true })
    const withoutOverride = scoreAssessment({ override_capability: false })
    expect(withOverride.score).toBeGreaterThan(withoutOverride.score)
  })

  // Test 4: Weight multiplier — a weight-3 question has greater impact than weight-1
  it('weight-3 question has greater score impact than weight-1 question in same section', () => {
    // system-info section: deployment_scope (weight=1) vs autonomous_decisions (weight=3)
    // Give both a score of 100 (deployment_scope answered fully, autonomous_decisions=false → 100)
    // The weighted average with weight-3 should pull the section score differently

    // Only answer deployment_scope (weight=1, text → 100 with long text)
    const longText =
      'Deployed across enterprise finance operations covering three regional offices in North America, Europe, and Asia Pacific, serving approximately 500 analysts.'
    const weight1Only = scoreAssessment({ deployment_scope: longText })

    // Only answer autonomous_decisions=false (weight=3 → 100)
    const weight3Only = scoreAssessment({ autonomous_decisions: false })

    // Both get score 100 for their question, but weight-3 contributes more to section
    // system-info: weights are intended_use=2, deployment_scope=1, autonomous_decisions=3
    // With only deployment_scope answered: (0*2 + 100*1 + 0*3) / (2+1+3) = 100/6 ≈ 17
    // With only autonomous_decisions answered: (0*2 + 0*1 + 100*3) / (2+1+3) = 300/6 = 50
    expect(weight3Only.categoryScores['system-info']).toBeGreaterThan(
      weight1Only.categoryScores['system-info'] ?? 0,
    )
  })

  // Test 5: All-positive responses → minimal risk, score ≥ 76
  it('all-positive responses yield minimal risk with score ≥ 76', () => {
    const longText =
      'Comprehensive detailed description covering all aspects of this system with full context, methodology, and risk mitigations thoroughly documented for compliance review.'
    const bestResponses: Record<string, string | boolean> = {
      intended_use: longText,
      deployment_scope: longText,
      autonomous_decisions: false,
      fundamental_rights: false,
      safety_risks: longText,
      bias_assessment: longText,
      training_data: longText,
      data_quality: longText,
      gdpr_compliant: true,
      user_notification: longText,
      explainability: longText,
      documentation: true,
      oversight_measures: longText,
      override_capability: true,
      monitoring: longText,
      accuracy_metrics: longText,
      security_measures: longText,
      adversarial_testing: true,
    }
    const result = scoreAssessment(bestResponses)
    expect(result.score).toBeGreaterThanOrEqual(76)
    expect(result.riskLevel).toBe('minimal')
  })

  // Test 6: categoryScores has all 6 sections
  it('categoryScores contains all 6 section IDs', () => {
    const result = scoreAssessment({})
    const expectedSections = [
      'system-info',
      'risk-assessment',
      'data-governance',
      'transparency',
      'human-oversight',
      'security',
    ]
    for (const id of expectedSections) {
      expect(result.categoryScores).toHaveProperty(id)
      expect(typeof result.categoryScores[id]).toBe('number')
    }
  })

  // Test 7: keyFindings populated for risk indicators (riskIndicator='high' questions triggered)
  it('keyFindings include risk-indicator findings when high-risk questions are triggered', () => {
    // autonomous_decisions=true and fundamental_rights=true are riskIndicator='high'
    const result = scoreAssessment({
      autonomous_decisions: true,
      fundamental_rights: true,
    })
    expect(result.keyFindings.length).toBeGreaterThan(0)
    // At least one finding should mention autonomous or fundamental rights
    const findingsText = result.keyFindings.join(' ')
    const hasRiskFinding =
      findingsText.includes('autonomous') ||
      findingsText.includes('fundamental') ||
      findingsText.includes('Annex III') ||
      findingsText.includes('FRIA')
    expect(hasRiskFinding).toBe(true)
  })
})

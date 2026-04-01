import { describe, it, expect } from 'vitest'
import { generateTemplateReport } from '../report-generator'
import type { ReportInput } from '../report-generator'
import type { SystemRecord } from '../systems-store'
import type { AssessmentRecord } from '../assessment-store'
import type { ScoringResult } from '../assessment-scorer'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockSystem: SystemRecord = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'MediScan AI',
  description: 'Automated medical imaging analysis for radiology departments.',
  deploymentScope: 'internal',
  useCase: 'Medical image analysis',
  industry: 'healthcare',
  autonomyLevel: 'semi-autonomous',
  riskLevel: 'high',
  status: 'active',
  jurisdiction: 'eu',
  createdAt: new Date('2024-01-15').toISOString(),
}

const mockAssessment: AssessmentRecord = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  systemId: mockSystem.id,
  userId: 'user_123',
  status: 'completed',
  responses: {
    intended_use: 'Automated analysis of CT and MRI scans to assist radiologists.',
    gdpr_compliant: true,
    autonomous_decisions: false,
    documentation: true,
    override_capability: true,
    adversarial_testing: false,
    fundamental_rights: false,
  },
  currentSection: 6,
  createdAt: new Date('2024-01-15').toISOString(),
  completedAt: new Date('2024-01-20').toISOString(),
}

const mockScoringResult: ScoringResult = {
  score: 72,
  riskLevel: 'limited',
  categoryScores: {
    'system-info': 75,
    'risk-assessment': 67,
    'data-governance': 80,
    'transparency': 70,
    'human-oversight': 83,
    'security': 58,
  },
  recommendations: [
    {
      id: 'rec-adversarial',
      priority: 'high',
      title: 'Conduct Adversarial Testing',
      description: 'Adversarial robustness testing is required for high-risk AI systems.',
      category: 'Robustness & Security',
    },
  ],
  keyFindings: [
    'Overall compliance score of 72% indicates limited risk under the EU AI Act framework.',
    'Strong compliance in: Data Governance, Human Oversight.',
    'Gaps identified in: Robustness & Security — priority areas for remediation.',
    'GDPR compliance confirmed — meets EU data protection requirements for AI systems.',
  ],
}

const mockInput: ReportInput = {
  system: mockSystem,
  assessment: mockAssessment,
  scoringResult: mockScoringResult,
  jurisdiction: 'eu',
  reportId: 'RPT-2024-001',
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('generateTemplateReport', () => {
  it('returns a non-empty string', () => {
    const report = generateTemplateReport(mockInput)
    expect(typeof report).toBe('string')
    expect(report.length).toBeGreaterThan(100)
  })

  it('contains the system name', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('MediScan AI')
  })

  it('contains the overall score', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('72/100')
  })

  it('contains the risk level badge', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('Limited Risk')
  })

  it('contains the report ID', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('RPT-2024-001')
  })

  it('contains the assessment ID', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
  })

  it('contains all 6 section headers as markdown headings', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('System Information')
    expect(report).toContain('Risk Assessment')
    expect(report).toContain('Data Governance')
    expect(report).toContain('Transparency')
    expect(report).toContain('Human Oversight')
    expect(report).toContain('Robustness & Security')
  })

  it('contains the 6 required top-level section headings (## 1 through ## 7)', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('## 1. System Description')
    expect(report).toContain('## 2. Compliance Assessment Summary')
    expect(report).toContain('## 3. Key Findings')
    expect(report).toContain('## 4. Detailed Assessment Responses')
    expect(report).toContain('## 5. Recommendations')
    expect(report).toContain('## 6. Regulatory References')
    expect(report).toContain('## 7. Certification')
  })

  it('contains the recommendation title from scoring result', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('Conduct Adversarial Testing')
  })

  it('contains the key findings', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('Overall compliance score of 72%')
    expect(report).toContain('GDPR compliance confirmed')
  })

  it('contains the PQC certification section with ML-DSA-65', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('ML-DSA-65')
    expect(report).toContain('NIST FIPS 204')
  })

  it('contains the Hedera anchor reference', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('Hedera')
  })

  it('report markdown has a # h1 heading at the top', () => {
    const report = generateTemplateReport(mockInput)
    expect(report.trimStart()).toMatch(/^# /)
  })

  it('report has multiple ## h2 headings (well-formed markdown)', () => {
    const report = generateTemplateReport(mockInput)
    const h2Count = (report.match(/^## /gm) ?? []).length
    expect(h2Count).toBeGreaterThanOrEqual(6)
  })

  it('displays European Union as jurisdiction label for eu', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('European Union')
  })

  it('displays category score table with section titles and percentages', () => {
    const report = generateTemplateReport(mockInput)
    expect(report).toContain('75%')
    expect(report).toContain('80%')
    expect(report).toContain('83%')
  })

  it('shows Compliant status for categories scoring >= 75', () => {
    const report = generateTemplateReport(mockInput)
    // Data Governance = 80% → Compliant
    // Human Oversight = 83% → Compliant
    expect(report).toContain('Compliant')
  })

  it('shows Non-Compliant for categories scoring below 50', () => {
    const lowInput: ReportInput = {
      ...mockInput,
      scoringResult: {
        ...mockScoringResult,
        categoryScores: {
          ...mockScoringResult.categoryScores,
          security: 30,
        },
      },
    }
    const report = generateTemplateReport(lowInput)
    expect(report).toContain('Non-Compliant')
  })

  it('handles empty recommendations with fallback text', () => {
    const noRecInput: ReportInput = {
      ...mockInput,
      scoringResult: {
        ...mockScoringResult,
        recommendations: [],
      },
    }
    const report = generateTemplateReport(noRecInput)
    expect(report).toContain('No immediate recommendations')
  })

  it('handles empty key findings with fallback text', () => {
    const noFindingsInput: ReportInput = {
      ...mockInput,
      scoringResult: {
        ...mockScoringResult,
        keyFindings: [],
      },
    }
    const report = generateTemplateReport(noFindingsInput)
    expect(report).toContain('No critical findings identified')
  })

  it('shows In Progress for assessment without completedAt', () => {
    const inProgressInput: ReportInput = {
      ...mockInput,
      assessment: {
        ...mockAssessment,
        completedAt: undefined,
      },
    }
    const report = generateTemplateReport(inProgressInput)
    expect(report).toContain('In Progress')
  })
})

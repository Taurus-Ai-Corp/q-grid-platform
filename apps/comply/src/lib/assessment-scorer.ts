/**
 * EU AI Act assessment scoring engine.
 * Scores each section 0-100 using per-question weights (1-3), then averages sections.
 * Risk level: 0-25 = unacceptable, 26-50 = high, 51-75 = limited, 76-100 = minimal
 */

import { euAssessmentSections } from './assessment-sections'
import type { Recommendation } from './assessment-store'

export interface ScoringResult {
  score: number
  riskLevel: string
  categoryScores: Record<string, number>
  recommendations: Recommendation[]
  keyFindings: string[]
}

// Questions where "true" is a NEGATIVE signal (increases risk)
const RISK_BOOLEAN_QUESTIONS = new Set(['autonomous_decisions', 'fundamental_rights'])

// Questions where "true" is a POSITIVE signal (reduces risk)
const POSITIVE_BOOLEAN_QUESTIONS = new Set([
  'gdpr_compliant',
  'documentation',
  'override_capability',
  'adversarial_testing',
  'user_notification',
])

function scoreBoolean(questionId: string, value: boolean): number {
  if (RISK_BOOLEAN_QUESTIONS.has(questionId)) {
    return value ? 0 : 100
  }
  if (POSITIVE_BOOLEAN_QUESTIONS.has(questionId)) {
    return value ? 100 : 0
  }
  // Default: treat true as positive
  return value ? 100 : 0
}

function scoreText(value: string): number {
  const len = value.trim().length
  if (len < 20) return 25
  if (len < 50) return 50
  if (len < 100) return 75
  return 100
}

function scoreSelect(value: string, options: string[]): number {
  const idx = options.indexOf(value)
  if (idx === -1) return 0
  return Math.round(((idx + 1) / options.length) * 100)
}

function scoreQuestion(
  questionId: string,
  type: string,
  value: string | boolean | undefined,
  options?: string[],
): number {
  if (value === undefined || value === null || value === '') return 0
  if (type === 'boolean') {
    return scoreBoolean(questionId, value as boolean)
  }
  if (type === 'select' && options && options.length > 0) {
    return scoreSelect(String(value), options)
  }
  if (type === 'text' || type === 'select') {
    return scoreText(String(value))
  }
  return 0
}

function generateRecommendations(
  categoryScores: Record<string, number>,
  responses: Record<string, string | boolean>,
): Recommendation[] {
  const recs: Recommendation[] = []

  // System Information
  if ((categoryScores['system-info'] ?? 0) < 75) {
    recs.push({
      id: 'rec-system-docs',
      priority: 'high',
      title: 'Improve System Documentation',
      description:
        'Provide more detailed descriptions of intended use, deployment scope, and decision-making processes to meet EU AI Act technical documentation requirements.',
      category: 'System Information',
    })
  }

  // Risk Assessment
  if (responses['autonomous_decisions'] === true) {
    recs.push({
      id: 'rec-autonomous',
      priority: 'critical',
      title: 'Address Autonomous Decision-Making Risk',
      description:
        'Systems that make autonomous decisions require mandatory human oversight measures, robust testing, and may be classified as high-risk under EU AI Act Annex III.',
      category: 'Risk Assessment',
    })
  }
  if (responses['fundamental_rights'] === true) {
    recs.push({
      id: 'rec-fundamental-rights',
      priority: 'critical',
      title: 'Conduct Fundamental Rights Impact Assessment',
      description:
        'Systems impacting fundamental rights require a formal Fundamental Rights Impact Assessment (FRIA) under the EU AI Act before deployment.',
      category: 'Risk Assessment',
    })
  }
  if ((categoryScores['risk-assessment'] ?? 0) < 50) {
    recs.push({
      id: 'rec-risk-mitigation',
      priority: 'high',
      title: 'Strengthen Risk Mitigation Measures',
      description:
        'Document safety risks thoroughly and implement bias mitigation processes. The EU AI Act requires providers to identify and minimize foreseeable risks.',
      category: 'Risk Assessment',
    })
  }

  // Data Governance
  if (responses['gdpr_compliant'] === false) {
    recs.push({
      id: 'rec-gdpr',
      priority: 'critical',
      title: 'Establish GDPR Compliance',
      description:
        'GDPR compliance is mandatory for AI systems processing personal data in the EU. Engage a Data Protection Officer and conduct a Data Protection Impact Assessment.',
      category: 'Data Governance',
    })
  }
  if ((categoryScores['data-governance'] ?? 0) < 60) {
    recs.push({
      id: 'rec-data-quality',
      priority: 'medium',
      title: 'Implement Data Quality Framework',
      description:
        'Establish data governance practices including data quality metrics, lineage tracking, and documentation of training datasets per EU AI Act Article 10.',
      category: 'Data Governance',
    })
  }

  // Transparency
  if (responses['documentation'] === false) {
    recs.push({
      id: 'rec-tech-docs',
      priority: 'high',
      title: 'Create Technical Documentation',
      description:
        'Technical documentation is mandatory under EU AI Act Article 11 and Annex IV. It must cover system description, development process, risk management, and testing.',
      category: 'Transparency',
    })
  }
  if ((categoryScores['transparency'] ?? 0) < 60) {
    recs.push({
      id: 'rec-transparency',
      priority: 'medium',
      title: 'Enhance AI Transparency Measures',
      description:
        'Implement clear AI disclosure mechanisms to notify users when interacting with AI systems. EU AI Act Article 50 requires transparency for certain AI interactions.',
      category: 'Transparency',
    })
  }

  // Human Oversight
  if (responses['override_capability'] === false) {
    recs.push({
      id: 'rec-override',
      priority: 'high',
      title: 'Implement Human Override Capability',
      description:
        'Human oversight and override capability is a core requirement under EU AI Act Article 14. Operators must be able to intervene, suspend, or override AI outputs.',
      category: 'Human Oversight',
    })
  }
  if ((categoryScores['human-oversight'] ?? 0) < 60) {
    recs.push({
      id: 'rec-monitoring',
      priority: 'medium',
      title: 'Establish Ongoing Monitoring Programme',
      description:
        'Implement post-market monitoring per EU AI Act Article 72. Track performance metrics, document incidents, and conduct regular system reviews.',
      category: 'Human Oversight',
    })
  }

  // Security
  if (responses['adversarial_testing'] === false) {
    recs.push({
      id: 'rec-adversarial',
      priority: 'high',
      title: 'Conduct Adversarial Testing',
      description:
        'Adversarial robustness testing is required for high-risk AI systems. Test for data poisoning, model evasion, and adversarial examples per EU AI Act Article 15.',
      category: 'Robustness & Security',
    })
  }
  if ((categoryScores['security'] ?? 0) < 60) {
    recs.push({
      id: 'rec-security',
      priority: 'medium',
      title: 'Strengthen Cybersecurity Posture',
      description:
        'Implement comprehensive cybersecurity measures including access controls, encryption, and incident response. Document accuracy metrics and benchmarks for the system.',
      category: 'Robustness & Security',
    })
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  return recs.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3))
}

function generateKeyFindings(
  score: number,
  riskLevel: string,
  categoryScores: Record<string, number>,
  responses: Record<string, string | boolean>,
): string[] {
  const findings: string[] = []

  // Overall score finding
  const highCategories = Object.entries(categoryScores)
    .filter(([, s]) => s >= 75)
    .map(([id]) => euAssessmentSections.find((sec) => sec.id === id)?.title ?? id)
  const lowCategories = Object.entries(categoryScores)
    .filter(([, s]) => s < 50)
    .map(([id]) => euAssessmentSections.find((sec) => sec.id === id)?.title ?? id)

  if (riskLevel === 'minimal' || riskLevel === 'limited') {
    findings.push(
      `Overall compliance score of ${score}% indicates ${riskLevel} risk under the EU AI Act framework.`,
    )
  } else {
    findings.push(
      `Overall compliance score of ${score}% indicates ${riskLevel === 'high' ? 'high' : 'unacceptable'} risk — immediate action required before EU deployment.`,
    )
  }

  if (highCategories.length > 0) {
    findings.push(`Strong compliance in: ${highCategories.slice(0, 3).join(', ')}.`)
  }

  if (lowCategories.length > 0) {
    findings.push(`Gaps identified in: ${lowCategories.slice(0, 3).join(', ')} — priority areas for remediation.`)
  }

  // Key risk indicator findings
  const riskIndicatorQuestions = euAssessmentSections
    .flatMap((s) => s.questions)
    .filter((q) => q.riskIndicator === 'high')

  for (const q of riskIndicatorQuestions) {
    const val = responses[q.id]
    if (RISK_BOOLEAN_QUESTIONS.has(q.id) && val === true) {
      if (q.id === 'autonomous_decisions') {
        findings.push('Autonomous decision-making detected — Annex III high-risk classification may apply.')
      } else if (q.id === 'fundamental_rights') {
        findings.push('Fundamental rights impact identified — Fundamental Rights Impact Assessment (FRIA) required.')
      }
    }
  }

  if (responses['gdpr_compliant'] === false) {
    findings.push('GDPR non-compliance is a critical blocker — must be resolved before EU market deployment.')
  } else if (responses['gdpr_compliant'] === true) {
    findings.push('GDPR compliance confirmed — meets EU data protection requirements for AI systems.')
  }

  return findings.slice(0, 4)
}

export function scoreAssessment(
  responses: Record<string, string | boolean>,
  _jurisdiction?: string,
): ScoringResult {
  const categoryScores: Record<string, number> = {}

  for (const section of euAssessmentSections) {
    let weightedSum = 0
    let totalWeight = 0

    for (const q of section.questions) {
      const w = q.weight ?? 1
      const rawScore = scoreQuestion(q.id, q.type, responses[q.id], q.options)
      weightedSum += rawScore * w
      totalWeight += w
    }

    categoryScores[section.id] = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  }

  const sectionIds = euAssessmentSections.map((s) => s.id)
  const overallScore = Math.round(
    sectionIds.reduce((sum, id) => sum + (categoryScores[id] ?? 0), 0) / sectionIds.length,
  )

  let riskLevel: string
  if (overallScore <= 25) riskLevel = 'unacceptable'
  else if (overallScore <= 50) riskLevel = 'high'
  else if (overallScore <= 75) riskLevel = 'limited'
  else riskLevel = 'minimal'

  const recommendations = generateRecommendations(categoryScores, responses)
  const keyFindings = generateKeyFindings(overallScore, riskLevel, categoryScores, responses)

  return {
    score: overallScore,
    riskLevel,
    categoryScores,
    recommendations,
    keyFindings,
  }
}

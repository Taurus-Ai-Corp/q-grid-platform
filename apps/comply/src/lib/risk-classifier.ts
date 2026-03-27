/**
 * EU AI Act risk classification — rule-based (Annex III + Article 5)
 */
export function classifyRisk(useCase: string, industry: string, autonomyLevel: string): string {
  const text = `${useCase} ${industry}`.toLowerCase()

  // Unacceptable risk — Article 5 prohibited practices
  if (
    text.includes('social scoring') ||
    text.includes('subliminal') ||
    text.includes('manipulation') ||
    text.includes('real-time biometric surveillance')
  ) {
    return 'unacceptable'
  }

  // High risk — Annex III categories
  const highRiskKeywords = [
    'healthcare', 'medical', 'health', 'finance', 'banking', 'insurance',
    'government', 'defense', 'law enforcement', 'justice', 'education',
    'employment', 'hiring', 'migration', 'border', 'critical infrastructure',
    'energy', 'water', 'transport', 'electoral', 'voting',
  ]
  if (highRiskKeywords.some((k) => text.includes(k))) return 'high'
  if (autonomyLevel === 'fully-autonomous') return 'high'

  // Limited risk — transparency obligations
  const limitedRiskKeywords = [
    'chatbot', 'customer service', 'content generation',
    'deepfake', 'emotion recognition', 'recommendation',
  ]
  if (limitedRiskKeywords.some((k) => text.includes(k))) return 'limited'

  // Minimal risk — all other AI systems
  return 'minimal'
}

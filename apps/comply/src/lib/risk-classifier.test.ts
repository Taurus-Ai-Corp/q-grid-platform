import { describe, it, expect } from 'vitest'
import { classifyRisk } from './risk-classifier'

describe('classifyRisk — EU AI Act Annex III + Article 5', () => {
  // Unacceptable risk — Article 5 prohibited practices
  it('classifies social scoring as unacceptable', () => {
    expect(classifyRisk('social scoring system', 'government', 'advisory')).toBe('unacceptable')
  })

  it('classifies subliminal manipulation as unacceptable', () => {
    expect(classifyRisk('subliminal advertising', 'marketing', 'advisory')).toBe('unacceptable')
  })

  it('classifies real-time biometric surveillance as unacceptable', () => {
    expect(classifyRisk('real-time biometric surveillance', 'law enforcement', 'advisory')).toBe(
      'unacceptable',
    )
  })

  // High risk — Annex III categories (industry keywords)
  it('classifies healthcare industry as high', () => {
    expect(classifyRisk('diagnostic tool', 'healthcare', 'advisory')).toBe('high')
  })

  it('classifies finance industry as high', () => {
    expect(classifyRisk('credit scoring', 'finance', 'advisory')).toBe('high')
  })

  it('classifies government industry as high', () => {
    expect(classifyRisk('public service automation', 'government', 'advisory')).toBe('high')
  })

  it('classifies banking use case as high', () => {
    expect(classifyRisk('banking fraud detection', 'technology', 'advisory')).toBe('high')
  })

  it('classifies law enforcement use case as high', () => {
    expect(classifyRisk('law enforcement prediction', 'other', 'advisory')).toBe('high')
  })

  it('classifies employment/hiring use case as high', () => {
    expect(classifyRisk('hiring screening tool', 'employment', 'advisory')).toBe('high')
  })

  // High risk — autonomy level override
  it('classifies fully-autonomous autonomy level as high regardless of industry', () => {
    expect(classifyRisk('generic assistant', 'other', 'fully-autonomous')).toBe('high')
  })

  it('classifies fully-autonomous even with benign use case', () => {
    expect(classifyRisk('weather prediction', 'technology', 'fully-autonomous')).toBe('high')
  })

  // Limited risk — transparency obligations
  it('classifies chatbot use case as limited', () => {
    expect(classifyRisk('chatbot for customer queries', 'technology', 'advisory')).toBe('limited')
  })

  it('classifies customer service use case as limited', () => {
    expect(classifyRisk('customer service automation', 'retail', 'advisory')).toBe('limited')
  })

  it('classifies content generation use case as limited', () => {
    expect(classifyRisk('content generation platform', 'media', 'advisory')).toBe('limited')
  })

  it('classifies deepfake detection use case as limited', () => {
    expect(classifyRisk('deepfake identification tool', 'technology', 'semi-autonomous')).toBe(
      'limited',
    )
  })

  // Minimal risk — all other AI systems
  it('classifies generic productivity tool as minimal', () => {
    expect(classifyRisk('productivity assistant', 'technology', 'advisory')).toBe('minimal')
  })

  it('classifies empty strings as minimal (default)', () => {
    expect(classifyRisk('', '', 'advisory')).toBe('minimal')
  })

  it('classifies other/unknown industry with benign use case as minimal', () => {
    expect(classifyRisk('inventory forecasting', 'other', 'semi-autonomous')).toBe('minimal')
  })
})

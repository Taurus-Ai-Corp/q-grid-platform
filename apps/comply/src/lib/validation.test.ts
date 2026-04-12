import { describe, it, expect } from 'vitest'
import {
  createSystemSchema,
  createAssessmentSchema,
  updateAssessmentSchema,
  createReportSchema,
} from './validation'

describe('createSystemSchema', () => {
  it('accepts a valid minimal system (name only)', () => {
    const result = createSystemSchema.safeParse({ name: 'My AI System' })
    expect(result.success).toBe(true)
  })

  it('applies default values for optional fields', () => {
    const result = createSystemSchema.safeParse({ name: 'Test System' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.industry).toBe('other')
      expect(result.data.deploymentScope).toBe('internal')
      expect(result.data.autonomyLevel).toBe('advisory')
      expect(result.data.description).toBe('')
      expect(result.data.useCase).toBe('')
    }
  })

  it('accepts all valid industry enum values', () => {
    const industries = [
      'healthcare', 'finance', 'government', 'defense',
      'education', 'employment', 'technology', 'other',
    ] as const
    for (const industry of industries) {
      const result = createSystemSchema.safeParse({ name: 'System', industry })
      expect(result.success).toBe(true)
    }
  })

  it('rejects empty name', () => {
    const result = createSystemSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name longer than 200 characters', () => {
    const result = createSystemSchema.safeParse({ name: 'A'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('accepts name at the 200 character limit', () => {
    const result = createSystemSchema.safeParse({ name: 'A'.repeat(200) })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid industry value', () => {
    const result = createSystemSchema.safeParse({ name: 'System', industry: 'agriculture' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid deploymentScope value', () => {
    const result = createSystemSchema.safeParse({ name: 'System', deploymentScope: 'global' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid deploymentScope values', () => {
    for (const scope of ['internal', 'external', 'both'] as const) {
      const result = createSystemSchema.safeParse({ name: 'System', deploymentScope: scope })
      expect(result.success).toBe(true)
    }
  })

  it('rejects an invalid autonomyLevel value', () => {
    const result = createSystemSchema.safeParse({ name: 'System', autonomyLevel: 'robot' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid autonomyLevel values', () => {
    for (const level of ['advisory', 'semi-autonomous', 'fully-autonomous'] as const) {
      const result = createSystemSchema.safeParse({ name: 'System', autonomyLevel: level })
      expect(result.success).toBe(true)
    }
  })

  it('rejects description longer than 2000 characters', () => {
    const result = createSystemSchema.safeParse({ name: 'System', description: 'A'.repeat(2001) })
    expect(result.success).toBe(false)
  })
})

describe('createAssessmentSchema', () => {
  it('accepts a valid UUID systemId', () => {
    const result = createAssessmentSchema.safeParse({
      systemId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-UUID systemId', () => {
    const result = createAssessmentSchema.safeParse({ systemId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects missing systemId', () => {
    const result = createAssessmentSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects empty string systemId', () => {
    const result = createAssessmentSchema.safeParse({ systemId: '' })
    expect(result.success).toBe(false)
  })
})

describe('updateAssessmentSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    const result = updateAssessmentSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts valid responses record with mixed string and boolean values', () => {
    const result = updateAssessmentSchema.safeParse({
      responses: {
        intended_use: 'Healthcare triage tool',
        gdpr_compliant: true,
        autonomous_decisions: false,
      },
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid status values', () => {
    for (const status of ['draft', 'in_progress', 'completed'] as const) {
      const result = updateAssessmentSchema.safeParse({ status })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid status value', () => {
    const result = updateAssessmentSchema.safeParse({ status: 'archived' })
    expect(result.success).toBe(false)
  })

  it('accepts currentSection within 0-20 range', () => {
    expect(updateAssessmentSchema.safeParse({ currentSection: 0 }).success).toBe(true)
    expect(updateAssessmentSchema.safeParse({ currentSection: 10 }).success).toBe(true)
    expect(updateAssessmentSchema.safeParse({ currentSection: 20 }).success).toBe(true)
  })

  it('rejects currentSection out of range', () => {
    expect(updateAssessmentSchema.safeParse({ currentSection: -1 }).success).toBe(false)
    expect(updateAssessmentSchema.safeParse({ currentSection: 21 }).success).toBe(false)
  })
})

describe('createReportSchema', () => {
  it('accepts a valid minimal report (assessmentId only)', () => {
    const result = createReportSchema.safeParse({
      assessmentId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('defaults mode to template', () => {
    const result = createReportSchema.safeParse({
      assessmentId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.mode).toBe('template')
    }
  })

  it('accepts all valid mode values', () => {
    for (const mode of ['template', 'cloud', 'sovereign'] as const) {
      const result = createReportSchema.safeParse({
        assessmentId: '550e8400-e29b-41d4-a716-446655440000',
        mode,
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid mode value', () => {
    const result = createReportSchema.safeParse({
      assessmentId: '550e8400-e29b-41d4-a716-446655440000',
      mode: 'ai',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID assessmentId', () => {
    const result = createReportSchema.safeParse({ assessmentId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('accepts a valid sovereignEndpoint URL', () => {
    const result = createReportSchema.safeParse({
      assessmentId: '550e8400-e29b-41d4-a716-446655440000',
      mode: 'sovereign',
      sovereignEndpoint: 'http://localhost:11434',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for sovereignEndpoint (not set)', () => {
    const result = createReportSchema.safeParse({
      assessmentId: '550e8400-e29b-41d4-a716-446655440000',
      sovereignEndpoint: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid URL for sovereignEndpoint', () => {
    const result = createReportSchema.safeParse({
      assessmentId: '550e8400-e29b-41d4-a716-446655440000',
      sovereignEndpoint: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('rejects sovereignModel longer than 100 characters', () => {
    const result = createReportSchema.safeParse({
      assessmentId: '550e8400-e29b-41d4-a716-446655440000',
      sovereignModel: 'A'.repeat(101),
    })
    expect(result.success).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { CreateMetricSchema, UpdateMetricSchema, MetricIdSchema } from '@/lib/validations/metrics'

describe('CreateMetricSchema', () => {
  it('should validate correct metric data', () => {
    const validData = {
      type: 'CPU Usage',
      value: 75.5,
      unit: 'percentage' as const
    }
    
    expect(() => CreateMetricSchema.parse(validData)).not.toThrow()
  })

  it('should reject empty type', () => {
    const invalidData = {
      type: '',
      value: 75.5,
      unit: 'percentage' as const
    }
    
    expect(() => CreateMetricSchema.parse(invalidData)).toThrow()
  })

  it('should reject type with invalid characters', () => {
    const invalidData = {
      type: 'CPU Usage <script>',
      value: 75.5,
      unit: 'percentage' as const
    }
    
    expect(() => CreateMetricSchema.parse(invalidData)).toThrow()
  })

  it('should reject invalid metric unit', () => {
    const invalidData = {
      type: 'CPU Usage',
      value: 75.5,
      unit: 'invalid_unit' as any
    }
    
    expect(() => CreateMetricSchema.parse(invalidData)).toThrow()
  })

  it('should reject infinite values', () => {
    const invalidData = {
      type: 'CPU Usage',
      value: Infinity,
      unit: 'percentage' as const
    }
    
    expect(() => CreateMetricSchema.parse(invalidData)).toThrow()
  })
})

describe('UpdateMetricSchema', () => {
  it('should validate correct update data', () => {
    const validData = { value: 80.5 }
    expect(() => UpdateMetricSchema.parse(validData)).not.toThrow()
  })

  it('should reject invalid values', () => {
    expect(() => UpdateMetricSchema.parse({ value: NaN })).toThrow()
    expect(() => UpdateMetricSchema.parse({ value: Infinity })).toThrow()
  })
})

describe('MetricIdSchema', () => {
  it('should validate correct UUID', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000'
    expect(() => MetricIdSchema.parse(validUuid)).not.toThrow()
  })

  it('should reject invalid UUID format', () => {
    expect(() => MetricIdSchema.parse('invalid-uuid')).toThrow()
    expect(() => MetricIdSchema.parse('123')).toThrow()
    expect(() => MetricIdSchema.parse('')).toThrow()
  })
})
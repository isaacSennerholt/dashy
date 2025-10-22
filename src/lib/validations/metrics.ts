import { z } from 'zod'

export const MetricUnitSchema = z.enum([
  'percentage',
  'temperature', 
  'count',
  'bytes',
  'seconds',
  'milliseconds',
  'currency'
])

export const CreateMetricSchema = z.object({
  type: z.string()
    .min(1, 'Metric type is required')
    .max(100, 'Metric type must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Metric type contains invalid characters'),
  value: z.number()
    .finite('Value must be a valid number')
    .min(Number.MIN_SAFE_INTEGER, 'Value is too small')
    .max(Number.MAX_SAFE_INTEGER, 'Value is too large'),
  unit: MetricUnitSchema
})

export const UpdateMetricSchema = z.object({
  value: z.number()
    .finite('Value must be a valid number')
    .min(Number.MIN_SAFE_INTEGER, 'Value is too small')
    .max(Number.MAX_SAFE_INTEGER, 'Value is too large')
})

export const MetricIdSchema = z.string()
  .uuid('Invalid metric ID format')

export type CreateMetricInput = z.infer<typeof CreateMetricSchema>
export type UpdateMetricInput = z.infer<typeof UpdateMetricSchema>
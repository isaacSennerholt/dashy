export interface Metric {
  id: string
  type: string
  value: number
  unit: MetricUnit
  created_at: string
  updated_at: string
  created_by?: string
}

export interface MetricHistory {
  id: string
  metric_id: string
  value: number
  created_at: string
  created_by: string
  user_alias?: string
}

export type MetricUnit = 
  | 'percentage'
  | 'temperature'
  | 'count'
  | 'bytes'
  | 'seconds'
  | 'milliseconds'
  | 'currency'


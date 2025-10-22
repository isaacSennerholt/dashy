'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/providers/supabase-provider'

export function useMetricHistory(metricId: string) {
  const { supabase } = useSupabase()

  return useQuery({
    queryKey: ['metric-history', metricId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metric_history')
        .select('value, created_at')
        .eq('metric_id', metricId)
        .order('created_at', { ascending: true })
        .limit(20)

      if (error) throw error
      return data?.map(item => ({
        value: item.value,
        time: item.created_at
      })) || []
    },
    enabled: !!metricId
  })
}

export function useMetricHistoryDetailed(metricId: string, enabled: boolean = true) {
  const { supabase } = useSupabase()

  return useQuery({
    queryKey: ['metric-history-detailed', metricId],
    queryFn: async () => {
      const { data: history, error } = await supabase
        .from('metric_history')
        .select(`
          *,
          user_profiles!metric_history_created_by_fkey(alias)
        `)
        .eq('metric_id', metricId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const values = history?.map(h => h.value) || []
      const minValue = values.length > 0 ? Math.min(...values) : 0
      const maxValue = values.length > 0 ? Math.max(...values) : 0

      return {
        history: history || [],
        stats: {
          min: minValue,
          max: maxValue,
          count: history?.length || 0
        }
      }
    },
    enabled: enabled && !!metricId
  })
}
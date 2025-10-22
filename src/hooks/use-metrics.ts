'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/providers/supabase-provider'
import { useMetricOrdering } from './use-metric-ordering'
import type { Metric } from '@/types/metrics'
import { CreateMetricSchema, UpdateMetricSchema } from '@/lib/validations/metrics'
import type { CreateMetricInput, UpdateMetricInput } from '@/lib/validations/metrics'
import { sanitizeString, sanitizeNumber } from '@/lib/security/sanitize'

export function useMetrics() {
  const { supabase, user } = useSupabase()

  return useQuery({
    queryKey: ['metrics', user?.id],
    queryFn: async (): Promise<Metric[]> => {
      const { data, error } = await supabase
        .from('metrics')
        .select(`
          *,
          user_profiles!metrics_created_by_fkey(alias)
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error
      
      return data || []
    }
  })
}

// Separate hook to get ordered metrics for display
export function useOrderedMetrics() {
  const { user } = useSupabase()
  const { data: metrics = [] } = useMetrics()
  const { data: userOrdering = [] } = useMetricOrdering()

  // Apply user's custom ordering if available
  if (user && userOrdering.length > 0) {
    const orderedMetrics: Metric[] = []
    const unorderedMetrics: Metric[] = []
    
    // Create a map for quick lookup
    const orderMap = new Map(userOrdering.map(order => [order.metric_id, order.order_index]))
    
    // Separate ordered and unordered metrics
    metrics.forEach(metric => {
      if (orderMap.has(metric.id)) {
        orderedMetrics.push(metric)
      } else {
        unorderedMetrics.push(metric)
      }
    })
    
    // Sort ordered metrics by their order_index
    orderedMetrics.sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 0
      const orderB = orderMap.get(b.id) ?? 0
      return orderA - orderB
    })
    
    // Return ordered metrics first, then unordered (new) metrics
    return [...orderedMetrics, ...unorderedMetrics]
  }
  
  // Default ordering for users without custom order
  return metrics
}

export function useCreateMetric() {
  const { supabase, user } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateMetricInput) => {
      if (!user) throw new Error('Not authenticated')

      // Validate input
      const validatedData = CreateMetricSchema.parse(data)
      
      // Sanitize inputs
      const sanitizedType = sanitizeString(validatedData.type)
      const sanitizedValue = sanitizeNumber(validatedData.value)

      const { data: metric, error } = await supabase
        .from('metrics')
        .insert([{
          type: sanitizedType,
          value: sanitizedValue,
          unit: validatedData.unit,
          created_by: user.id
        }])
        .select()
        .single()

      if (error) throw error
      return metric
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
    }
  })
}

export function useUpdateMetric() {
  const { supabase, user } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMetricInput }) => {
      if (!user) throw new Error('Not authenticated')

      // Validate inputs
      const validatedData = UpdateMetricSchema.parse(data)
      const sanitizedValue = sanitizeNumber(validatedData.value)

      const { data: updatedMetric, error } = await supabase
        .from('metrics')
        .update({ 
          value: sanitizedValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('created_by', user.id) // Ensure user can only update their own metrics
        .select()

      if (error) {
        // Handle specific error when no rows are updated
        if (error.code === 'PGRST116') {
          throw new Error('Metric not found or you do not have permission to update it')
        }
        throw error
      }

      if (!updatedMetric || updatedMetric.length === 0) {
        throw new Error('Metric not found or you do not have permission to update it')
      }

      const metric = Array.isArray(updatedMetric) ? updatedMetric[0] : updatedMetric

      // History is automatically created by database trigger
      return metric
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      queryClient.invalidateQueries({ queryKey: ['metric-history', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['metric-history-detailed', variables.id] })
    }
  })
}
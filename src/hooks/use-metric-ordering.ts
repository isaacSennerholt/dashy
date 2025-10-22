'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/providers/supabase-provider'

export interface MetricOrder {
  metric_id: string
  order_index: number
}

export function useMetricOrdering() {
  const { supabase, user } = useSupabase()

  return useQuery({
    queryKey: ['metric-ordering', user?.id],
    queryFn: async (): Promise<MetricOrder[]> => {
      if (!user) return []

      const { data, error } = await supabase
        .from('user_metric_orders')
        .select('metric_id, order_index')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user
  })
}

export function useUpdateMetricOrdering() {
  const { supabase, user } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orders: MetricOrder[]) => {
      if (!user) throw new Error('Not authenticated')

      // Delete existing orders for this user
      const { error: deleteError } = await supabase
        .from('user_metric_orders')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      // Insert new orders
      if (orders.length > 0) {
        const ordersToInsert = orders.map((order, index) => ({
          user_id: user.id,
          metric_id: order.metric_id,
          order_index: index
        }))

        const { error: insertError } = await supabase
          .from('user_metric_orders')
          .insert(ordersToInsert)

        if (insertError) throw insertError
      }

      return orders
    },
    onSuccess: () => {
      // Only invalidate metric-ordering query, not metrics
      // The metrics cache is already optimistically updated
      queryClient.invalidateQueries({ queryKey: ['metric-ordering', user?.id] })
    }
  })
}
'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/providers/supabase-provider'
import { logDebug } from '@/lib/logger'

export function useRealtimeMetrics() {
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Subscribe to metrics table changes
    const metricsSubscription = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'metrics' 
        },
        (payload) => {
          logDebug('Metrics realtime update received', payload, 'useRealtimeMetrics')
          
          // Invalidate metrics query to refetch data
          queryClient.invalidateQueries({ queryKey: ['metrics'] })
          
          // If it's an update to a specific metric, also invalidate its history
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({ 
              queryKey: ['metric-history', payload.new.id] 
            })
            queryClient.invalidateQueries({ 
              queryKey: ['metric-history-detailed', payload.new.id] 
            })
          }
        }
      )
      .subscribe()

    // Subscribe to metric_history table changes
    const historySubscription = supabase
      .channel('history-changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'metric_history' 
        },
        (payload) => {
          logDebug('History realtime update received', payload, 'useRealtimeMetrics')
          
          // Invalidate specific metric history queries
          if (payload.new && typeof payload.new === 'object' && 'metric_id' in payload.new) {
            queryClient.invalidateQueries({ 
              queryKey: ['metric-history', payload.new.metric_id] 
            })
            queryClient.invalidateQueries({ 
              queryKey: ['metric-history-detailed', payload.new.metric_id] 
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(metricsSubscription)
      supabase.removeChannel(historySubscription)
    }
  }, [supabase, queryClient])
}
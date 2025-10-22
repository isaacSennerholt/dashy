'use client'

import { useState } from 'react'
import { DndContext, closestCenter, DragEndEvent, MeasuringStrategy } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { MetricCard } from '@/components/metrics/metric-card'
import { MetricsErrorBoundary } from '@/components/metrics/metrics-error-boundary'
import { useMetrics, useOrderedMetrics } from '@/hooks/use-metrics'
import { useUpdateMetricOrdering } from '@/hooks/use-metric-ordering'
import { useSupabase } from '@/providers/supabase-provider'
import { useQueryClient } from '@tanstack/react-query'
import { logException } from '@/lib/logger'

export function MetricsGrid() {
  const { isLoading, error } = useMetrics()
  const metrics = useOrderedMetrics()
  const { user } = useSupabase()
  const updateMetricOrdering = useUpdateMetricOrdering()
  const queryClient = useQueryClient()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setIsDragging(false)

    if (!over || !user || active.id === over.id) {
      return
    }

    const oldIndex = metrics.findIndex(metric => metric.id === active.id)
    const newIndex = metrics.findIndex(metric => metric.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Create new order array
    const reorderedMetrics = [...metrics]
    const [movedMetric] = reorderedMetrics.splice(oldIndex, 1)
    reorderedMetrics.splice(newIndex, 0, movedMetric)

    // Optimistic update - immediately update the UI
    queryClient.setQueryData(['metrics', user?.id], reorderedMetrics)

    // Create order data for database
    const newOrdering = reorderedMetrics.map((metric, index) => ({
      metric_id: metric.id,
      order_index: index
    }))

    // Update ordering in database
    try {
      await updateMetricOrdering.mutateAsync(newOrdering)
    } catch (error) {
      logException(error as Error, 'MetricsGrid.handleDragEnd', { userId: user?.id })
      // Revert optimistic update on error
      queryClient.setQueryData(['metrics', user?.id], metrics)
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="h-48 bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-red-500">
        Error loading metrics: {error.message}
      </div>
    )
  }

  if (metrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <p className="text-lg mb-2">No metrics found</p>
        <p className="text-sm">Create your first metric to get started!</p>
      </div>
    )
  }

  // For authenticated users, enable drag and drop
  if (user) {
    return (
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        // Better touch support for mobile
        autoScroll={{ threshold: { x: 0.2, y: 0.2 } }}
        // Improve drop animation smoothness
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <SortableContext items={metrics.map(m => m.id)} strategy={rectSortingStrategy}>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${isDragging ? 'select-none' : ''}`}>
            {metrics.map((metric) => (
              <MetricsErrorBoundary key={metric.id}>
                <MetricCard metric={metric} isDraggable={true} />
              </MetricsErrorBoundary>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    )
  }

  // For unauthenticated users, show static grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <MetricsErrorBoundary key={metric.id}>
          <MetricCard metric={metric} isDraggable={false} />
        </MetricsErrorBoundary>
      ))}
    </div>
  )
}
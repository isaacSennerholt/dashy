'use client'

import { useState, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, History, TrendingUp, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Metric } from '@/types/metrics'
import { Sparkline } from '@/components/metrics/sparkline'
import { EditMetricModal } from '@/components/metrics/edit-metric-modal'
import { MetricHistoryModal } from '@/components/metrics/metric-history-modal'
import { useSupabase } from '@/providers/supabase-provider'
import { formatValue } from '@/lib/format'

interface MetricCardProps {
  metric: Metric
  isDraggable?: boolean
}

function MetricCardComponent({ metric, isDraggable = false }: MetricCardProps) {
  const { user } = useSupabase()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // Check if current user can edit this metric
  const canEditMetric = user && user.id === metric.created_by

  // Drag and drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: metric.id,
    disabled: !isDraggable,
    animateLayoutChanges: () => true, // Always animate layout changes for smooth transitions
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    // Use custom transition for smoother drop animation, but respect @dnd-kit's transition during drag
    transition: isDragging 
      ? transition // Use @dnd-kit's transition during active drag
      : 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smoother easing for drops
    opacity: isDragging ? 0.5 : 1
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  return (
    <>
      <Card 
        ref={setNodeRef}
        style={style}
        className={`${isDragging ? 'z-50' : ''}`}
        role="article" 
        aria-label={`Metric card for ${metric.type}`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isDraggable ? (
                <button 
                  className="touch-none text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing"
                  {...attributes}
                  {...listeners}
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              ) : null}
              {metric.type}
            </span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-4">
          <div className="text-3xl font-bold" aria-label={`Current value: ${formatValue(metric.value, metric.unit)}`}>
            {formatValue(metric.value, metric.unit)}
          </div>
          
          <div>
            <Sparkline metricId={metric.id} />
          </div>
          
          <div className="flex gap-2">
            {canEditMetric ? (
              <Button 
                variant="outline" 
                size="sm" 
                className={canEditMetric ? "flex-1" : ""}
                onClick={handleEditClick}
                aria-label={`Edit ${metric.type} metric`}
              >
                <Edit className="h-3 w-3 mr-1" aria-hidden="true" />
                Edit
              </Button>
            ) : null}
            <Button 
              variant="outline" 
              size="sm" 
              className={canEditMetric ? "flex-1" : "w-full"}
              onClick={() => setShowHistoryModal(true)}
              aria-label={`View history for ${metric.type} metric`}
            >
              <History className="h-3 w-3 mr-1" aria-hidden="true" />
              History
            </Button>
          </div>
        </CardContent>
      </Card>

      {canEditMetric ? (
        <EditMetricModal
          metric={metric}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={() => setShowEditModal(false)}
        />
      ) : null}

      <MetricHistoryModal
        metricId={metric.id}
        metricType={metric.type}
        metricUnit={metric.unit}
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
      />

    </>
  )
}

export const MetricCard = memo(MetricCardComponent)
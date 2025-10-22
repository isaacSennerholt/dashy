'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useMetricHistoryDetailed } from '@/hooks/use-metric-history'
import type { MetricHistory, MetricUnit } from '@/types/metrics'
import { format } from 'date-fns'
import { formatValue } from '@/lib/format'

interface MetricHistoryModalProps {
  metricId: string
  metricType: string
  metricUnit: MetricUnit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MetricHistoryModal({ metricId, metricType, metricUnit, open, onOpenChange }: MetricHistoryModalProps) {
  const { data, isLoading, error } = useMetricHistoryDetailed(metricId, open)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp')
    } catch {
      return dateString
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{metricType}</DialogTitle>
          <DialogDescription>
            View the complete history and changes for this metric over time
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading history...</div>
          </div>
        ) : null}

        {error ? (
          <div className="text-red-500 text-center py-8">
            Error loading history: {error.message}
          </div>
        ) : null}

        {data ? (
          <div className="space-y-6">
            {/* Statistics */}
            <div 
              className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg"
              role="region"
              aria-label="Metric statistics summary"
            >
              <div className="text-center">
                <div 
                  className="text-2xl font-bold" 
                  aria-label={`Minimum value: ${formatValue(data.stats.min, metricUnit)}`}
                >
                  {formatValue(data.stats.min, metricUnit)}
                </div>
                <div className="text-sm text-muted-foreground">Minimum</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-bold"
                  aria-label={`Maximum value: ${formatValue(data.stats.max, metricUnit)}`}
                >
                  {formatValue(data.stats.max, metricUnit)}
                </div>
                <div className="text-sm text-muted-foreground">Maximum</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-bold"
                  aria-label={`Total records: ${data.stats.count}`}
                >
                  {data.stats.count}
                </div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
            </div>

            {/* History List */}
            <div className="space-y-2">
              <h3 className="font-semibold">History</h3>
              
              {data.history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No history records found
                </div>
              ) : (
                <div 
                  className="space-y-2 max-h-96 overflow-y-auto"
                  role="log"
                  aria-label="Metric history entries"
                  tabIndex={0}
                >
                  {data.history.map((record: MetricHistory & { user_profiles?: { alias: string } }) => (
                    <div 
                      key={record.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                      role="article"
                      aria-label={`History entry: ${formatValue(record.value, metricUnit)} updated by ${record.user_profiles?.alias ?? 'Unknown'}`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{formatValue(record.value, metricUnit)}</div>
                        <div className="text-sm text-muted-foreground">
                          Updated by: {record.user_profiles?.alias ?? 'Unknown'}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {formatDate(record.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateMetric } from '@/hooks/use-metrics'
import { Metric } from '@/types/metrics'

interface EditMetricModalProps {
  metric: Metric
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditMetricModal({ metric, open, onOpenChange, onSuccess }: EditMetricModalProps) {
  const [value, setValue] = useState(metric.value)
  const updateMetricMutation = useUpdateMetric()
  const valueInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMetricMutation.mutate({ 
      id: metric.id, 
      data: { value } 
    }, {
      onSuccess: () => {
        onSuccess?.()
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setValue(metric.value)
    }
    onOpenChange(newOpen)
  }

  // Focus management when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the modal is fully rendered
      const timeoutId = setTimeout(() => {
        valueInputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {metric.type}</DialogTitle>
          <DialogDescription>
            Update the value and details for this metric
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Metric Type</Label>
            <div className="p-2 bg-muted rounded-md text-sm">
              {metric.type}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <div className="p-2 bg-muted rounded-md text-sm capitalize">
              {metric.unit}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">New Value</Label>
            <Input
              ref={valueInputRef}
              id="value"
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {updateMetricMutation.error && (
            <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded p-3">
              {updateMetricMutation.error.message}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={updateMetricMutation.isPending}
            >
              {updateMetricMutation.isPending ? 'Updating...' : 'Update Metric'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
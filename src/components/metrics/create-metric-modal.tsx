'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateMetric } from '@/hooks/use-metrics'
import type { CreateMetricInput } from '@/lib/validations/metrics'
import type { MetricUnit } from '@/types/metrics'

interface CreateMetricModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const metricUnits: { value: MetricUnit; label: string }[] = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'temperature', label: 'Temperature (°C)' },
  { value: 'count', label: 'Count' },
  { value: 'bytes', label: 'Bytes' },
  { value: 'seconds', label: 'Seconds' },
  { value: 'milliseconds', label: 'Milliseconds' },
  { value: 'currency', label: 'Currency ($)' },
]

export function CreateMetricModal({ open, onOpenChange, onSuccess }: CreateMetricModalProps) {
  const [formData, setFormData] = useState<CreateMetricInput>({
    type: '',
    value: 0,
    unit: 'count'
  })

  const createMetricMutation = useCreateMetric()
  const typeInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFormData({
      type: '',
      value: 0,
      unit: 'count'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMetricMutation.mutate(formData, {
      onSuccess: () => {
        resetForm()
        onSuccess?.()
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  // Focus management when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the modal is fully rendered
      const timeoutId = setTimeout(() => {
        typeInputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Metric</DialogTitle>
          <DialogDescription>
            Add a new metric to track and monitor in your dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Metric Type</Label>
            <Input
              ref={typeInputRef}
              id="type"
              type="text"
              placeholder="e.g., CPU Usage, Response Time, Active Users"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select
              value={formData.unit}
              onValueChange={(value: MetricUnit) => setFormData(prev => ({ ...prev, unit: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {metricUnits.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {createMetricMutation.error ? (
            <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded p-3">
              {createMetricMutation.error.message}
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={createMetricMutation.isPending}
            >
              {createMetricMutation.isPending ? 'Creating...' : 'Create Metric'}
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
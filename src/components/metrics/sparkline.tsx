'use client'

import { memo } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis } from 'recharts'
import { useMetricHistory } from '@/hooks/use-metric-history'

interface SparklineProps {
  metricId: string
}

function SparklineComponent({ metricId }: SparklineProps) {
  const { data: history = [] } = useMetricHistory(metricId)

  if (history.length === 0) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center text-xs text-muted-foreground"
        role="img"
        aria-label="No historical data available for this metric"
      >
        No history data
      </div>
    )
  }

  // Compute y-domain with padding to avoid clipping
  const values = history.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const padding = range * 0.2 || 1 // 20% or fallback

  const domain = [min - padding, max + padding]

  return (
    <div 
      role="img" 
      aria-label={`Sparkline chart showing ${history.length} data points for metric history`}
      className="w-full h-full flex items-center justify-center"
    >
      <ResponsiveContainer width="100%" height={80}>
        <LineChart
          data={history}
          margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {/* Hide axes but control domain for centering */}
          <YAxis
            type="number"
            domain={domain}
            hide
          />
          <XAxis dataKey="timestamp" hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const Sparkline = memo(SparklineComponent)
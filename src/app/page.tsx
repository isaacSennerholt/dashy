'use client'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { useRealtimeMetrics } from '@/hooks/use-realtime-metrics'

export default function Home() {
  useRealtimeMetrics()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <MetricsGrid />
      </div>
    </main>
  )
}
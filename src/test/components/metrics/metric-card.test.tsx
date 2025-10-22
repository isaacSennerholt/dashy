import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MetricCard } from '@/components/metrics/metric-card'
import { Metric } from '@/types/metrics'

// Mock the providers and hooks
vi.mock('@/providers/supabase-provider', () => ({
  useSupabase: () => ({
    user: { id: 'user123' },
    supabase: {}
  })
}))

vi.mock('@/hooks/use-metric-history', () => ({
  useMetricHistory: () => ({ data: [] })
}))

vi.mock('@/components/metrics/sparkline', () => ({
  Sparkline: () => <div data-testid="sparkline">Sparkline</div>
}))

vi.mock('@/components/metrics/edit-metric-modal', () => ({
  EditMetricModal: ({ open }: { open: boolean }) => 
    open ? <div data-testid="edit-modal">Edit Modal</div> : null
}))

vi.mock('@/components/metrics/metric-history-modal', () => ({
  MetricHistoryModal: ({ open }: { open: boolean }) => 
    open ? <div data-testid="history-modal">History Modal</div> : null
}))

vi.mock('@/components/auth/auth-modal', () => ({
  AuthModal: ({ open }: { open: boolean }) => 
    open ? <div data-testid="auth-modal">Auth Modal</div> : null
}))

const mockMetric: Metric = {
  id: '1',
  type: 'CPU Usage',
  value: 75.5,
  unit: 'percentage',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  created_by: 'user123'
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('MetricCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render metric information', () => {
    render(
      <TestWrapper>
        <MetricCard metric={mockMetric} />
      </TestWrapper>
    )

    expect(screen.getByText('CPU Usage')).toBeInTheDocument()
    expect(screen.getByText('75.5%')).toBeInTheDocument()
    expect(screen.getByTestId('sparkline')).toBeInTheDocument()
  })

  it('should format different units correctly', () => {
    const temperatureMetric = { ...mockMetric, value: 25, unit: 'temperature' as const }
    const { rerender } = render(
      <TestWrapper>
        <MetricCard metric={temperatureMetric} />
      </TestWrapper>
    )

    expect(screen.getByText('25°C')).toBeInTheDocument()

    const currencyMetric = { ...mockMetric, value: 1000, unit: 'currency' as const }
    rerender(
      <TestWrapper>
        <MetricCard metric={currencyMetric} />
      </TestWrapper>
    )

    expect(screen.getByText('$1,000')).toBeInTheDocument()
  })

  it('should show edit modal when edit button is clicked', () => {
    render(
      <TestWrapper>
        <MetricCard metric={mockMetric} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
  })

  it('should show history modal when history button is clicked', () => {
    render(
      <TestWrapper>
        <MetricCard metric={mockMetric} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('History'))
    expect(screen.getByTestId('history-modal')).toBeInTheDocument()
  })
})
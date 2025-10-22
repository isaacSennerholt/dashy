import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMetrics, useOrderedMetrics } from '@/hooks/use-metrics'
import { Metric } from '@/types/metrics'

// Mock the dependencies
vi.mock('@/providers/supabase-provider', () => ({
  useSupabase: vi.fn()
}))

vi.mock('@/hooks/use-metric-ordering', () => ({
  useMetricOrdering: vi.fn()
}))

import { useSupabase } from '@/providers/supabase-provider'
import { useMetricOrdering } from '@/hooks/use-metric-ordering'

const mockUseSupabase = useSupabase as any
const mockUseMetricOrdering = useMetricOrdering as any

const mockMetrics: Metric[] = [
  {
    id: 'metric-1',
    type: 'CPU Usage',
    value: 85,
    unit: 'percentage',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'metric-2',
    type: 'Memory Usage',
    value: 70,
    unit: 'percentage',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'metric-3',
    type: 'Disk Usage',
    value: 45,
    unit: 'percentage',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    created_by: 'user-2'
  }
]

describe('useMetrics', () => {
  let queryClient: QueryClient
  const mockSupabaseQuery = vi.fn()

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()

    mockUseSupabase.mockReturnValue({
      supabase: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => mockSupabaseQuery)
          }))
        }))
      },
      user: { id: 'user-1' }
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('should fetch metrics successfully', async () => {
    mockSupabaseQuery.mockResolvedValue({
      data: mockMetrics,
      error: null
    })

    const { result } = renderHook(() => useMetrics(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockMetrics)
  })

  it('should handle fetch errors', async () => {
    const mockError = new Error('Database connection failed')
    mockSupabaseQuery.mockResolvedValue({
      data: null,
      error: mockError
    })

    const { result } = renderHook(() => useMetrics(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should return empty array when no data', async () => {
    mockSupabaseQuery.mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useMetrics(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })
})

describe('useOrderedMetrics', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('should return metrics in default order when no user ordering exists', () => {
    // Mock useMetrics to return test data
    vi.mocked(useSupabase).mockReturnValue({
      supabase: {},
      user: { id: 'user-1' }
    } as any)

    // Set up the QueryClient with mock data
    queryClient.setQueryData(['metrics', 'user-1'], mockMetrics)

    mockUseMetricOrdering.mockReturnValue({
      data: []
    })

    const { result } = renderHook(() => useOrderedMetrics(), { wrapper })

    expect(result.current).toEqual(mockMetrics)
  })

  it('should return metrics in custom order when user ordering exists', () => {
    vi.mocked(useSupabase).mockReturnValue({
      supabase: {},
      user: { id: 'user-1' }
    } as any)

    // Set up the QueryClient with mock data
    queryClient.setQueryData(['metrics', 'user-1'], mockMetrics)

    const userOrdering = [
      { metric_id: 'metric-3', order_index: 0 },
      { metric_id: 'metric-1', order_index: 1 }
      // metric-2 not in ordering (should appear at end)
    ]

    mockUseMetricOrdering.mockReturnValue({
      data: userOrdering
    })

    const { result } = renderHook(() => useOrderedMetrics(), { wrapper })

    // Should have metric-3 first, metric-1 second, metric-2 last (unordered)
    expect(result.current).toEqual([
      mockMetrics[2], // metric-3
      mockMetrics[0], // metric-1
      mockMetrics[1]  // metric-2 (unordered)
    ])
  })

  it('should handle metrics not present in ordering gracefully', () => {
    vi.mocked(useSupabase).mockReturnValue({
      supabase: {},
      user: { id: 'user-1' }
    } as any)

    queryClient.setQueryData(['metrics', 'user-1'], mockMetrics)

    const userOrdering = [
      { metric_id: 'metric-999', order_index: 0 }, // Non-existent metric
      { metric_id: 'metric-2', order_index: 1 }
    ]

    mockUseMetricOrdering.mockReturnValue({
      data: userOrdering
    })

    const { result } = renderHook(() => useOrderedMetrics(), { wrapper })

    // Should have metric-2 first (only one in ordering), then others unordered
    expect(result.current).toEqual([
      mockMetrics[1], // metric-2
      mockMetrics[0], // metric-1 (unordered)
      mockMetrics[2]  // metric-3 (unordered)
    ])
  })

  it('should return original order when user is not authenticated', () => {
    vi.mocked(useSupabase).mockReturnValue({
      supabase: {},
      user: null
    } as any)

    queryClient.setQueryData(['metrics', null], mockMetrics)

    mockUseMetricOrdering.mockReturnValue({
      data: []
    })

    const { result } = renderHook(() => useOrderedMetrics(), { wrapper })

    expect(result.current).toEqual(mockMetrics)
  })

  it('should handle empty metrics array', () => {
    vi.mocked(useSupabase).mockReturnValue({
      supabase: {},
      user: { id: 'user-1' }
    } as any)

    queryClient.setQueryData(['metrics', 'user-1'], [])

    mockUseMetricOrdering.mockReturnValue({
      data: [{ metric_id: 'metric-1', order_index: 0 }]
    })

    const { result } = renderHook(() => useOrderedMetrics(), { wrapper })

    expect(result.current).toEqual([])
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMetrics, useOrderedMetrics } from '@/hooks/use-metrics'
import { Metric } from '@/types/metrics'
import React, { ReactNode } from 'react'

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
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockOrder = vi.fn()

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()

    // Setup the promise chain - mockOrder should return the actual promise
    mockSelect.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({ select: mockSelect })

    mockUseSupabase.mockReturnValue({
      supabase: {
        from: mockFrom
      },
      user: { id: 'user-1' }
    })
  })

  const wrapper = ({ children }: { children: ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('should fetch metrics successfully', async () => {
    // Set up mockOrder to return a resolved promise
    mockOrder.mockResolvedValue({
      data: mockMetrics,
      error: null
    })

    const { result } = renderHook(() => useMetrics(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Check that the Supabase chain was called correctly
    expect(mockFrom).toHaveBeenCalledWith('metrics')
    expect(mockSelect).toHaveBeenCalled()
    expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false })
    expect(result.current.data).toEqual(mockMetrics)
  })

  it('should handle fetch errors', async () => {
    const mockError = new Error('Database connection failed')
    mockOrder.mockResolvedValue({
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
    mockOrder.mockResolvedValue({
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

  const wrapper = ({ children }: { children: ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children)

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
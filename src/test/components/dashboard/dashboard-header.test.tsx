import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

// Mock the hooks
vi.mock('@/providers/supabase-provider', () => ({
  useSupabase: vi.fn()
}))

vi.mock('@/hooks/use-user-profile', () => ({
  useUserProfile: vi.fn()
}))

// Mock child components
vi.mock('@/components/auth/auth-modal', () => ({
  AuthModal: ({ open, onOpenChange, onSuccess }: any) => (
    <div data-testid="auth-modal" data-open={open}>
      <button onClick={() => onOpenChange(false)}>Close</button>
      <button onClick={() => onSuccess()}>Success</button>
    </div>
  )
}))

vi.mock('@/components/metrics/create-metric-modal', () => ({
  CreateMetricModal: ({ open, onOpenChange, onSuccess }: any) => (
    <div data-testid="create-metric-modal" data-open={open}>
      <button onClick={() => onOpenChange(false)}>Close</button>
      <button onClick={() => onSuccess()}>Success</button>
    </div>
  )
}))

import { useSupabase } from '@/providers/supabase-provider'
import { useUserProfile } from '@/hooks/use-user-profile'

const mockUseSupabase = useSupabase as any
const mockUseUserProfile = useUserProfile as any

describe('DashboardHeader', () => {
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

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseSupabase.mockReturnValue({
        user: null,
        supabase: {
          auth: {
            signOut: vi.fn()
          }
        }
      })
      mockUseUserProfile.mockReturnValue({
        data: null
      })
    })

    it('should render the header with title and description', () => {
      renderWithProviders(<DashboardHeader />)
      
      expect(screen.getByText('Stats Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Real-time metrics monitoring and analytics')).toBeInTheDocument()
    })

    it('should show sign in button when user is not authenticated', () => {
      renderWithProviders(<DashboardHeader />)
      
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()
    })

    it('should show auth modal when create metric is clicked without authentication', () => {
      renderWithProviders(<DashboardHeader />)
      
      const createButton = screen.getByText('Create Metric')
      fireEvent.click(createButton)
      
      expect(screen.getByTestId('auth-modal')).toHaveAttribute('data-open', 'true')
    })

    it('should show auth modal when sign in button is clicked', () => {
      renderWithProviders(<DashboardHeader />)
      
      const signInButton = screen.getByText('Sign In')
      fireEvent.click(signInButton)
      
      expect(screen.getByTestId('auth-modal')).toHaveAttribute('data-open', 'true')
    })
  })

  describe('when user is authenticated', () => {
    const mockSignOut = vi.fn()

    beforeEach(() => {
      mockUseSupabase.mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
        supabase: {
          auth: {
            signOut: mockSignOut
          }
        }
      })
      mockUseUserProfile.mockReturnValue({
        data: { id: 'user-123', email: 'test@example.com', alias: 'TestUser' }
      })
    })

    it('should show welcome message with user alias', () => {
      renderWithProviders(<DashboardHeader />)
      
      expect(screen.getByText(/👋🏼 TestUser/)).toBeInTheDocument()
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    })

    it('should show sign out button when user is authenticated', () => {
      renderWithProviders(<DashboardHeader />)
      
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    it('should call signOut when sign out button is clicked', async () => {
      renderWithProviders(<DashboardHeader />)
      
      const signOutButton = screen.getByText('Sign Out')
      fireEvent.click(signOutButton)
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
      })
    })

    it('should show create metric modal when create metric is clicked with authentication', () => {
      renderWithProviders(<DashboardHeader />)
      
      const createButton = screen.getByText('Create Metric')
      fireEvent.click(createButton)
      
      expect(screen.getByTestId('create-metric-modal')).toHaveAttribute('data-open', 'true')
      expect(screen.getByTestId('auth-modal')).toHaveAttribute('data-open', 'false')
    })

    it('should handle modal close events', () => {
      renderWithProviders(<DashboardHeader />)
      
      // Open create metric modal
      const createButton = screen.getByText('Create Metric')
      fireEvent.click(createButton)
      
      expect(screen.getByTestId('create-metric-modal')).toHaveAttribute('data-open', 'true')
      
      // Close the modal
      const closeButton = screen.getAllByText('Close')[1] // Second close button is for create modal
      fireEvent.click(closeButton)
      
      expect(screen.getByTestId('create-metric-modal')).toHaveAttribute('data-open', 'false')
    })
  })

  describe('when user profile is loading', () => {
    beforeEach(() => {
      mockUseSupabase.mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
        supabase: {
          auth: {
            signOut: vi.fn()
          }
        }
      })
      mockUseUserProfile.mockReturnValue({
        data: null // Profile still loading
      })
    })

    it('should handle missing user profile gracefully', () => {
      renderWithProviders(<DashboardHeader />)
      
      // Should still show the user section but without alias
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
      expect(screen.getByText(/👋🏼/)).toBeInTheDocument()
    })
  })
})
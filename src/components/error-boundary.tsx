'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { logger } from '@/lib/logger'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log the error using our logger utility
    logger.exception(error, 'ErrorBoundary', { errorInfo })

    // In production, you might want to log to an error reporting service
    // logErrorToService(error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} retry={this.retry} />
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  retry: () => void
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  const isSupabaseError = error?.message?.includes('supabase') ?? 
                         error?.message?.includes('Failed to fetch') ??
                         error?.message?.includes('NetworkError')

  return (
    <div className="flex items-center justify-center min-h-[200px] p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {isSupabaseError ? 'Connection Error' : 'Something went wrong'}
          </h2>
          
          <p className="text-sm text-gray-600">
            {isSupabaseError 
              ? 'Unable to connect to the database. Please check your connection and try again.'
              : 'An unexpected error occurred. Please try again.'
            }
          </p>
          
          {process.env.NODE_ENV === 'development' && error ? (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-gray-500">
                Error details (development only)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {error.message}
                {error.stack ? `\n\n${error.stack}` : ''}
              </pre>
            </details>
          ) : null}
        </div>
        
        <Button onClick={retry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  )
}

// Supabase-specific error boundary for database operations
export function SupabaseErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={SupabaseErrorFallback}>
      {children}
    </ErrorBoundary>
  )
}

function SupabaseErrorFallback({ error, retry }: ErrorFallbackProps) {
  const getErrorMessage = (error?: Error) => {
    if (!error) return 'An unknown database error occurred'
    
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection.'
    }
    
    if (message.includes('unauthorized') || message.includes('permission')) {
      return 'You don\'t have permission to perform this action.'
    }
    
    if (message.includes('not found')) {
      return 'The requested data was not found.'
    }
    
    if (message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.'
    }
    
    return 'Database connection error. Please try again.'
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-orange-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Database Error</h2>
          <p className="text-sm text-gray-600">{getErrorMessage(error)}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button onClick={retry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="text-xs"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  )
}
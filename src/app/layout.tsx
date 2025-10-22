import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { SupabaseProvider } from '@/providers/supabase-provider'
import { ErrorBoundary, SupabaseErrorBoundary } from '@/components/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stats Dashboard',
  description: 'Real-time metrics dashboard with live updates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <SupabaseProvider>
            <SupabaseErrorBoundary>
              <QueryProvider>
                {children}
              </QueryProvider>
            </SupabaseErrorBoundary>
          </SupabaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
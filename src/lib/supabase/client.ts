import { createBrowserClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('Missing Supabase environment variables in production', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey
      }, 'SupabaseClient')
      throw new Error('Missing Supabase environment variables in production')
    }
    
    // Use fallback values for development/build only
    logger.warn('Using fallback Supabase configuration for development', undefined, 'SupabaseClient')
    return createBrowserClient(
      'https://dummy.supabase.co',
      'dummy-key'
    )
  }
  
  logger.debug('Creating Supabase client', { 
    url: supabaseUrl
  }, 'SupabaseClient')
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}
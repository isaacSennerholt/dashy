'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/providers/supabase-provider'
import type { UserProfile } from '@/types/auth'
import { logException } from '@/lib/logger'

export function useUserProfile() {
  const { supabase, user } = useSupabase()

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, alias, created_at')
        .eq('id', user.id)
        .single()

      if (error) {
        logException(new Error(error.message), 'useUserProfile', { userId: user.id })
        return null
      }

      return data
    },
    enabled: !!user,
  })
}
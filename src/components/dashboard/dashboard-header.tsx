'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useSupabase } from '@/providers/supabase-provider'
import { useUserProfile } from '@/hooks/use-user-profile'
import { AuthModal } from '@/components/auth/auth-modal'
import { CreateMetricModal } from '@/components/metrics/create-metric-modal'

export function DashboardHeader() {
  const { user, supabase } = useSupabase()
  const { data: userProfile } = useUserProfile()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateMetric = () => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      setShowCreateModal(true)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Stats Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Metrics monitoring and analytics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={handleCreateMetric} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Metric
          </Button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                👋🏼 {userProfile?.alias}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowAuthModal(true)}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onSuccess={() => setShowAuthModal(false)}
      />

      <CreateMetricModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => setShowCreateModal(false)}
      />
    </>
  )
}
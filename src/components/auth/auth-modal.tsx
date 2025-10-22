'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/providers/supabase-provider'
import { SignInSchema, SignUpSchema } from '@/lib/validations/auth'
import type { SignInInput, SignUpInput } from '@/lib/validations/auth'
import { RateLimiter } from '@/lib/security/sanitize'
import { parseError, getFieldError, hasFieldError, type FieldErrors } from '@/lib/error-utils'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const { supabase } = useSupabase()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [rateLimiter] = useState(() => new RateLimiter(5, 60000)) // 5 attempts per minute
  const emailInputRef = useRef<HTMLInputElement>(null)

  const [signInData, setSignInData] = useState<SignInInput>({
    email: '',
    password: ''
  })

  const [signUpData, setSignUpData] = useState<SignUpInput>({
    email: '',
    alias: '',
    password: ''
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneralError(null)
    setFieldErrors({})

    try {
      // Rate limiting check using email as identifier
      const userKey = signInData.email || 'anonymous'
      if (rateLimiter.isRateLimited(userKey)) {
        throw new Error('Too many attempts. Please try again later.')
      }

      // Validate input
      const validatedData = SignInSchema.parse(signInData)

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password
      })

      if (error) {
        rateLimiter.recordAttempt(userKey)
        throw error
      }

      onSuccess?.()
    } catch (err) {
      const parsed = parseError(err)
      setFieldErrors(parsed.fieldErrors)
      setGeneralError(parsed.generalError)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneralError(null)
    setFieldErrors({})

    try {
      // Rate limiting check using email as identifier
      const userKey = signUpData.email || 'anonymous'
      if (rateLimiter.isRateLimited(userKey)) {
        throw new Error('Too many attempts. Please try again later.')
      }

      // Validate input
      const validatedData = SignUpSchema.parse(signUpData)

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            alias: validatedData.alias
          }
        }
      })

      if (error) {
        rateLimiter.recordAttempt(userKey)
        throw error
      }

      onSuccess?.()
    } catch (err) {
      const parsed = parseError(err)
      setFieldErrors(parsed.fieldErrors)
      setGeneralError(parsed.generalError)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSignInData({ email: '', password: '' })
    setSignUpData({ email: '', alias: '', password: '' })
    setGeneralError(null)
    setFieldErrors({})
    setIsSignUp(false)
  }

  // Focus management when modal opens or sign up mode changes
  useEffect(() => {
    if (open) {
      // Small delay to ensure the modal is fully rendered
      const timeoutId = setTimeout(() => {
        emailInputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [open, isSignUp])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </DialogTitle>
          <DialogDescription>
            {isSignUp 
              ? 'Create a new account to start tracking and managing your metrics'
              : 'Sign in to your account to access your metrics dashboard'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              ref={emailInputRef}
              id="email"
              type="email"
              value={isSignUp ? signUpData.email : signInData.email}
              onChange={(e) => {
                if (isSignUp) {
                  setSignUpData(prev => ({ ...prev, email: e.target.value }))
                } else {
                  setSignInData(prev => ({ ...prev, email: e.target.value }))
                }
                // Clear field error when user starts typing
                if (hasFieldError(fieldErrors, 'email')) {
                  setFieldErrors(prev => ({ ...prev, email: [] }))
                }
              }}
              className={hasFieldError(fieldErrors, 'email') ? 'border-red-500' : ''}
              required
            />
            {getFieldError(fieldErrors, 'email') && (
              <p className="text-sm text-red-500">{getFieldError(fieldErrors, 'email')}</p>
            )}
          </div>

          {isSignUp ? (
            <div className="space-y-2">
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                type="text"
                value={signUpData.alias}
                onChange={(e) => {
                  setSignUpData(prev => ({ ...prev, alias: e.target.value }))
                  // Clear field error when user starts typing
                  if (hasFieldError(fieldErrors, 'alias')) {
                    setFieldErrors(prev => ({ ...prev, alias: [] }))
                  }
                }}
                className={hasFieldError(fieldErrors, 'alias') ? 'border-red-500' : ''}
                required
              />
              {getFieldError(fieldErrors, 'alias') && (
                <p className="text-sm text-red-500">{getFieldError(fieldErrors, 'alias')}</p>
              )}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={isSignUp ? signUpData.password : signInData.password}
              onChange={(e) => {
                if (isSignUp) {
                  setSignUpData(prev => ({ ...prev, password: e.target.value }))
                } else {
                  setSignInData(prev => ({ ...prev, password: e.target.value }))
                }
                // Clear field error when user starts typing
                if (hasFieldError(fieldErrors, 'password')) {
                  setFieldErrors(prev => ({ ...prev, password: [] }))
                }
              }}
              className={hasFieldError(fieldErrors, 'password') ? 'border-red-500' : ''}
              required
            />
            {getFieldError(fieldErrors, 'password') && (
              <p className="text-sm text-red-500">{getFieldError(fieldErrors, 'password')}</p>
            )}
          </div>

          {generalError ? (
            <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded p-3">
              {generalError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
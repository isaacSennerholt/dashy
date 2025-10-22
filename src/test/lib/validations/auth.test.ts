import { describe, it, expect } from 'vitest'
import { SignInSchema, SignUpSchema } from '@/lib/validations/auth'

describe('SignInSchema', () => {
  it('should validate correct sign in data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123'
    }
    
    expect(() => SignInSchema.parse(validData)).not.toThrow()
  })

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123'
    }
    
    expect(() => SignInSchema.parse(invalidData)).toThrow()
  })

  it('should reject short password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: '123'
    }
    
    expect(() => SignInSchema.parse(invalidData)).toThrow()
  })
})

describe('SignUpSchema', () => {
  it('should validate correct sign up data', () => {
    const validData = {
      email: 'test@example.com',
      alias: 'test_user',
      password: 'Password123'
    }
    
    expect(() => SignUpSchema.parse(validData)).not.toThrow()
  })

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      alias: 'test_user',
      password: 'Password123'
    }
    
    expect(() => SignUpSchema.parse(invalidData)).toThrow()
  })

  it('should reject alias with invalid characters', () => {
    const invalidData = {
      email: 'test@example.com',
      alias: 'test user!',
      password: 'Password123'
    }
    
    expect(() => SignUpSchema.parse(invalidData)).toThrow()
  })

  it('should reject weak password', () => {
    const invalidData = {
      email: 'test@example.com',
      alias: 'test_user',
      password: 'password' // missing uppercase and number
    }
    
    expect(() => SignUpSchema.parse(invalidData)).toThrow()
  })

  it('should reject short alias', () => {
    const invalidData = {
      email: 'test@example.com',
      alias: 'a',
      password: 'Password123'
    }
    
    expect(() => SignUpSchema.parse(invalidData)).toThrow()
  })
})
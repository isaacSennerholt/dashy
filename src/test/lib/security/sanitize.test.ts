import { describe, it, expect, beforeEach } from 'vitest'
import { sanitizeHtml, sanitizeString, sanitizeNumber, RateLimiter } from '@/lib/security/sanitize'

describe('sanitizeHtml', () => {
  it('should escape HTML entities', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
  })

  it('should escape ampersands', () => {
    expect(sanitizeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should handle empty strings', () => {
    expect(sanitizeHtml('')).toBe('')
  })
})

describe('sanitizeString', () => {
  it('should remove dangerous characters', () => {
    expect(sanitizeString('Hello<script>World</script>')).toBe('HelloscriptWorld/script')
  })

  it('should trim whitespace', () => {
    expect(sanitizeString('  hello world  ')).toBe('hello world')
  })

  it('should limit string length', () => {
    const longString = 'a'.repeat(20000)
    const result = sanitizeString(longString)
    expect(result.length).toBe(10000)
  })
})

describe('sanitizeNumber', () => {
  it('should return valid numbers', () => {
    expect(sanitizeNumber(42)).toBe(42)
    expect(sanitizeNumber('42')).toBe(42)
    expect(sanitizeNumber(3.14)).toBe(3.14)
  })

  it('should throw error for invalid numbers', () => {
    expect(() => sanitizeNumber(NaN)).toThrow('Invalid number')
    expect(() => sanitizeNumber(Infinity)).toThrow('Invalid number')
    expect(() => sanitizeNumber('not a number')).toThrow('Invalid number')
  })

  it('should throw error for numbers out of safe range', () => {
    expect(() => sanitizeNumber(Number.MAX_SAFE_INTEGER + 1)).toThrow('Number out of safe range')
    expect(() => sanitizeNumber(Number.MIN_SAFE_INTEGER - 1)).toThrow('Number out of safe range')
  })
})

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    rateLimiter = new RateLimiter(3, 1000) // 3 attempts per second
  })

  it('should allow requests within limit', () => {
    expect(rateLimiter.isRateLimited('user1')).toBe(false)
    rateLimiter.recordAttempt('user1')
    expect(rateLimiter.isRateLimited('user1')).toBe(false)
  })

  it('should rate limit after max attempts', () => {
    for (let i = 0; i < 3; i++) {
      rateLimiter.recordAttempt('user1')
    }
    expect(rateLimiter.isRateLimited('user1')).toBe(true)
  })

  it('should handle different users separately', () => {
    for (let i = 0; i < 3; i++) {
      rateLimiter.recordAttempt('user1')
    }
    expect(rateLimiter.isRateLimited('user1')).toBe(true)
    expect(rateLimiter.isRateLimited('user2')).toBe(false)
  })
})
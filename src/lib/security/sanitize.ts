/**
 * Sanitize HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  }

  return String(input).replace(/[&<>"'\/]/g, (s) => entityMap[s])
}

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .trim() // Remove leading/trailing whitespace
    .slice(0, 10000) // Limit length to prevent DoS
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(input: unknown): number {
  const num = Number(input)
  
  if (!Number.isFinite(num)) {
    throw new Error('Invalid number')
  }
  
  if (num < Number.MIN_SAFE_INTEGER || num > Number.MAX_SAFE_INTEGER) {
    throw new Error('Number out of safe range')
  }
  
  return num
}

/**
 * Rate limiting helper for client-side usage
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isRateLimited(key: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) ?? []
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs)
    
    // Update the attempts
    this.attempts.set(key, recentAttempts)
    
    return recentAttempts.length >= this.maxAttempts
  }
  
  recordAttempt(key: string): void {
    const now = Date.now()
    const attempts = this.attempts.get(key) ?? []
    attempts.push(now)
    this.attempts.set(key, attempts)
  }
}
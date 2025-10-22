import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Note: NODE_ENV is set automatically by test environment
// Individual tests can override using vi.stubEnv() if needed

afterEach(() => {
  cleanup()
})
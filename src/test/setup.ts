import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Set NODE_ENV to development for tests by default
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

afterEach(() => {
  cleanup()
})
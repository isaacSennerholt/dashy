import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, logDebug, logInfo, logWarn, logError, logException } from '@/lib/logger'

describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV
  let consoleSpy: {
    debug: any
    log: any
    warn: any
    error: any
  }

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.env.NODE_ENV = originalEnv
  })

  describe('in development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should log debug messages to console.debug', () => {
      logger.debug('Test debug message', { data: 'test' }, 'TestContext')
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '[TestContext] Test debug message',
        { data: 'test' }
      )
    })

    it('should log info messages to console.log', () => {
      logger.info('Test info message', { data: 'test' }, 'TestContext')
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestContext] Test info message',
        { data: 'test' }
      )
    })

    it('should log warn messages to console.warn', () => {
      logger.warn('Test warn message', { data: 'test' }, 'TestContext')
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[TestContext] Test warn message',
        { data: 'test' }
      )
    })

    it('should log error messages to console.error', () => {
      logger.error('Test error message', { data: 'test' }, 'TestContext')
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[TestContext] Test error message',
        { data: 'test' }
      )
    })

    it('should log without context when not provided', () => {
      logger.info('Test message without context')
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        ' Test message without context',
        undefined
      )
    })

    it('should log without data when not provided', () => {
      logger.info('Test message without data', undefined, 'TestContext')
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestContext] Test message without data',
        undefined
      )
    })
  })

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('should not log debug messages to console', () => {
      logger.debug('Test debug message')
      
      expect(consoleSpy.debug).not.toHaveBeenCalled()
    })

    it('should not log info messages to console', () => {
      logger.info('Test info message')
      
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    it('should not log warn messages to console', () => {
      logger.warn('Test warn message')
      
      expect(consoleSpy.warn).not.toHaveBeenCalled()
    })

    it('should not log error messages to console', () => {
      logger.error('Test error message')
      
      expect(consoleSpy.error).not.toHaveBeenCalled()
    })
  })

  describe('exception logging', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should log exception with error message and stack', () => {
      const error = new Error('Test error')
      error.stack = 'Error: Test error\\n    at test'

      logger.exception(error, 'TestContext', { userId: '123' })
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[TestContext] Test error',
        {
          userId: '123',
          stack: 'Error: Test error\\n    at test'
        }
      )
    })

    it('should handle exception without additional data', () => {
      const error = new Error('Test error')
      
      logger.exception(error, 'TestContext')
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[TestContext] Test error',
        { stack: error.stack }
      )
    })

    it('should handle exception without context', () => {
      const error = new Error('Test error')
      
      logger.exception(error)
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        ' Test error',
        { stack: error.stack }
      )
    })
  })

  describe('convenience functions', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should export working convenience functions', () => {
      logDebug('Debug test')
      logInfo('Info test')
      logWarn('Warn test')
      logError('Error test')
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(' Debug test', undefined)
      expect(consoleSpy.log).toHaveBeenCalledWith(' Info test', undefined)
      expect(consoleSpy.warn).toHaveBeenCalledWith(' Warn test', undefined)
      expect(consoleSpy.error).toHaveBeenCalledWith(' Error test', undefined)
    })

    it('should work with logException convenience function', () => {
      const error = new Error('Test exception')
      
      logException(error, 'TestContext', { additional: 'data' })
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[TestContext] Test exception',
        {
          additional: 'data',
          stack: error.stack
        }
      )
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should handle undefined and null values gracefully', () => {
      logger.info('Test message', null, undefined)
      
      expect(consoleSpy.log).toHaveBeenCalledWith(' Test message', null)
    })

    it('should handle empty strings', () => {
      logger.info('', {}, '')
      
      expect(consoleSpy.log).toHaveBeenCalledWith(' ', {})
    })

    it('should handle complex data objects', () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' }
        },
        function: () => 'test'
      }
      
      logger.info('Complex data test', complexData, 'TestContext')
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestContext] Complex data test',
        complexData
      )
    })
  })
})
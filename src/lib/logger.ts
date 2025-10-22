/**
 * Centralized logging utility for the application
 * Provides consistent logging across development and production environments
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'


class Logger {
  private get isDevelopment() {
    return process.env.NODE_ENV === 'development'
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: string) {

    // In development, log to console with nice formatting
    if (this.isDevelopment) {
      const prefix = context ? `[${context}]` : ''
      const logMessage = `${prefix} ${message}`

      switch (level) {
        case 'debug':
          console.debug(logMessage, data)
          break
        case 'info':
          console.log(logMessage, data)
          break
        case 'warn':
          console.warn(logMessage, data)
          break
        case 'error':
          console.error(logMessage, data)
          break
      }
    }

    // In production, you might want to send to an error reporting service
    if (!this.isDevelopment && level === 'error') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(entry)
    }
  }

  debug(message: string, data?: unknown, context?: string) {
    this.log('debug', message, data, context)
  }

  info(message: string, data?: unknown, context?: string) {
    this.log('info', message, data, context)
  }

  warn(message: string, data?: unknown, context?: string) {
    this.log('warn', message, data, context)
  }

  error(message: string, data?: unknown, context?: string) {
    this.log('error', message, data, context)
  }

  // Convenience method for Error objects
  exception(error: Error, context?: string, additionalData?: unknown) {
    this.error(error.message, { ...additionalData, stack: error.stack }, context)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export typed logger functions for easier imports
export const logDebug = (message: string, data?: unknown, context?: string) => 
  logger.debug(message, data, context)

export const logInfo = (message: string, data?: unknown, context?: string) => 
  logger.info(message, data, context)

export const logWarn = (message: string, data?: unknown, context?: string) => 
  logger.warn(message, data, context)

export const logError = (message: string, data?: unknown, context?: string) => 
  logger.error(message, data, context)

export const logException = (error: Error, context?: string, additionalData?: unknown) => 
  logger.exception(error, context, additionalData)
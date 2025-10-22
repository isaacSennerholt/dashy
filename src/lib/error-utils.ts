import { ZodError } from 'zod'

export interface FieldErrors {
  [fieldName: string]: string[]
}

export interface ParsedError {
  fieldErrors: FieldErrors
  generalError: string | null
}

/**
 * Parses various error types into user-friendly format
 */
export function parseError(error: unknown): ParsedError {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return parseZodError(error)
  }

  // Handle errors with a 'message' property (Supabase, general errors)
  if (error && typeof error.message === 'string') {
    return {
      fieldErrors: {},
      generalError: error.message
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      fieldErrors: {},
      generalError: error
    }
  }

  // Handle array of validation errors (like the JSON you showed)
  if (Array.isArray(error)) {
    return parseValidationErrorArray(error)
  }

  // Fallback for unknown error types
  return {
    fieldErrors: {},
    generalError: 'An unexpected error occurred'
  }
}

/**
 * Parses Zod validation errors into field-specific messages
 */
function parseZodError(zodError: ZodError): ParsedError {
  const fieldErrors: FieldErrors = {}

  zodError.issues.forEach((issue) => {
    const fieldName = issue.path.join('.')
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = []
    }
    fieldErrors[fieldName].push(issue.message)
  })

  return {
    fieldErrors,
    generalError: null
  }
}

/**
 * Parses validation error arrays (like the format you encountered)
 */
function parseValidationErrorArray(errors: unknown[]): ParsedError {
  const fieldErrors: FieldErrors = {}

  errors.forEach((error) => {
    if (error.path && Array.isArray(error.path) && error.message) {
      const fieldName = error.path.join('.')
      if (!fieldErrors[fieldName]) {
        fieldErrors[fieldName] = []
      }
      fieldErrors[fieldName].push(error.message)
    }
  })

  return {
    fieldErrors,
    generalError: Object.keys(fieldErrors).length === 0 
      ? 'Validation failed' 
      : null
  }
}

/**
 * Component helper to get field error message
 */
export function getFieldError(fieldErrors: FieldErrors, fieldName: string): string | null {
  const errors = fieldErrors[fieldName]
  return errors && errors.length > 0 ? errors[0] : null
}

/**
 * Component helper to check if field has error
 */
export function hasFieldError(fieldErrors: FieldErrors, fieldName: string): boolean {
  return !!fieldErrors[fieldName] && fieldErrors[fieldName].length > 0
}
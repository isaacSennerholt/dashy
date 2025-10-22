import type { MetricUnit } from '@/types/metrics'

/**
 * Formats a numeric value with its corresponding unit
 * @param value - The numeric value to format
 * @param unit - The unit type for formatting
 * @returns Formatted string with appropriate unit suffix and locale formatting
 */
export function formatValue(value: number, unit: MetricUnit): string {
  switch (unit) {
    case 'percentage':
      return `${value}%`
    case 'temperature':
      return `${value}°C`
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'count':
      return value.toLocaleString()
    case 'milliseconds':
      return `${value}ms`
    case 'seconds':
      return `${value}s`
    case 'bytes':
      return formatBytes(value)
    default:
      return value.toLocaleString()
  }
}

/**
 * Formats byte values into human-readable units (Bytes, KB, MB, GB, TB)
 * @param bytes - The number of bytes to format
 * @returns Formatted string with appropriate byte unit
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
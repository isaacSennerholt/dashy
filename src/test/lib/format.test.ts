import { describe, it, expect } from 'vitest'
import { formatValue, formatBytes } from '@/lib/format'
import { MetricUnit } from '@/types/metrics'

describe('formatValue', () => {
  describe('percentage formatting', () => {
    it('should format percentage values correctly', () => {
      expect(formatValue(75, 'percentage')).toBe('75%')
      expect(formatValue(0, 'percentage')).toBe('0%')
      expect(formatValue(100, 'percentage')).toBe('100%')
      expect(formatValue(12.5, 'percentage')).toBe('12.5%')
    })
  })

  describe('temperature formatting', () => {
    it('should format temperature values correctly', () => {
      expect(formatValue(25, 'temperature')).toBe('25°C')
      expect(formatValue(-10, 'temperature')).toBe('-10°C')
      expect(formatValue(0, 'temperature')).toBe('0°C')
      expect(formatValue(23.5, 'temperature')).toBe('23.5°C')
    })
  })

  describe('currency formatting', () => {
    it('should format currency values with proper locale formatting', () => {
      expect(formatValue(1000, 'currency')).toBe('$1,000')
      expect(formatValue(0, 'currency')).toBe('$0')
      expect(formatValue(1234567, 'currency')).toBe('$1,234,567')
      expect(formatValue(99.99, 'currency')).toBe('$99.99')
    })
  })

  describe('count formatting', () => {
    it('should format count values with proper locale formatting', () => {
      expect(formatValue(1000, 'count')).toBe('1,000')
      expect(formatValue(0, 'count')).toBe('0')
      expect(formatValue(1234567, 'count')).toBe('1,234,567')
      expect(formatValue(42, 'count')).toBe('42')
    })
  })

  describe('milliseconds formatting', () => {
    it('should format milliseconds values correctly', () => {
      expect(formatValue(500, 'milliseconds')).toBe('500ms')
      expect(formatValue(0, 'milliseconds')).toBe('0ms')
      expect(formatValue(1250, 'milliseconds')).toBe('1250ms')
    })
  })

  describe('seconds formatting', () => {
    it('should format seconds values correctly', () => {
      expect(formatValue(30, 'seconds')).toBe('30s')
      expect(formatValue(0, 'seconds')).toBe('0s')
      expect(formatValue(120, 'seconds')).toBe('120s')
      expect(formatValue(5.5, 'seconds')).toBe('5.5s')
    })
  })

  describe('bytes formatting', () => {
    it('should format bytes values using formatBytes function', () => {
      expect(formatValue(1024, 'bytes')).toBe('1 KB')
      expect(formatValue(0, 'bytes')).toBe('0 Bytes')
      expect(formatValue(1048576, 'bytes')).toBe('1 MB')
    })
  })

  describe('default formatting', () => {
    it('should fall back to locale formatting for unknown units', () => {
      // TypeScript prevents passing invalid units, but testing runtime behavior
      expect(formatValue(1000, 'unknown' as MetricUnit)).toBe('1,000')
      expect(formatValue(42, 'invalid' as MetricUnit)).toBe('42')
    })
  })

  describe('edge cases', () => {
    it('should handle zero values correctly for all units', () => {
      expect(formatValue(0, 'percentage')).toBe('0%')
      expect(formatValue(0, 'temperature')).toBe('0°C')
      expect(formatValue(0, 'currency')).toBe('$0')
      expect(formatValue(0, 'count')).toBe('0')
      expect(formatValue(0, 'milliseconds')).toBe('0ms')
      expect(formatValue(0, 'seconds')).toBe('0s')
      expect(formatValue(0, 'bytes')).toBe('0 Bytes')
    })

    it('should handle negative values correctly', () => {
      expect(formatValue(-25, 'temperature')).toBe('-25°C')
      expect(formatValue(-1000, 'currency')).toBe('$-1,000')
      expect(formatValue(-500, 'count')).toBe('-500')
    })

    it('should handle decimal values correctly', () => {
      expect(formatValue(23.5, 'temperature')).toBe('23.5°C')
      expect(formatValue(99.99, 'currency')).toBe('$99.99')
      expect(formatValue(12.5, 'percentage')).toBe('12.5%')
    })
  })
})

describe('formatBytes', () => {
  describe('standard byte conversions', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(512)).toBe('512 Bytes')
      expect(formatBytes(1023)).toBe('1023 Bytes')
    })

    it('should format kilobytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(2048)).toBe('2 KB')
    })

    it('should format megabytes correctly', () => {
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1572864)).toBe('1.5 MB')
      expect(formatBytes(2097152)).toBe('2 MB')
    })

    it('should format gigabytes correctly', () => {
      expect(formatBytes(1073741824)).toBe('1 GB')
      expect(formatBytes(1610612736)).toBe('1.5 GB')
      expect(formatBytes(2147483648)).toBe('2 GB')
    })

    it('should format terabytes correctly', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB')
      expect(formatBytes(1649267441664)).toBe('1.5 TB')
      expect(formatBytes(2199023255552)).toBe('2 TB')
    })
  })

  describe('edge cases', () => {
    it('should handle zero bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('should handle very small values', () => {
      expect(formatBytes(1)).toBe('1 Bytes')
      expect(formatBytes(500)).toBe('500 Bytes')
    })

    it('should handle large values', () => {
      const largeValue = 1099511627776 * 1024 // 1 PB
      expect(formatBytes(largeValue)).toContain('TB') // Should still use TB as it's the highest unit
    })

    it('should round to 2 decimal places', () => {
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(1587)).toBe('1.55 KB')
      expect(formatBytes(1234567)).toBe('1.18 MB')
    })

    it('should handle fractional byte values', () => {
      expect(formatBytes(1024.5)).toBe('1 KB')
      expect(formatBytes(1536.7)).toBe('1.5 KB')
    })
  })

  describe('precision and rounding', () => {
    it('should maintain proper precision', () => {
      // Test that parseFloat and toFixed work correctly
      expect(formatBytes(1234567)).toBe('1.18 MB')
      expect(formatBytes(9876543210)).toBe('9.2 GB')
    })

    it('should not show unnecessary decimal places for whole numbers', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(2048)).toBe('2 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
    })
  })
})

describe('integration tests', () => {
  it('should work correctly when formatValue calls formatBytes', () => {
    // Test the integration between formatValue and formatBytes
    expect(formatValue(1024, 'bytes')).toBe(formatBytes(1024))
    expect(formatValue(1048576, 'bytes')).toBe(formatBytes(1048576))
    expect(formatValue(0, 'bytes')).toBe(formatBytes(0))
  })

  it('should handle all MetricUnit types', () => {
    const units: MetricUnit[] = ['percentage', 'temperature', 'count', 'bytes', 'seconds', 'milliseconds', 'currency']
    
    units.forEach(unit => {
      expect(() => formatValue(100, unit)).not.toThrow()
      expect(formatValue(100, unit)).toBeTruthy()
    })
  })
})
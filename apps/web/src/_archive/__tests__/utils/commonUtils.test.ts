// Unit tests for common utilities
import { 
  formatDate, 
  formatDateTime, 
  getRelativeTime,
  uniqueById,
  groupBy,
  hexToRgb,
  getContrastColor
} from '../../../packages/shared/src/utils/commonUtils'

describe('Common Utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-15')
      const result = formatDate(date)
      expect(result).toBe('Jan 15, 2023')
    })

    it('should handle different dates', () => {
      const date = new Date('2023-12-25')
      const result = formatDate(date)
      expect(result).toBe('Dec 25, 2023')
    })

    it('should handle leap year dates', () => {
      const date = new Date('2024-02-29')
      const result = formatDate(date)
      expect(result).toBe('Feb 29, 2024')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2023-01-15T14:30:00')
      const result = formatDateTime(date)
      expect(result).toBe('Jan 15, 2023, 2:30 PM')
    })

    it('should handle midnight', () => {
      const date = new Date('2023-01-15T00:00:00')
      const result = formatDateTime(date)
      expect(result).toBe('Jan 15, 2023, 12:00 AM')
    })

    it('should handle noon', () => {
      const date = new Date('2023-01-15T12:00:00')
      const result = formatDateTime(date)
      expect(result).toBe('Jan 15, 2023, 12:00 PM')
    })

    it('should handle single digit minutes', () => {
      const date = new Date('2023-01-15T09:05:00')
      const result = formatDateTime(date)
      expect(result).toBe('Jan 15, 2023, 9:05 AM')
    })
  })

  describe('getRelativeTime', () => {
    beforeEach(() => {
      // Mock Date.now() to return a fixed timestamp
      jest.spyOn(Date, 'now').mockImplementation(() => new Date('2023-01-15T12:00:00').getTime())
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should return minutes ago for recent times', () => {
      const date = new Date('2023-01-15T11:55:00') // 5 minutes ago
      const result = getRelativeTime(date)
      expect(result).toBe('5 minutes ago')
    })

    it('should return hours ago for same day', () => {
      const date = new Date('2023-01-15T08:00:00') // 4 hours ago
      const result = getRelativeTime(date)
      expect(result).toBe('4 hours ago')
    })

    it('should return days ago for recent days', () => {
      const date = new Date('2023-01-13T12:00:00') // 2 days ago
      const result = getRelativeTime(date)
      expect(result).toBe('2 days ago')
    })

    it('should return formatted date for older dates', () => {
      const date = new Date('2022-12-15T12:00:00') // 31 days ago
      const result = getRelativeTime(date)
      expect(result).toBe('Dec 15, 2022')
    })

    it('should handle edge case of 0 minutes', () => {
      const date = new Date('2023-01-15T12:00:00') // Same time
      const result = getRelativeTime(date)
      expect(result).toBe('0 minutes ago')
    })

    it('should handle edge case of 59 minutes', () => {
      const date = new Date('2023-01-15T11:01:00') // 59 minutes ago
      const result = getRelativeTime(date)
      expect(result).toBe('59 minutes ago')
    })

    it('should handle edge case of 23 hours', () => {
      const date = new Date('2023-01-14T13:00:00') // 23 hours ago
      const result = getRelativeTime(date)
      expect(result).toBe('23 hours ago')
    })

    it('should handle edge case of 6 days', () => {
      const date = new Date('2023-01-09T12:00:00') // 6 days ago
      const result = getRelativeTime(date)
      expect(result).toBe('6 days ago')
    })
  })

  describe('uniqueById', () => {
    it('should return unique items by id', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '1', name: 'Item 1 Duplicate' },
        { id: '3', name: 'Item 3' },
        { id: '2', name: 'Item 2 Duplicate' }
      ]

      const result = uniqueById(items)
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
      expect(result[2].id).toBe('3')
    })

    it('should handle empty array', () => {
      const items: any[] = []
      const result = uniqueById(items)
      expect(result).toHaveLength(0)
    })

    it('should handle array with no duplicates', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' }
      ]

      const result = uniqueById(items)
      expect(result).toHaveLength(3)
      expect(result).toEqual(items)
    })

    it('should preserve order of first occurrences', () => {
      const items = [
        { id: '1', name: 'First' },
        { id: '2', name: 'Second' },
        { id: '1', name: 'Duplicate' },
        { id: '3', name: 'Third' }
      ]

      const result = uniqueById(items)
      expect(result).toEqual([
        { id: '1', name: 'First' },
        { id: '2', name: 'Second' },
        { id: '3', name: 'Third' }
      ])
    })
  })

  describe('groupBy', () => {
    it('should group items by key', () => {
      const items = [
        { id: '1', category: 'A', name: 'Item 1' },
        { id: '2', category: 'B', name: 'Item 2' },
        { id: '3', category: 'A', name: 'Item 3' },
        { id: '4', category: 'B', name: 'Item 4' },
        { id: '5', category: 'C', name: 'Item 5' }
      ]

      const result = groupBy(items, 'category')
      
      expect(Object.keys(result)).toHaveLength(3)
      expect(result['A']).toHaveLength(2)
      expect(result['B']).toHaveLength(2)
      expect(result['C']).toHaveLength(1)
      expect(result['A'][0].name).toBe('Item 1')
      expect(result['A'][1].name).toBe('Item 3')
      expect(result['B'][0].name).toBe('Item 2')
      expect(result['B'][1].name).toBe('Item 4')
      expect(result['C'][0].name).toBe('Item 5')
    })

    it('should handle empty array', () => {
      const items: any[] = []
      const result = groupBy(items, 'category')
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should handle items with same key value', () => {
      const items = [
        { id: '1', status: 'active', name: 'Item 1' },
        { id: '2', status: 'active', name: 'Item 2' },
        { id: '3', status: 'active', name: 'Item 3' }
      ]

      const result = groupBy(items, 'status')
      expect(result['active']).toHaveLength(3)
      expect(result['active']).toEqual(items)
    })

    it('should handle numeric keys', () => {
      const items = [
        { id: '1', priority: 1, name: 'Item 1' },
        { id: '2', priority: 2, name: 'Item 2' },
        { id: '3', priority: 1, name: 'Item 3' }
      ]

      const result = groupBy(items, 'priority')
      expect(result['1']).toHaveLength(2)
      expect(result['2']).toHaveLength(1)
    })
  })

  describe('hexToRgb', () => {
    it('should convert valid hex color to RGB', () => {
      const result = hexToRgb('#FF0000')
      expect(result).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should convert hex color without #', () => {
      const result = hexToRgb('00FF00')
      expect(result).toEqual({ r: 0, g: 255, b: 0 })
    })

    it('should convert hex color with lowercase', () => {
      const result = hexToRgb('#0000ff')
      expect(result).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should handle mixed case hex', () => {
      const result = hexToRgb('#AbCdEf')
      expect(result).toEqual({ r: 171, g: 205, b: 239 })
    })

    it('should return null for invalid hex', () => {
      const result = hexToRgb('invalid')
      expect(result).toBeNull()
    })

    it('should return null for incomplete hex', () => {
      const result = hexToRgb('#FFF')
      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const result = hexToRgb('')
      expect(result).toBeNull()
    })

    it('should return null for hex with invalid characters', () => {
      const result = hexToRgb('#GGGGGG')
      expect(result).toBeNull()
    })
  })

  describe('getContrastColor', () => {
    it('should return black for light colors', () => {
      const result = getContrastColor('#FFFFFF')
      expect(result).toBe('#000000')
    })

    it('should return white for dark colors', () => {
      const result = getContrastColor('#000000')
      expect(result).toBe('#FFFFFF')
    })

    it('should return black for medium-light colors', () => {
      const result = getContrastColor('#808080') // Gray with brightness 128
      expect(result).toBe('#000000')
    })

    it('should return white for medium-dark colors', () => {
      const result = getContrastColor('#7F7F7F') // Gray with brightness 127.5
      expect(result).toBe('#FFFFFF')
    })

    it('should return black for white', () => {
      const result = getContrastColor('#FFFFFF')
      expect(result).toBe('#000000')
    })

    it('should return white for black', () => {
      const result = getContrastColor('#000000')
      expect(result).toBe('#FFFFFF')
    })

    it('should handle invalid hex gracefully', () => {
      const result = getContrastColor('invalid')
      expect(result).toBe('#000000')
    })

    it('should handle empty string gracefully', () => {
      const result = getContrastColor('')
      expect(result).toBe('#000000')
    })

    it('should return black for bright colors', () => {
      const result = getContrastColor('#FFFF00') // Yellow
      expect(result).toBe('#000000')
    })

    it('should return white for dark colors', () => {
      const result = getContrastColor('#000080') // Navy
      expect(result).toBe('#FFFFFF')
    })
  })
})

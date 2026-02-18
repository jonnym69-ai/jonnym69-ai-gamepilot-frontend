import { describe, it, expect } from 'vitest'
import { MOODS } from '../constants/masterMoods'
import { deriveMoodFromGame } from '../utils/moodMapping'

describe('deriveMoodFromGame', () => {
  it('should return a valid mood ID for games with genres', () => {
    const gameWithGenres = {
      id: '1',
      title: 'Test Game',
      genres: ['Action', 'Adventure']
    }

    const mood = deriveMoodFromGame(gameWithGenres)

    expect(MOODS.some(m => m.id === mood)).toBe(true)
  })

  it('should handle games without genres', () => {
    const gameWithoutGenres = {
      id: '2',
      title: 'Test Game',
      genres: []
    }

    const mood = deriveMoodFromGame(gameWithoutGenres)

    expect(typeof mood).toBe('string')
    expect(mood.length).toBeGreaterThan(0)
  })

  it('should handle undefined genres', () => {
    const gameWithoutGenres = {
      id: '3',
      title: 'Test Game'
    }

    const mood = deriveMoodFromGame(gameWithoutGenres)

    expect(typeof mood).toBe('string')
    expect(mood.length).toBeGreaterThan(0)
  })
})

describe('MOODS constant', () => {
  it('should have valid mood structure', () => {
    expect(Array.isArray(MOODS)).toBe(true)
    expect(MOODS.length).toBeGreaterThan(0)

    MOODS.forEach(mood => {
      expect(mood).toHaveProperty('id')
      expect(mood).toHaveProperty('name')
      expect(mood).toHaveProperty('emoji')
      expect(typeof mood.id).toBe('string')
      expect(typeof mood.name).toBe('string')
      expect(typeof mood.emoji).toBe('string')
    })
  })

  it('should have unique mood IDs', () => {
    const ids = MOODS.map(mood => mood.id)
    const uniqueIds = [...new Set(ids)]
    expect(uniqueIds.length).toBe(ids.length)
  })
})

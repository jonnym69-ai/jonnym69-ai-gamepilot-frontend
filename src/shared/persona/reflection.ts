/**
 * Persona reflection utilities
 * Provides reflection and insight generation for persona data
 */

export interface Reflection {
  id: string
  type: 'mood' | 'play_pattern' | 'genre_preference' | 'time_preference'
  title: string
  content: string
  timestamp: Date
  confidence: number
}

export function buildReflection(data: any): Reflection {
  return {
    id: data.id || Date.now().toString(),
    type: data.type || 'mood',
    title: data.title || 'Reflection',
    content: data.content || 'Generated reflection',
    timestamp: new Date(),
    confidence: data.confidence || 0.5
  }
}

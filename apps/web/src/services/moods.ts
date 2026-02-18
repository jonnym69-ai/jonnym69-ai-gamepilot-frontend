// Simple moods export for build compatibility
export const GAMING_MOODS = [
  {
    id: 'neutral',
    name: 'Neutral',
    description: 'Balanced gaming mood',
    color: '#6B7280',
    icon: '😊',
    energyLevel: 5,
    socialPreference: 'flexible',
    timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
    genreAffinities: [],
    category: 'vibe'
  }
]

// Legacy exports for backward compatibility
export const getMoods = () => GAMING_MOODS
export const mapGamesToMoods = (games: any[]) => {
  // Simple mapping logic - in a real implementation this would be more sophisticated
  return games.map(game => ({
    ...game,
    moods: ['neutral'] // Default mood for now
  }))
}
export const getMoodRecommendations = (games: any[], _targetMoodId: string, limit?: number) => 
  games.slice(0, limit || 10) // Simple fallback

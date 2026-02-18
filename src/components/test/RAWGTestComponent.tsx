// Test component for RAWG API integration
// Use this to verify the enhanced mood system works correctly

import React, { useState } from 'react'
import { rawgService } from '../../services/rawgService'
import { assignSmartMoodsWithRAWG } from '../../utils/smartMoodAssigner'
import { getRAWGEnhancedRecommendations } from '../../features/recommendation/recommendationEngine'

interface TestGame {
  title: string
  genres?: string[]
}

const RAWGTestComponent: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Sample games to test with
  const testGames: TestGame[] = [
    { title: 'Stardew Valley', genres: ['Simulation', 'RPG'] },
    { title: 'Dark Souls', genres: ['Action', 'RPG'] },
    { title: 'Minecraft', genres: ['Sandbox', 'Survival'] },
    { title: 'Hades', genres: ['Action', 'Roguelike'] },
    { title: 'Disco Elysium', genres: ['RPG', 'Adventure'] }
  ]

  const testRAWGService = async () => {
    setLoading(true)
    setError(null)
    setResults([])

    try {
      console.log('🧪 Testing RAWG API service...')
      
      // Test 1: Search for games
      const searchResults = await rawgService.searchGames('stardew valley', 1, 3)
      console.log('🔍 Search results:', searchResults.results.length)

      // Test 2: Get game details
      if (searchResults.results.length > 0) {
        const gameDetails = await rawgService.getGameDetails(searchResults.results[0].id)
        console.log('📋 Game details:', gameDetails.name)
      }

      // Test 3: Get games by mood
      const moodGames = await rawgService.searchGamesByMood(['relaxing', 'casual'], 1, 5)
      console.log('🎭 Mood games:', moodGames.results.length)

      setResults([
        { type: 'Search', count: searchResults.results.length, data: searchResults.results.slice(0, 2) },
        { type: 'Mood Search', count: moodGames.results.length, data: moodGames.results.slice(0, 2) }
      ])

    } catch (err) {
      console.error('❌ RAWG test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testEnhancedMoodAnalysis = async () => {
    setLoading(true)
    setError(null)
    setResults([])

    try {
      console.log('🧪 Testing enhanced mood analysis...')
      
      const moodResults = []
      
      for (const game of testGames) {
        const enhancedMoods = await assignSmartMoodsWithRAWG(game)
        moodResults.push({
          game: game.title,
          enhancedMoods,
          originalGenres: game.genres
        })
      }

      setResults([{ type: 'Enhanced Moods', data: moodResults }])

    } catch (err) {
      console.error('❌ Enhanced mood analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testEnhancedRecommendations = async () => {
    setLoading(true)
    setError(null)
    setResults([])

    try {
      console.log('🧪 Testing enhanced recommendations...')
      
      const testMoods = ['relaxing', 'intense', 'strategic', 'creative']
      const recommendationResults = []

      for (const mood of testMoods) {
        const recommendations = await getRAWGEnhancedRecommendations(mood, [], 3)
        recommendationResults.push({
          mood,
          count: recommendations.length,
          recommendations: recommendations.slice(0, 2)
        })
      }

      setResults([{ type: 'Enhanced Recommendations', data: recommendationResults }])

    } catch (err) {
      console.error('❌ Enhanced recommendations failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">RAWG Integration Test</h2>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testRAWGService}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test RAWG Service'}
        </button>

        <button
          onClick={testEnhancedMoodAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Testing...' : 'Test Enhanced Moods'}
        </button>

        <button
          onClick={testEnhancedRecommendations}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Testing...' : 'Test Enhanced Recommendations'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results.map((result, index) => (
        <div key={index} className="mb-6 p-4 border rounded">
          <h3 className="font-bold mb-2">{result.type}</h3>
          
          {result.count !== undefined && (
            <p className="text-sm text-gray-600 mb-2">Results: {result.count}</p>
          )}

          <div className="space-y-2">
            {result.data?.map((item: any, itemIndex: number) => (
              <div key={itemIndex} className="p-2 bg-gray-50 rounded">
                {item.game && (
                  <div>
                    <strong>{item.game}</strong>
                    {item.enhancedMoods && (
                      <div className="text-sm text-blue-600">
                        Moods: {item.enhancedMoods.join(', ')}
                      </div>
                    )}
                    {item.originalGenres && (
                      <div className="text-sm text-gray-600">
                        Genres: {item.originalGenres.join(', ')}
                      </div>
                    )}
                  </div>
                )}
                
                {item.name && (
                  <div>
                    <strong>{item.name}</strong>
                    {item.genres && (
                      <div className="text-sm text-gray-600">
                        Genres: {item.genres.map((g: any) => g.name).join(', ')}
                      </div>
                    )}
                    {item.rating && (
                      <div className="text-sm text-green-600">
                        Rating: {item.rating}/5
                      </div>
                    )}
                  </div>
                )}

                {item.mood && (
                  <div>
                    <strong>Mood: {item.mood}</strong>
                    {item.recommendations && (
                      <div className="mt-2">
                        {item.recommendations.map((rec: any, recIndex: number) => (
                          <div key={recIndex} className="text-sm p-2 bg-white rounded mt-1">
                            <strong>{rec.game?.name}</strong> - Score: {rec.score}
                            <div className="text-gray-600">{rec.explanation}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Test RAWG Service: Verifies basic API connectivity and data retrieval</li>
          <li>Test Enhanced Moods: Tests mood analysis with RAWG data integration</li>
          <li>Test Enhanced Recommendations: Tests recommendation system with RAWG data</li>
        </ol>
        <p className="text-xs text-gray-600 mt-2">
          Check the browser console for detailed logs and debugging information.
        </p>
      </div>
    </div>
  )
}

export default RAWGTestComponent

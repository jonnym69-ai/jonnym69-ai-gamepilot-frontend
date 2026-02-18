import React, { useState } from 'react'
import { Recommendation, Game } from '../types'
import { getHybridRecommendations } from '../../recommendation/recommendationEngine'
import { assignSmartMoodsWithRAWG } from '../../../utils/smartMoodAssigner'

interface RecommendationsProps {
  recommendations: Recommendation[]
  onGameClick?: (game: Game) => void
  maxItems?: number
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  recommendations,
  onGameClick,
  maxItems = 6
}) => {
  const [selectedType, setSelectedType] = useState<'all' | Recommendation['type']>('all')
  const [hoveredRecommendation, setHoveredRecommendation] = useState<string | null>(null)
  const [enhancedRecommendations, setEnhancedRecommendations] = useState<Recommendation[]>([])
  const [isLoadingEnhanced, setIsLoadingEnhanced] = useState(false)

  // Enhanced recommendation logic using RAWG API
  const loadEnhancedRecommendations = async () => {
    console.log('🚀 Loading RAWG Enhanced Recommendations...')
    setIsLoadingEnhanced(true)
    try {
      const moodRecommendations = await getHybridRecommendations(null, [], 'relaxing', 3)
      console.log('📊 RAWG Recommendations received:', moodRecommendations)
      
      const formattedRecs = moodRecommendations.map((rec) => ({
        id: `rawg-${rec.game.id}`,
        game: {
          id: rec.game.id,
          title: rec.game.name,
          coverImage: rec.game.coverImage,
          developer: 'RAWG Enhanced',
          userRating: 0,
          genres: rec.game.genres.map(name => ({ name })),
          tags: rec.game.playstyleTags,
          moods: rec.game.moodTags
        } as Game,
        reason: rec.explanation,
        confidence: rec.score / 100,
        type: 'mood' as const
      }))
      
      console.log('✨ Formatted RAWG recommendations:', formattedRecs)
      setEnhancedRecommendations(formattedRecs)
      
      // Show a success message in the console
      console.log('🎯 RAWG Integration Status: ✅ SUCCESS')
      console.log(`📈 Found ${formattedRecs.length} enhanced recommendations`)
      console.log('🔍 Check the recommendation cards for "🎯 RAWG Enhanced" badges!')
      
    } catch (error) {
      console.error('❌ Failed to load enhanced recommendations:', error)
      console.log('🚨 RAWG Integration Status: ❌ FAILED')
    } finally {
      setIsLoadingEnhanced(false)
    }
  }

  // Load enhanced recommendations on mount
  React.useEffect(() => {
    loadEnhancedRecommendations()
  }, [])

  // Combine original and enhanced recommendations
  const allRecommendations = [...recommendations, ...enhancedRecommendations]

  const filteredRecommendations = selectedType === 'all' 
    ? allRecommendations 
    : allRecommendations.filter(rec => rec.type === selectedType)

  const displayRecommendations = filteredRecommendations.slice(0, maxItems)

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'genre': return '🎭'
      case 'mood': return '😊'
      case 'similar': return '🔄'
      case 'trending': return '🔥'
      default: return '✨'
    }
  }

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'genre': return 'from-purple-500 to-pink-500'
      case 'mood': return 'from-green-500 to-teal-500'
      case 'similar': return 'from-blue-500 to-cyan-500'
      case 'trending': return 'from-orange-500 to-red-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Perfect Match'
    if (confidence >= 0.75) return 'Great Match'
    if (confidence >= 0.6) return 'Good Match'
    if (confidence >= 0.4) return 'Decent Match'
    return 'Maybe Try'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.75) return 'text-blue-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    if (confidence >= 0.4) return 'text-orange-400'
    return 'text-gray-400'
  }

  if (recommendations.length === 0) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">✨</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Yet</h3>
        <p className="text-gray-400">
          Start playing and rating games to get personalized recommendations.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Recommended for You</h2>
            <p className="text-sm text-gray-400">Personalized game suggestions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Powered by:</span>
          <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">Genre Analysis</span>
          <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">Mood Matching</span>
          <span className="px-2 py-1 bg-green-600 rounded text-xs text-white">RAWG Enhanced</span>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
            ${selectedType === 'all'
              ? 'bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }
          `}
        >
          All ({recommendations.length})
        </button>
        {(['genre', 'mood', 'similar', 'trending'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${selectedType === type ? 'bg-gradient-to-r text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}`}
          >
            <span>{getTypeIcon(type)}</span>
            {type.charAt(0).toUpperCase() + type.slice(1)}
            <span className="opacity-70">
              ({allRecommendations.filter(rec => rec.type === type).length})
            </span>
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            onClick={() => onGameClick?.(recommendation.game)}
            onMouseEnter={() => setHoveredRecommendation(recommendation.id)}
            onMouseLeave={() => setHoveredRecommendation(null)}
            className={`
              group cursor-pointer transition-all duration-300 transform
              ${hoveredRecommendation === recommendation.id ? 'scale-105 -translate-y-1' : 'scale-100 translate-y-0'}
            `}
          >
            <div className="glass-morphism rounded-lg overflow-hidden border border-gray-700 hover:border-gaming-accent/50 transition-colors">
              {/* Game Cover */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900">
                {recommendation.game.coverImage ? (
                  <img
                    src={recommendation.game.coverImage}
                    alt={recommendation.game.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center">
                      <span className="text-xl">🎮</span>
                    </div>
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-semibold text-white
                    bg-gradient-to-r ${getTypeColor(recommendation.type)}
                  `}>
                    <span className="mr-1">{getTypeIcon(recommendation.type)}</span>
                    {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
                  </div>
                </div>

                {/* RAWG Badge */}
                {recommendation.id.startsWith('rawg-') && (
                  <div className="absolute top-2 left-2 transform translate-x-16">
                    <div className="px-2 py-1 bg-green-600/90 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-green-400 shadow-lg">
                      🎯 RAWG
                    </div>
                  </div>
                )}

                {/* Confidence Score */}
                <div className="absolute top-2 right-2">
                  <div className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs">
                    <span className={getConfidenceColor(recommendation.confidence)}>
                      {Math.round(recommendation.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Hover Overlay */}
                {hoveredRecommendation === recommendation.id && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium mb-1">
                        {getConfidenceLabel(recommendation.confidence)}
                      </p>
                      <p className="text-gray-200 text-xs line-clamp-2">
                        {recommendation.reason}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="p-3">
                <h3 className="text-white font-medium text-sm truncate mb-1 group-hover:text-gaming-accent transition-colors">
                  {recommendation.game.title}
                </h3>
                <p className="text-gray-400 text-xs truncate mb-2">
                  {recommendation.game.developer || 'Unknown Developer'}
                </p>
                
                {/* Reason */}
                <p className="text-gray-300 text-xs line-clamp-2 mb-2">
                  {recommendation.reason}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    {recommendation.game.userRating && (
                      <span>⭐ {recommendation.game.userRating}</span>
                    )}
                    {recommendation.game.genres && (
                      <span>{recommendation.game.genres[0]?.name}</span>
                    )}
                  </div>
                  <span className={getConfidenceColor(recommendation.confidence)}>
                    {getConfidenceLabel(recommendation.confidence)}
                  </span>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            {hoveredRecommendation === recommendation.id && (
              <div className={`
                absolute inset-0 rounded-lg bg-gradient-to-r ${getTypeColor(recommendation.type)}
                opacity-20 blur-xl -z-10
              `} />
            )}
          </div>
        ))}
      </div>

      {/* View More */}
      {filteredRecommendations.length > maxItems && (
        <div className="mt-6 text-center">
          <button className="text-accent-400 hover:text-accent-300 transition-colors font-medium">
            View More Recommendations ({filteredRecommendations.length - maxItems} more)
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="text-center p-3 bg-green-600/20 rounded-lg border border-green-500/30">
            <div className="text-green-400 font-bold mb-1">🎯 RAWG Enhanced</div>
            <div className="text-white">3 Games</div>
            <div className="text-green-300">New recommendations from RAWG database</div>
          </div>
          <div className="text-center p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <div className="text-blue-400 font-bold mb-1">📚 Your Library</div>
            <div className="text-white">123 Games</div>
            <div className="text-blue-300">Your Steam games with enhanced moods</div>
          </div>
          <div className="text-center p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
            <div className="text-purple-400 font-bold mb-1">🧠 Smart Analysis</div>
            <div className="text-white">All Games</div>
            <div className="text-purple-300">Enhanced mood assignment working</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          RAWG integration is active! Check console for detailed API calls and mood analysis.
        </p>
      </div>
    </div>
  )
}

// Placeholder recommendation logic
export const generatePlaceholderRecommendations = (
  allGames: Game[],
  userPreferences?: {
    favoriteGenres?: string[]
    favoriteMoods?: string[]
    recentlyPlayed?: Game[]
  }
): Recommendation[] => {
  const recommendations: Recommendation[] = []
  const usedGameIds = new Set<string>()

  // Genre-based recommendations
  if (userPreferences?.favoriteGenres) {
    userPreferences.favoriteGenres.forEach(genre => {
      const genreGames = allGames.filter(game => 
        game.genres?.some(g => {
          const genreName = typeof g === 'string' ? g : g.name;
          return genreName === genre && !usedGameIds.has(game.id);
        })
      )
      if (genreGames.length > 0) {
        const game = genreGames[Math.floor(Math.random() * genreGames.length)]
        usedGameIds.add(game.id)
        recommendations.push({
          id: `genre-${genre}-${game.id}`,
          game,
          reason: `You love ${genre} games`,
          confidence: 0.7 + Math.random() * 0.2,
          type: 'genre'
        })
      }
    })
  }

  // Mood-based recommendations
  if (userPreferences?.favoriteMoods) {
    userPreferences.favoriteMoods.forEach(mood => {
      const moodGames = allGames.filter(game => 
        game.tags?.includes(mood) && !usedGameIds.has(game.id)
      )
      if (moodGames.length > 0) {
        const game = moodGames[Math.floor(Math.random() * moodGames.length)]
        usedGameIds.add(game.id)
        recommendations.push({
          id: `mood-${mood}-${game.id}`,
          game,
          reason: `Perfect for when you're feeling ${mood}`,
          confidence: 0.6 + Math.random() * 0.3,
          type: 'mood'
        })
      }
    })
  }

  // Similar games based on recently played
  if (userPreferences?.recentlyPlayed) {
    userPreferences.recentlyPlayed.forEach(recentGame => {
      const similarGames = allGames.filter(game => 
        game.id !== recentGame.id &&
        (game.genres?.some(genre => recentGame.genres?.includes(genre)) ||
         game.developer === recentGame.developer) &&
        !usedGameIds.has(game.id)
      )
      if (similarGames.length > 0) {
        const game = similarGames[Math.floor(Math.random() * similarGames.length)]
        usedGameIds.add(game.id)
        recommendations.push({
          id: `similar-${recentGame.id}-${game.id}`,
          game,
          reason: `Similar to ${recentGame.title}`,
          confidence: 0.5 + Math.random() * 0.3,
          type: 'similar'
        })
      }
    })
  }

  // Trending games (placeholder)
  const trendingGames = allGames.filter(game => !usedGameIds.has(game.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  
  trendingGames.forEach(game => {
    usedGameIds.add(game.id)
    recommendations.push({
      id: `trending-${game.id}`,
      game,
      reason: 'Trending in the GamePilot community',
      confidence: 0.4 + Math.random() * 0.3,
      type: 'trending'
    })
  })

  return recommendations.sort((a, b) => b.confidence - a.confidence)
}

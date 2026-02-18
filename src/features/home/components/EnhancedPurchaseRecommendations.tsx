import React, { useState, useEffect } from 'react'
import { SteamStorefrontService, type PurchaseRecommendation } from '../../../services/steamStorefrontService'
import { AffiliateService } from '../../../services/affiliateService'
import type { Game } from '@gamepilot/types'

interface EnhancedPurchaseRecommendationsProps {
  libraryGames: Game[]
  personaProfile: any
}

export const EnhancedPurchaseRecommendations: React.FC<EnhancedPurchaseRecommendationsProps> = ({
  libraryGames,
  personaProfile
}) => {
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    budget: 50,
    preferredGenres: [] as string[],
    preferredMoods: [] as string[],
    includeDiscounts: true
  })

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      console.log('🛒 Loading enhanced purchase recommendations...')

      // Extract user preferences from persona profile
      const userGenres = personaProfile?.signals?.preferredGenres || []
      const userMoods = personaProfile?.signals?.preferredMoods || []

      // Get recommendations from Steam Storefront API
      const recs = await SteamStorefrontService.getPurchaseRecommendations(
        libraryGames,
        preferences.preferredGenres.length > 0 ? preferences.preferredGenres : userGenres,
        preferences.preferredMoods.length > 0 ? preferences.preferredMoods : userMoods,
        preferences.budget,
        9 // Show 9 recommendations (3x3 grid)
      )

      setRecommendations(recs)
      console.log('✅ Purchase recommendations loaded:', recs.length)
    } catch (error) {
      console.error('❌ Error loading purchase recommendations:', error)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [])

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">🛒</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">What Should I Buy?</h2>
            <p className="text-sm text-gray-400">Personalized purchase recommendations</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-white font-medium mb-3">Recommendation Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="budget-select" className="text-gray-300 text-sm">Max Budget ($)</label>
            <select
              id="budget-select"
              value={preferences.budget}
              onChange={(e) => setPreferences(prev => ({ ...prev, budget: Number(e.target.value) }))}
              className="bg-gray-700 text-white rounded px-3 py-2 text-sm"
              aria-label="Select maximum budget for game recommendations"
            >
              <option value={20}>$20</option>
              <option value={30}>$30</option>
              <option value={50}>$50</option>
              <option value={70}>$70</option>
              <option value={100}>$100+</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="discounts-checkbox"
              type="checkbox"
              checked={preferences.includeDiscounts}
              onChange={(e) => setPreferences(prev => ({ ...prev, includeDiscounts: e.target.checked }))}
              className="rounded"
              aria-describedby="discounts-description"
            />
            <label htmlFor="discounts-checkbox" className="text-gray-300 text-sm">Show Discounts 🏷️</label>
            <span id="discounts-description" className="sr-only">Include games that are currently on discount in recommendations</span>
          </div>

          <div className="col-span-2">
            <p className="text-gray-300 text-sm mb-2">Recommendations based on your gaming profile</p>
            <div className="flex gap-2 text-xs">
              <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">Your Genres</span>
              <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">Your Moods</span>
              <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded">Play History</span>
            </div>
          </div>
        </div>

        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh Recommendations'}
        </button>
      </div>

      {/* Recommendations */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Finding perfect games for you...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div key={rec.appId} className="glass-morphism rounded-lg overflow-hidden border border-gray-700 hover:border-green-500/50 transition-colors group">
              {/* Game Header Image */}
              <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                <img
                  src={rec.headerImage}
                  alt={rec.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Discount Badge */}
                {rec.discountPercent && rec.discountPercent > 0 && (
                  <div className="absolute top-2 left-2">
                    <div className="px-2 py-1 bg-red-600/90 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-red-400">
                      -{rec.discountPercent}%
                    </div>
                  </div>
                )}

                {/* Metacritic Score */}
                {rec.metacriticScore && (
                  <div className="absolute top-2 right-2">
                    <div className={`px-2 py-1 backdrop-blur-sm rounded-full text-xs font-bold ${
                      rec.metacriticScore >= 80 ? 'bg-green-600/90 text-white border border-green-400' :
                      rec.metacriticScore >= 60 ? 'bg-yellow-600/90 text-white border border-yellow-400' :
                      'bg-red-600/90 text-white border border-red-400'
                    }`}>
                      {rec.metacriticScore}
                    </div>
                  </div>
                )}

                {/* Alignment Score */}
                <div className="absolute bottom-2 right-2">
                  <div className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs">
                    <span className="text-green-400 font-medium">
                      {Math.round(rec.alignmentScore * 100)}% match
                    </span>
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2 group-hover:text-green-400 transition-colors">
                  {rec.title}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mb-2">
                  {rec.discountPercent && rec.discountPercent > 0 ? (
                    <>
                      <span className="text-green-400 font-bold text-lg">
                        ${(rec.price / 100).toFixed(2)}
                      </span>
                      <span className="text-gray-500 line-through text-sm">
                        ${(rec.originalPrice! / 100).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-white font-bold text-lg">
                      ${(rec.price / 100).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-xs line-clamp-3 mb-3">
                  {rec.description}
                </p>

                {/* Genres & Platforms */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.genres.slice(0, 2).map(genre => (
                    <span key={genre} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                      {genre}
                    </span>
                  ))}
                  {rec.platforms.includes('windows') && (
                    <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                      Windows
                    </span>
                  )}
                </div>

                {/* Mood Suitability & Playtime */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>🎭 {rec.moodSuitability}</span>
                  <span>⏱️ {rec.estimatedPlaytime}</span>
                </div>

                {/* Reasoning */}
                <p className="text-gray-300 text-xs line-clamp-2 mb-3 italic">
                  {rec.reasoning}
                </p>

                {/* Purchase Options */}
                <div className="space-y-3">
                  {/* Steam Link (Primary) */}
                  <a
                    href={`https://store.steampowered.com/app/${rec.appId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">🛒</span>
                      Buy on Steam
                    </span>
                    <span className="text-xs opacity-90">Official Store</span>
                  </a>

                  {/* Affiliate Links */}
                  {rec.affiliateLinks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 font-medium">Alternative Stores:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {rec.affiliateLinks.slice(0, 4).map((affiliate, index) => (
                          <a
                            key={affiliate.store}
                            href={affiliate.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r ${affiliate.color} hover:opacity-90 text-white rounded text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg`}
                            title={`Check on ${affiliate.label} - ${affiliate.commission} commission`}
                          >
                            <span className="text-sm">{affiliate.icon}</span>
                            <span className="truncate">{affiliate.label}</span>
                          </a>
                        ))}
                      </div>
                      {rec.affiliateLinks.length > 4 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{rec.affiliateLinks.length - 4} more options
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Yet</h3>
          <p className="text-gray-400">
            Try adjusting your preferences or play more games to get better recommendations.
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="text-center p-3 bg-green-600/90 rounded-lg border-2 border-green-400 shadow-lg">
            <div className="text-green-100 font-bold mb-1">🎮 Games Found</div>
            <div className="text-white font-medium">{recommendations.length}</div>
            <div className="text-green-100 text-sm">Steam recommendations</div>
          </div>
          <div className="text-center p-3 bg-blue-600/90 rounded-lg border-2 border-blue-400 shadow-lg">
            <div className="text-blue-100 font-bold mb-1">🎯 Avg Match</div>
            <div className="text-white font-medium">
              {recommendations.length > 0 ? Math.round(recommendations.reduce((acc, r) => acc + r.alignmentScore, 0) / recommendations.length * 100) : 0}%
            </div>
            <div className="text-blue-100 text-sm">Personal compatibility</div>
          </div>
          <div className="text-center p-3 bg-purple-600/90 rounded-lg border-2 border-purple-400 shadow-lg">
            <div className="text-purple-100 font-bold mb-1">�️ On Sale</div>
            <div className="text-white font-medium">
              {recommendations.filter(r => r.discountPercent && r.discountPercent > 0).length}
            </div>
            <div className="text-purple-100 text-sm">Discounted games</div>
          </div>
          <div className="text-center p-3 bg-orange-600/90 rounded-lg border-2 border-orange-400 shadow-lg">
            <div className="text-orange-100 font-bold mb-1">⭐ Avg Rating</div>
            <div className="text-white font-medium">
              {recommendations.length > 0 ?
                Math.round(recommendations.filter(r => r.metacriticScore).reduce((acc, r) => acc + (r.metacriticScore || 0), 0) /
                recommendations.filter(r => r.metacriticScore).length) || 'N/A'
                : 'N/A'
              }
            </div>
            <div className="text-orange-100 text-sm">Metacritic score</div>
          </div>
        </div>
      </div>
    </div>
  )
}

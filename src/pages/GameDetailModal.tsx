import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLibraryStore } from '../stores/useLibraryStore'
import { launchGame } from '../utils/launchGame'
import { fetchSteamStoreData, type SteamStoreData, parsePriceInfo } from '../services/steamStore'
import { usePriceStore } from '../stores/priceStore'
import { 
  ScreenshotCarousel, 
  TrailerPlayer, 
  InfoSection, 
  TagsList, 
  PriceBadge 
} from '../components/gameDetail'

export const GameDetailModal: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const games = useLibraryStore(state => state.games)

  const game = games.find(g => g.id === id)
  
  // Extract hero image from enriched Steam data
  const heroImage = game ? ((game as any).capsuleImage || (game as any).headerImage || (game as any).smallHeaderImage || game.coverImage) : null
  
  // Scroll-based motion values for parallax effect
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, -80])
  
  // State for Steam store data
  const [storeData, setStoreData] = useState<SteamStoreData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Price store for caching
  const { actions } = usePriceStore()

  // Get mood tags for game (using tags directly)
  const gameMoods: string[] = game?.tags || []

  // Fetch Steam store data on component mount
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!game) return

      // Extract appId from game.id (Steam games use format "steam-{appId}")
      const appIdMatch = game.id?.toString().match(/^steam-(\d+)$/)
      const appId = appIdMatch ? parseInt(appIdMatch[1], 10) : null

      if (!appId) {
        setError('No valid Steam app ID found')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchSteamStoreData(appId)
        if (data) {
          setStoreData(data)
          
          // Cache price information
          const priceInfo = parsePriceInfo(data)
          if (priceInfo) {
            actions.setPrice(appId, priceInfo)
          }
        } else {
          setError('Failed to fetch Steam store data')
        }
      } catch (err) {
        setError('Error fetching Steam store data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoreData()
  }, [game])

  const handleLaunch = () => {
    // Extract appId from game.id (Steam games use format "steam-{appId}")
    const appIdMatch = game?.id?.toString().match(/^steam-(\d+)$/)
    const appId = appIdMatch ? parseInt(appIdMatch[1], 10) : null
    
    if (appId) {
      launchGame(appId)
    } else {
      console.warn('No valid appId found for game:', game?.title)
    }
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <div className="text-white text-xl mb-2">Game Not Found</div>
          <div className="text-gray-300">The requested game could not be found in your library.</div>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-gaming-accent text-white rounded-lg hover:bg-gaming-accent/80 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
      {/* Cinematic Hero Banner */}
      <div className="relative w-full h-[400px] mb-8 overflow-hidden">
        {/* Background with enhanced blur and parallax */}
        <motion.div
          style={{ y }}
          className="absolute inset-0"
        >
          <img
            src={heroImage || 'https://via.placeholder.com/1920x400/1e3a8a/ffffff?text=Game+Background'}
            alt={game?.title || 'Game'}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90" />
          {/* Animated overlay effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                {/* Era Badge */}
                <div className="mb-3">
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-medium backdrop-blur-sm">
                    🕰️ From this era: {game?.releaseYear || 'Classic'}
                  </span>
                </div>
                
                {/* Title and Platform */}
                <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-2">
                  {game?.title}
                </h1>
                <div className="flex items-center gap-4 text-white/80 text-lg">
                  <span>{game?.platforms?.map(platform => platform.name).join(' • ') || 'Unknown Platform'}</span>
                  {game?.hoursPlayed && (
                    <span className="flex items-center gap-1">
                      <span>⏱️</span>
                      {Math.floor(game.hoursPlayed)}h played
                    </span>
                  )}
                </div>
              </div>
              
              {/* Launch Button */}
              <motion.button
                onClick={handleLaunch}
                className="px-8 py-4 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-gaming-accent/50 flex items-center gap-3 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl">▶️</span>
                <span>Launch Game</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Main Game Info (2/3 width) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Identity + Mood Layer */}
            <div className="glass-morphism rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🎭</span>
                Identity & Mood
              </h2>
              
              <div className="space-y-6">
                {/* Mood Tags */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Current Mood Tags</h3>
                  <div className="flex flex-wrap gap-3">
                    {gameMoods.length > 0 ? (
                      gameMoods.map((mood) => (
                        <span key={mood} className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-purple-200 backdrop-blur-sm">
                          {mood === 'Chill' && '😌 Chill'}
                          {mood === 'Competitive' && '🏆 Competitive'}
                          {mood === 'Story' && '📖 Story'}
                          {mood === 'Creative' && '🎨 Creative'}
                          {mood === 'Social' && '👥 Social'}
                          {mood === 'Dark' && '🌙 Dark'}
                          {mood === 'Fast-Paced' && '⚡ Fast-Paced'}
                          {mood}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">No mood tags assigned</span>
                    )}
                  </div>
                </div>
                
                {/* Emotional Profile */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">What this game says about you</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-gray-300 leading-relaxed">
                      {gameMoods.includes('Competitive') && "You're driven by achievement and enjoy testing your skills against others. "}
                      {gameMoods.includes('Story') && "You appreciate deep narratives and emotional storytelling experiences. "}
                      {gameMoods.includes('Creative') && "You love self-expression and building unique experiences. "}
                      {gameMoods.includes('Social') && "You value connection and shared experiences with others. "}
                      {gameMoods.includes('Chill') && "You prefer relaxed, stress-free gaming sessions. "}
                      {gameMoods.includes('Dark') && "You're drawn to mysterious and atmospheric experiences. "}
                      {gameMoods.includes('Fast-Paced') && "You thrive on adrenaline and quick decision-making. "}
                      {!gameMoods.length && "This game's personality is waiting to be discovered through your playstyle."}
                    </p>
                  </div>
                </div>
                
                {/* Play Patterns */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">When you usually play this</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {game?.hoursPlayed && game.hoursPlayed > 20 ? (
                      <>
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                          <div className="text-blue-300 text-sm font-medium">Weekend</div>
                          <div className="text-blue-100 text-xs mt-1">Deep Sessions</div>
                        </div>
                        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                          <div className="text-purple-300 text-sm font-medium">Evening</div>
                          <div className="text-purple-100 text-xs mt-1">Wind Down</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                          <div className="text-green-300 text-sm font-medium">Quick Breaks</div>
                          <div className="text-green-100 text-xs mt-1">Short Sessions</div>
                        </div>
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                          <div className="text-yellow-300 text-sm font-medium">Exploring</div>
                          <div className="text-yellow-100 text-xs mt-1">First Time</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Game Details */}
            <div className="glass-morphism rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🎮</span>
                Game Details
              </h2>
              
              <div className="space-y-6">
                {/* Cover Art */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-64 h-96 rounded-xl overflow-hidden cinematic-shadow">
                    <img 
                      src={game.coverImage || 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=Game+Cover'}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Game Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">{game.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        game.playStatus === 'playing' ? 'bg-green-500 text-white' :
                        game.playStatus === 'completed' ? 'bg-blue-500 text-white' :
                        game.playStatus === 'backlog' ? 'bg-yellow-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {game.playStatus === 'playing' && '▶️ Playing'}
                        {game.playStatus === 'completed' && '✅ Completed'}
                        {game.playStatus === 'backlog' && '📋 Backlog'}
                        {game.playStatus === 'paused' && '⏸️ Paused'}
                        {game.playStatus === 'abandoned' && '🚫 Abandoned'}
                      </span>
                    </div>
                  </div>

                  <div className="text-gray-300">
                    <p className="mb-2">{game.platforms?.map(platform => platform.name).join(' • ') || 'Unknown Platform'}</p>
                    {game.hoursPlayed && (
                      <p className="mb-2">Playtime: {Math.floor(game.hoursPlayed)}h</p>
                    )}
                    {game.tags && game.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {game.tags?.map((tag: string, index: number) => {
                          return (
                            <span key={`${tag}-${index}`} className="px-3 py-1 bg-gaming-accent/20 rounded-full text-xs text-gaming-accent">
                              {tag}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6 mb-8">
                  <button
                    onClick={handleLaunch}
                    className="px-6 py-3 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>▶️</span>
                    Play
                  </button>
                  <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors">
                    📊 View Stats
                  </button>
                  <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors">
                    ⚙️ Settings
                  </button>
                </div>

                {/* Steam Store Data Section */}
                {storeData && (
                  <div className="space-y-8">
                    {/* Price Badge */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white">Store Information</h3>
                      <PriceBadge 
                        priceInfo={storeData ? parsePriceInfo(storeData) : undefined}
                      />
                    </div>

                    {/* Screenshots Carousel */}
                    {storeData.data.screenshots && storeData.data.screenshots.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Screenshots</h3>
                        <ScreenshotCarousel screenshots={storeData.data.screenshots} />
                      </div>
                    )}

                    {/* Trailer Player */}
                    {storeData.data.movies && storeData.data.movies.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Trailer</h3>
                        <TrailerPlayer movies={storeData.data.movies} />
                      </div>
                    )}

                    {/* Game Info Section */}
                    <InfoSection
                      releaseDate={storeData.data.release_date.date}
                      developers={storeData.data.developers}
                      publishers={storeData.data.publishers}
                      genres={storeData.data.genres}
                      platforms={storeData.data.platforms}
                      achievements={storeData.data.achievements}
                    />

                    {/* Tags */}
                    {storeData.data.categories && storeData.data.categories.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Tags</h3>
                        <TagsList tags={storeData.data.categories} />
                      </div>
                    )}

                    {/* Description */}
                    {storeData.data.detailed_description && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                        <div 
                          className="text-gray-300 prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: storeData.data.detailed_description }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-gaming-accent border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading Steam store data...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-8">
                    <div className="text-red-400 mb-4">⚠️</div>
                    <p className="text-gray-300">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Shelves (1/3 width) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Stats + History */}
            <div className="glass-morphism rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                Stats & History
              </h2>
              
              <div className="space-y-4">
                {/* Playtime Stats */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Total Playtime</span>
                    <span className="text-white font-bold">
                      {game?.hoursPlayed ? `${Math.floor(game.hoursPlayed)}h ${Math.floor((game.hoursPlayed % 1) * 60)}m` : '0h'}
                    </span>
                  </div>
                  {game?.lastPlayed && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Last Played</span>
                      <span className="text-gray-400 text-sm">
                        {new Date(game.lastPlayed).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Achievements */}
                {storeData?.data.achievements && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Achievements</span>
                      <span className="text-white font-bold">
                        {storeData.data.achievements.total || 0}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Sessions Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Recent Sessions</h3>
                  <div className="space-y-2">
                    {game?.lastPlayed && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-300">
                          {new Date(game.lastPlayed).toLocaleDateString()} - {game?.hoursPlayed ? `${Math.floor(game.hoursPlayed)}h` : 'Quick session'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-400">First played - Added to library</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions Panel */}
            <div className="glass-morphism rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                Actions
              </h2>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <span>🏷️</span>
                  Add Tags
                </button>
                <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <span>📚</span>
                  Add to Shelf
                </button>
                <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <span>✅</span>
                  Mark as Completed
                </button>
                <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <span>⭐</span>
                  Rate Mood
                </button>
                <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <span>✏️</span>
                  Edit Metadata
                </button>
              </div>
            </div>
            
            {/* Shelves - Game Recommendations */}
            <div className="glass-morphism rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📚</span>
                Shelves
              </h2>
              
              <div className="space-y-8">
                {/* From This Era */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🕰️</span>
                    From This Era
                  </h3>
                  <div className="space-y-3">
                    {games
                      .filter(g => g.id !== game?.id && g.releaseYear === game?.releaseYear)
                      .slice(0, 3)
                      .map((eraGame) => (
                        <div key={eraGame.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gaming-accent/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <img 
                              src={eraGame.coverImage || 'https://via.placeholder.com/60x80/8b5cf6/ffffff?text=Game'}
                              alt={eraGame.title}
                              className="w-12 h-16 rounded object-cover"
                            />
                            <div>
                              <h4 className="text-lg font-semibold text-white">{eraGame.title}</h4>
                              <p className="text-sm text-gray-400">{eraGame.releaseYear} • {eraGame.platforms?.[0]?.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gaming-accent">Same Era</span>
                          </div>
                        </div>
                      ))}
                    {games.filter(g => g.id !== game?.id && g.releaseYear === game?.releaseYear).length === 0 && (
                      <p className="text-gray-400 text-center py-4">No other games from this era</p>
                    )}
                  </div>
                </div>
                
                {/* Similar Vibes */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🎭</span>
                    Similar Vibes
                  </h3>
                  <div className="space-y-3">
                    {games
                      .filter(g => g.id !== game?.id && g.tags && game?.tags && g.tags.some(tag => game.tags!.includes(tag)))
                      .slice(0, 3)
                      .map((vibeGame) => (
                        <div key={vibeGame.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gaming-accent/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <img 
                              src={vibeGame.coverImage || 'https://via.placeholder.com/60x80/8b5cf6/ffffff?text=Game'}
                              alt={vibeGame.title}
                              className="w-12 h-16 rounded object-cover"
                            />
                            <div>
                              <h4 className="text-lg font-semibold text-white">{vibeGame.title}</h4>
                              <p className="text-sm text-gray-400">
                                {vibeGame.tags?.filter(tag => game?.tags?.includes(tag)).slice(0, 2).join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gaming-accent">Similar Mood</span>
                          </div>
                        </div>
                      ))}
                    {games.filter(g => g.id !== game?.id && g.tags && game?.tags && g.tags.some(tag => game.tags!.includes(tag))).length === 0 && (
                      <p className="text-gray-400 text-center py-4">No games with similar vibes found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

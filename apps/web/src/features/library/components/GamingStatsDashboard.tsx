import React from 'react'
import type { Game } from '@gamepilot/types'

interface GamingStatsDashboardProps {
  games: Game[]
  className?: string
}

export const GamingStatsDashboard: React.FC<GamingStatsDashboardProps> = ({ 
  games, 
  className = '' 
}) => {
  // Calculate statistics
  const totalGames = games.length
  const totalPlaytime = games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0)
  const completedGames = games.filter(game => game.playStatus === 'completed').length
  const playingGames = games.filter(game => game.playStatus === 'playing').length
  const backlogGames = games.filter(game => game.playStatus === 'backlog').length
  const unplayedGames = games.filter(game => game.playStatus === 'unplayed').length
  
  // Genre distribution
  const genreDistribution = games.reduce((acc, game) => {
    const genres = game.genres || []
    genres.forEach(genre => {
      const genreName = typeof genre === 'string' ? genre : genre.name || 'Unknown'
      acc[genreName] = (acc[genreName] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  // Platform distribution
  const platformDistribution = games.reduce((acc, game) => {
    const platforms = game.platforms || []
    platforms.forEach(platform => {
      const platformName = platform.name || 'Unknown'
      acc[platformName] = (acc[platformName] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  // Play status distribution
  const statusDistribution = {
    playing: playingGames,
    completed: completedGames,
    backlog: backlogGames,
    unplayed: unplayedGames,
    paused: games.filter(game => game.playStatus === 'paused').length,
    abandoned: games.filter(game => game.playStatus === 'abandoned').length
  }

  // Calculate completion rate
  const completionRate = totalGames > 0 ? (completedGames / totalGames) * 100 : 0

  // Most played games
  const mostPlayedGames = [...games]
    .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
    .slice(0, 5)

  // Recently played games
  const recentlyPlayedGames = [...games]
    .filter(game => game.lastPlayed)
    .sort((a, b) => new Date(b.lastPlayed!).getTime() - new Date(a.lastPlayed!).getTime())
    .slice(0, 5)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Games"
          value={totalGames}
          icon="🎮"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Playtime"
          value={`${Math.floor(totalPlaytime)}h`}
          icon="⏱️"
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Completed"
          value={`${completedGames}/${totalGames}`}
          icon="✅"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate.toFixed(1)}%`}
          icon="📊"
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Play Status Chart */}
        <ChartCard title="Play Status Distribution">
          <div className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => {
              if (count === 0) return null
              const percentage = totalGames > 0 ? (count / totalGames) * 100 : 0
              const colors = {
                playing: 'from-green-500 to-emerald-600',
                completed: 'from-blue-500 to-indigo-600',
                backlog: 'from-yellow-500 to-orange-600',
                unplayed: 'from-gray-500 to-gray-600',
                paused: 'from-orange-500 to-red-600',
                abandoned: 'from-red-500 to-gray-600'
              }
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium text-gray-300">{status}</span>
                    <span className="text-gray-400">{count} games ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[status as keyof typeof colors]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </ChartCard>

        {/* Genre Distribution */}
        <ChartCard title="Genre Distribution">
          <div className="space-y-3">
            {Object.entries(genreDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([genre, count]) => {
                const percentage = totalGames > 0 ? (count / totalGames) * 100 : 0
                const colors = [
                  'from-purple-500 to-pink-600',
                  'from-blue-500 to-cyan-600',
                  'from-green-500 to-emerald-600',
                  'from-yellow-500 to-orange-600',
                  'from-red-500 to-rose-600',
                  'from-indigo-500 to-purple-600'
                ]
                const colorIndex = Object.keys(genreDistribution).indexOf(genre) % colors.length
                
                return (
                  <div key={genre} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-300">{genre}</span>
                      <span className="text-gray-400">{count} games ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[colorIndex]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </ChartCard>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Played Games */}
        <ListCard title="Most Played Games">
          <div className="space-y-3">
            {mostPlayedGames.map((game, index) => (
              <div key={game.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{game.title}</h4>
                    <p className="text-xs text-gray-400">{Math.floor(game.hoursPlayed || 0)} hours played</p>
                  </div>
                </div>
                <div className="text-gaming-primary font-bold">
                  {Math.floor(game.hoursPlayed || 0)}h
                </div>
              </div>
            ))}
          </div>
        </ListCard>

        {/* Recently Played Games */}
        <ListCard title="Recently Played">
          <div className="space-y-3">
            {recentlyPlayedGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    🎮
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{game.title}</h4>
                    <p className="text-xs text-gray-400">
                      {game.lastPlayed ? new Date(game.lastPlayed).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="text-blue-400 text-xs">
                  {game.lastPlayed ? getRelativeTime(new Date(game.lastPlayed)) : 'Never'}
                </div>
              </div>
            ))}
          </div>
        </ListCard>
      </div>

      {/* Platform Distribution */}
      <ChartCard title="Platform Distribution">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(platformDistribution).map(([platform, count]) => {
            const percentage = totalGames > 0 ? (count / totalGames) * 100 : 0
            const platformIcons: Record<string, string> = {
              'PC': '🖥️',
              'Steam': '🎮',
              'PlayStation': '🎯',
              'Xbox': '🎪',
              'Nintendo': '🔥',
              'Mobile': '📱'
            }
            
            return (
              <div key={platform} className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="text-2xl mb-2">{platformIcons[platform] || '🎮'}</div>
                <div className="font-medium text-white text-sm">{platform}</div>
                <div className="text-gray-400 text-xs">{count} games</div>
                <div className="text-gaming-primary text-xs font-bold">{percentage.toFixed(1)}%</div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}

// Helper Components
const StatCard: React.FC<{
  title: string
  value: string | number
  icon: string
  color: string
}> = ({ title, value, icon, color }) => (
  <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  </div>
)

const ChartCard: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => (
  <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
    {children}
  </div>
)

const ListCard: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => (
  <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
    {children}
  </div>
)

// Helper function for relative time
const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
}

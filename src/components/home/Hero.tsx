import React from 'react'

interface HeroProps {
  userName: string
  topGenres?: string[]
}

export const Hero: React.FC<HeroProps> = ({ userName, topGenres = [] }) => {
  // Dynamic background based on top genres
  const getBackgroundGradient = () => {
    if (topGenres.includes('RPG')) {
      return 'from-purple-900 via-purple-800 to-indigo-900'
    }
    if (topGenres.includes('Action')) {
      return 'from-red-900 via-orange-800 to-yellow-900'
    }
    if (topGenres.includes('Strategy')) {
      return 'from-blue-900 via-cyan-800 to-teal-900'
    }
    if (topGenres.includes('Simulation')) {
      return 'from-green-900 via-emerald-800 to-cyan-900'
    }
    return 'from-gaming-dark via-gray-900 to-gaming-darker'
  }

  return (
    <div className={`relative h-96 overflow-hidden bg-gradient-to-br ${getBackgroundGradient()}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gaming-accent/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-gaming-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gaming-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in">
            Welcome back, {userName}
          </h1>
          <p className="text-xl text-gray-200 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Ready to dive into your gaming universe?
          </p>
          <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <button className="px-8 py-3 bg-gaming-accent hover:bg-gaming-primary text-white rounded-lg font-semibold transition-all transform hover:scale-105">
              🎮 Continue Playing
            </button>
            <button className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105">
              📚 Browse Library
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'

interface InfoSectionProps {
  releaseDate: string
  developers: string[]
  publishers: string[]
  genres: Array<{ id: string; description: string }>
  platforms: {
    windows: boolean
    mac: boolean
    linux: boolean
  }
  achievements?: {
    total: number
  }
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  releaseDate,
  developers,
  publishers,
  genres,
  platforms,
  achievements
}) => {
  const getPlatformIcon = (platform: string, available: boolean) => {
    if (!available) return null
    
    switch (platform) {
      case 'windows':
        return <span className="text-xl">🪟</span>
      case 'mac':
        return <span className="text-xl">🍎</span>
      case 'linux':
        return <span className="text-xl">🐧</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Release Date */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Release Date</h3>
        <p className="text-gray-300">{releaseDate}</p>
      </div>

      {/* Developer & Publisher */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Developer & Publisher</h3>
        <div className="space-y-1">
          <p className="text-gray-300">
            <span className="text-gray-400">Developer:</span> {developers.join(', ')}
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">Publisher:</span> {publishers.join(', ')}
          </p>
        </div>
      </div>

      {/* Genres */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Genres</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <span
              key={genre.id}
              className="px-3 py-1 bg-gaming-primary/20 border border-gaming-primary/30 rounded-full text-sm text-gaming-primary"
            >
              {genre.description}
            </span>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Available Platforms</h3>
        <div className="flex gap-3">
          {getPlatformIcon('windows', platforms.windows)}
          {getPlatformIcon('mac', platforms.mac)}
          {getPlatformIcon('linux', platforms.linux)}
        </div>
      </div>

      {/* Achievements */}
      {achievements && achievements.total > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Achievements</h3>
          <p className="text-gray-300">
            <span className="text-gaming-accent font-semibold">{achievements.total}</span> achievements
          </p>
        </div>
      )}
    </div>
  )
}

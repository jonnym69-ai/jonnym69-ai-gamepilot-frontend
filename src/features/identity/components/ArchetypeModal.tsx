import React from 'react'

interface ArchetypeModalProps {
  isOpen: boolean
  onClose: () => void
  archetype: {
    id: string
    name: string
    symbol: string
    description: string
    fullDescription: string
    strengths: string[]
    weaknesses: string[]
    moodTendencies: string[]
    recommendedGenres: string[]
    signatureTraits: string[]
    theme: {
      primary: string
      accent: string
      bg: string
    }
  }
}

export const ArchetypeModal: React.FC<ArchetypeModalProps> = ({ isOpen, onClose, archetype }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="glass-morphism rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Section */}
        <div className={`bg-gradient-to-r ${archetype.theme.primary} rounded-2xl p-8 mb-8 text-center`}>
          <div className="text-6xl mb-4">{archetype.symbol}</div>
          <h1 className="text-4xl font-black text-white mb-4">{archetype.name.toUpperCase()}</h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            {archetype.fullDescription}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <div className="glass-morphism rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">💪</span>
              Strengths
            </h3>
            <ul className="space-y-2">
              {archetype.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className={`text-gaming-accent mt-1`}>•</span>
                  <span className="text-gray-300 text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="glass-morphism rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Challenges
            </h3>
            <ul className="space-y-2">
              {archetype.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className={`text-gaming-accent mt-1`}>•</span>
                  <span className="text-gray-300 text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mood Tendencies */}
        <div className="glass-morphism rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">😊</span>
            Mood Tendencies
          </h3>
          <div className="flex flex-wrap gap-3">
            {archetype.moodTendencies.map((mood, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-full ${archetype.theme.bg} ${archetype.theme.accent} border border-white/20`}
              >
                {mood}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Genres */}
        <div className="glass-morphism rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            Perfect Game Genres
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {archetype.recommendedGenres.map((genre, index) => (
              <div
                key={index}
                className={`glass-morphism rounded-lg p-3 text-center hover:bg-white/10 transition-colors cursor-pointer border border-white/10`}
              >
                <div className={`text-gaming-accent font-medium`}>{genre}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Traits */}
        <div className="glass-morphism rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Signature Traits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {archetype.signatureTraits.map((trait, index) => (
              <div
                key={index}
                className={`glass-morphism rounded-lg p-4 ${archetype.theme.bg} border border-white/10`}
              >
                <div className={`text-gaming-accent font-medium mb-2`}>{trait}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

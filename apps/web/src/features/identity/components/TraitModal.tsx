import React from 'react'

interface TraitModalProps {
  isOpen: boolean
  onClose: () => void
  trait: {
    label: string
    value: string
    description: string
    icon: string
    fullDescription: string
    inference: string
    archetypeEffect: string
    suggestedGames: string[]
  }
}

export const TraitModal: React.FC<TraitModalProps> = ({ isOpen, onClose, trait }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="glass-morphism rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{trait.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{trait.label}</h2>
              <p className="text-gaming-accent font-medium">{trait.value}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Full Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">About This Trait</h3>
            <p className="text-gray-300 leading-relaxed">{trait.fullDescription}</p>
          </div>

          {/* How It Was Inferred */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">How We Discovered This</h3>
            <p className="text-gray-300 leading-relaxed">{trait.inference}</p>
          </div>

          {/* Archetype Effect */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Impact on Your Archetype</h3>
            <p className="text-gray-300 leading-relaxed">{trait.archetypeEffect}</p>
          </div>

          {/* Suggested Games */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Perfect Game Types for You</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {trait.suggestedGames.map((game, index) => (
                <div
                  key={index}
                  className="glass-morphism rounded-lg p-3 text-center hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="text-gaming-accent font-medium">{game}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

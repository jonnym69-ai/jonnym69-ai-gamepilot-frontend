import React from 'react'
import type { IdentityCore } from '@shared/persona/identityCore'

interface IdentityCardProps {
  persona: IdentityCore["reflection"]
}

export const IdentityCard: React.FC<IdentityCardProps> = ({ persona }) => {
  return (
    <div className="glass-morphism rounded-xl p-6 border border-white/10 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white text-xl font-bold">🎮</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Your Gaming Identity</h3>
          <p className="text-sm text-gray-400">Persona-powered insights</p>
        </div>
      </div>

      {/* Identity Summary */}
      <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-purple-400 text-sm font-semibold">IDENTITY</span>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
        </div>
        <p className="text-white leading-relaxed">{persona.identitySummary}</p>
      </div>

      {/* Dominant Traits */}
      {persona.dominantTraits.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-blue-400 text-sm font-semibold">TRAITS</span>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {persona.dominantTraits.map((trait, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-300"
              >
                {trait.charAt(0).toUpperCase() + trait.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Mood */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-400 text-sm font-semibold">MOOD</span>
          <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white text-sm">
              {persona.currentMood === 'neutral' ? '😌' : persona.currentMood === 'competitive' ? '🔥' : persona.currentMood === 'creative' ? '🎨' : '🎮'}
            </span>
          </div>
          <span className="text-white capitalize">{persona.currentMood}</span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-400/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-indigo-400 text-sm font-semibold">RECOMMENDATIONS</span>
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
        </div>
        <p className="text-indigo-200 text-sm leading-relaxed">{persona.recommendationContext}</p>
      </div>
    </div>
  )
}

export default IdentityCard

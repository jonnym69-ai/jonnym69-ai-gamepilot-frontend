import React from 'react'
import { usePersonaSnapshot } from '../../../hooks/persona/usePersonaSnapshot'

// Simple Card component to replace UI package dependency
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-morphism rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-colors ${className}`}>
    {children}
  </div>
)

export const PlaystyleCard: React.FC = () => {
  const personaSnapshot = usePersonaSnapshot()

  if (!personaSnapshot) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🎯</div>
          <p>Loading playstyle data...</p>
        </div>
      </Card>
    )
  }

  const getArchetypeDescription = (archetypeId: string) => {
    switch (archetypeId) {
      case 'Achiever': return 'You thrive on completing challenges and earning rewards'
      case 'Explorer': return 'You love discovering new worlds and hidden secrets'
      case 'Socializer': return 'You enjoy playing with others and building communities'
      case 'Competitor': return 'You seek victory and excel in competitive gameplay'
      case 'Strategist': return 'You excel at planning and tactical decision-making'
      case 'Creative': return 'You enjoy building, creating, and expressing yourself'
      case 'Casual': return 'You prefer relaxed, stress-free gaming experiences'
      case 'Specialist': return 'You focus on mastering specific genres or games'
      default: return 'Your unique gaming style'
    }
  }

  const getArchetypeEmoji = (archetypeId: string) => {
    switch (archetypeId) {
      case 'Achiever': return '🏆'
      case 'Explorer': return '🗺️'
      case 'Socializer': return '👥'
      case 'Competitor': return '⚔️'
      case 'Strategist': return '♟️'
      case 'Creative': return '🎨'
      case 'Casual': return '😌'
      case 'Specialist': return '🎯'
      default: return '🎮'
    }
  }

  const getIntensityDescription = (intensity: string) => {
    switch (intensity) {
      case 'Low': return 'Prefers short, casual gaming sessions'
      case 'Medium': return 'Enjoys balanced gaming sessions'
      case 'High': return 'Thrives in intense, extended gameplay'
      default: return 'Moderate gaming approach'
    }
  }

  const getPacingDescription = (pacing: string) => {
    switch (pacing) {
      case 'Burst': return 'Short, intense gaming sessions'
      case 'Flow': return 'Moderate, steady gaming sessions'
      case 'Marathon': return 'Long, extended gaming sessions'
      default: return 'Balanced gaming pace'
    }
  }

  const getSocialStyleDescription = (socialStyle: string) => {
    switch (socialStyle) {
      case 'Solo': return 'Prefers single-player experiences'
      case 'Coop': return 'Enjoys cooperative multiplayer'
      case 'Competitive': return 'Thrives in competitive multiplayer'
      default: return 'Flexible social preferences'
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎯</span>
          <h3 className="text-xl font-bold text-white">Playstyle Archetype</h3>
        </div>

        {/* Main Archetype */}
        <div className="p-4 bg-gradient-to-r from-gaming-primary to-gaming-secondary/20 rounded-lg border border-gaming-primary/30">
          <div className="text-center">
            <div className="text-4xl mb-2">{getArchetypeEmoji(personaSnapshot.traits.archetypeId)}</div>
            <h4 className="text-xl font-bold text-white capitalize mb-2">
              {personaSnapshot.traits.archetypeId}
            </h4>
            <p className="text-sm text-gray-300">
              {getArchetypeDescription(personaSnapshot.traits.archetypeId)}
            </p>
          </div>
        </div>

        {/* Behavioral Dimensions */}
        <div className="space-y-3">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-300">Intensity</span>
              <span className="text-gaming-accent font-semibold">{personaSnapshot.traits.intensity}</span>
            </div>
            <p className="text-xs text-gray-400">{getIntensityDescription(personaSnapshot.traits.intensity)}</p>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-300">Pacing</span>
              <span className="text-gaming-accent font-semibold">{personaSnapshot.traits.pacing}</span>
            </div>
            <p className="text-xs text-gray-400">{getPacingDescription(personaSnapshot.traits.pacing)}</p>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-300">Social Style</span>
              <span className="text-gaming-accent font-semibold">{personaSnapshot.traits.socialStyle}</span>
            </div>
            <p className="text-xs text-gray-400">{getSocialStyleDescription(personaSnapshot.traits.socialStyle)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

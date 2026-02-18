import React from 'react'
import type { PersonaSnapshot } from '../../../../../packages/identity-engine/src/persona'
import { PersonaArchetypeBadge } from './PersonaArchetypeBadge'
import { PersonaMoodPulse } from './PersonaMoodPulse'

interface PersonaSummaryBarProps {
  persona: PersonaSnapshot
  compact?: boolean
  className?: string
}

/**
 * Format trait for display
 */
function formatTrait(trait: string): string {
  return trait.charAt(0).toUpperCase() + trait.slice(1)
}

/**
 * PersonaSummaryBar - Horizontal compact persona summary
 * Ideal for Library and Game Details headers
 */
export const PersonaSummaryBar: React.FC<PersonaSummaryBarProps> = ({
  persona,
  compact = false,
  className = ''
}) => {
  const { traits, mood, narrative } = persona
  
  if (!traits) {
    return (
      <div className={`flex items-center gap-3 text-gray-400 ${className}`}>
        <div className="w-4 h-4 bg-gray-600 rounded-full" />
        <span className="text-sm">Loading persona...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Archetype Badge */}
      <PersonaArchetypeBadge
        archetypeId={traits.archetypeId}
        size={compact ? 'sm' : 'md'}
        showName={!compact}
      />
      
      {/* Mood Pulse */}
      <PersonaMoodPulse
        mood={mood}
        size={compact ? 'sm' : 'md'}
      />
      
      {/* Trait Summary */}
      {!compact && (
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="font-medium">{formatTrait(traits.pacing)}</span>
          <span className="text-gray-500">•</span>
          <span className="font-medium">{formatTrait(traits.riskProfile)}</span>
          <span className="text-gray-500">•</span>
          <span className="font-medium">{formatTrait(traits.socialStyle)}</span>
        </div>
      )}
      
      {/* Compact Mode: Short Summary */}
      {compact && (
        <div className="flex items-center gap-1 text-xs text-gray-300">
          <span>{formatTrait(traits.pacing)}</span>
          <span className="text-gray-500">•</span>
          <span>{formatTrait(traits.riskProfile)}</span>
        </div>
      )}
      
      {/* Tone Indicator */}
      {!compact && narrative && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <span className="text-xs text-gray-400 font-medium">
            {narrative.tone}
          </span>
        </div>
      )}
    </div>
  )
}

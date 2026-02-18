import React from 'react'
import type { PersonaSnapshot } from '../../../../../packages/identity-engine/src/persona'
import { PersonaArchetypeBadge } from './PersonaArchetypeBadge'
import { PersonaMoodPulse } from './PersonaMoodPulse'

interface PersonaIdentityCardProps {
  persona: PersonaSnapshot
  className?: string
}

/**
 * Format trait for display
 */
function formatTrait(trait: string): string {
  return trait.charAt(0).toUpperCase() + trait.slice(1)
}

/**
 * Confidence meter component
 */
function ConfidenceMeter({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100)
  const colorClass = 
    percentage >= 80 ? 'bg-green-500' :
    percentage >= 60 ? 'bg-yellow-500' :
    'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium min-w-[3rem] text-right">
        {percentage}%
      </span>
    </div>
  )
}

/**
 * Trait badge component
 */
function TraitBadge({ trait, value }: { trait: string; value: string }) {
  const traitColors: Record<string, string> = {
    pacing: 'from-blue-500 to-cyan-500',
    riskProfile: 'from-purple-500 to-pink-500',
    socialStyle: 'from-green-500 to-emerald-500',
    intensity: 'from-orange-500 to-red-500'
  }

  const gradient = traitColors[trait] || 'from-gray-500 to-gray-600'

  return (
    <div
      className={`
        px-2 py-1
        bg-gradient-to-r ${gradient}
        text-white text-xs
        rounded-full
        font-medium
        shadow-sm
      `}
    >
      {formatTrait(value)}
    </div>
  )
}

/**
 * PersonaIdentityCard - Full-featured persona display card
 * Cinematic design with archetype badge, traits, mood, narrative, and confidence
 */
export const PersonaIdentityCard: React.FC<PersonaIdentityCardProps> = ({
  persona,
  className = ''
}) => {
  const { traits, mood, narrative, confidence } = persona

  // Skeleton state
  if (!traits || !narrative) {
    return (
      <div className={`
        glass-morphism rounded-xl p-6
        border border-gray-700
        ${className}
      `}>
        <div className="space-y-4">
          {/* Skeleton header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-700 rounded animate-pulse w-32" />
              <div className="h-4 bg-gray-700 rounded animate-pulse w-24" />
            </div>
          </div>
          
          {/* Skeleton content */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-2 bg-gray-700 rounded animate-pulse w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`
      glass-morphism rounded-xl p-6
      border border-gray-700
      shadow-xl
      hover:shadow-2xl
      transition-all duration-300
      ${className}
    `}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        {/* Archetype Badge */}
        <PersonaArchetypeBadge
          archetypeId={traits.archetypeId}
          size="lg"
          showName={true}
        />
        
        {/* Mood Pulse */}
        <div className="flex flex-col items-end gap-2">
          <PersonaMoodPulse mood={mood} size="lg" />
          {narrative && (
            <span className="text-xs text-gray-400 font-medium bg-gray-800 px-2 py-1 rounded-full">
              {narrative.tone}
            </span>
          )}
        </div>
      </div>

      {/* Narrative Summary */}
      <div className="mb-6">
        <p className="text-gray-200 text-sm leading-relaxed italic">
          "{narrative.summary}"
        </p>
      </div>

      {/* Trait Badges */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <TraitBadge trait="pacing" value={traits.pacing} />
          <TraitBadge trait="riskProfile" value={traits.riskProfile} />
          <TraitBadge trait="socialStyle" value={traits.socialStyle} />
          <TraitBadge trait="intensity" value={traits.intensity} />
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Confidence
          </span>
          <span className="text-xs text-gray-500">
            Based on data completeness
          </span>
        </div>
        <ConfidenceMeter confidence={confidence} />
      </div>

      {/* Footer Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Persona Engine v1.0</span>
          <span>Updated in real-time</span>
        </div>
      </div>
    </div>
  )
}

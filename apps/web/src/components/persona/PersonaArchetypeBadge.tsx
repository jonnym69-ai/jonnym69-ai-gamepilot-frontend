import React from 'react'
import type { PersonaArchetypeId } from '../../../../../packages/identity-engine/src/persona'

interface PersonaArchetypeBadgeProps {
  archetypeId: PersonaArchetypeId
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

/**
 * Archetype metadata for styling and display
 */
const ARCHETYPE_METADATA: Record<PersonaArchetypeId, {
  name: string
  icon: string
  gradient: string
  description: string
}> = {
  Achiever: {
    name: 'Achiever',
    icon: '🏆',
    gradient: 'from-yellow-500 to-amber-600',
    description: 'Goal-oriented completionist'
  },
  Explorer: {
    name: 'Explorer',
    icon: '🗺️',
    gradient: 'from-green-500 to-emerald-600',
    description: 'Curious discoverer'
  },
  Socializer: {
    name: 'Socializer',
    icon: '👥',
    gradient: 'from-blue-500 to-cyan-600',
    description: 'Community player'
  },
  Competitor: {
    name: 'Competitor',
    icon: '⚔️',
    gradient: 'from-red-500 to-orange-600',
    description: 'Victory-driven'
  },
  Strategist: {
    name: 'Strategist',
    icon: '♟️',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Tactical thinker'
  },
  Creative: {
    name: 'Creative',
    icon: '🎨',
    gradient: 'from-purple-500 to-pink-600',
    description: 'Imaginative builder'
  },
  Casual: {
    name: 'Casual',
    icon: '😌',
    gradient: 'from-teal-500 to-cyan-600',
    description: 'Relaxed gamer'
  },
  Specialist: {
    name: 'Specialist',
    icon: '🎯',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Focused expert'
  }
}

const SIZE_CLASSES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

const ICON_SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

/**
 * PersonaArchetypeBadge - Reusable archetype badge component
 * Displays archetype icon, name, and gradient styling
 */
export const PersonaArchetypeBadge: React.FC<PersonaArchetypeBadgeProps> = ({
  archetypeId,
  size = 'md',
  showName = true,
  className = ''
}) => {
  const metadata = ARCHETYPE_METADATA[archetypeId]
  
  if (!metadata) {
    return null
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        bg-gradient-to-r ${metadata.gradient}
        text-white font-medium
        rounded-full
        shadow-lg
        transition-all duration-200
        hover:shadow-xl hover:scale-105
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      title={metadata.description}
    >
      <span className={ICON_SIZES[size]}>
        {metadata.icon}
      </span>
      {showName && (
        <span className="font-semibold">
          {metadata.name}
        </span>
      )}
    </div>
  )
}

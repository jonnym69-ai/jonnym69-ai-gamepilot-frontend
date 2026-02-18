import React from 'react'
import { usePersonaSnapshot } from '../../../hooks/persona/usePersonaSnapshot'

interface HybridArchetypeCardProps {
  theme: {
    primary: string
    accent: string
    bg: string
  }
}

export const HybridArchetypeCard: React.FC<HybridArchetypeCardProps> = ({ theme }) => {
  const personaSnapshot = usePersonaSnapshot()

  const inferSecondaryArchetype = (traits: any) => {
    const { intensity, pacing, socialStyle, riskProfile } = traits
    
    // Logic to infer secondary archetype based on trait combinations
    if (socialStyle === 'Coop' && intensity === 'High') return 'Socializer'
    if (riskProfile === 'Experimental' && pacing === 'Flow') return 'Explorer'
    if (intensity === 'High' && pacing === 'Burst') return 'Competitor'
    if (pacing === 'Marathon' && socialStyle === 'Solo') return 'Immersive'
    if (riskProfile === 'Balanced' && intensity === 'Medium') return 'Strategist'
    if (socialStyle === 'Solo' && intensity === 'Low') return 'Casual'
    
    // Default fallback based on dominant trait
    if (intensity === 'High') return 'Achiever'
    if (socialStyle !== 'Solo') return 'Socializer'
    if (riskProfile === 'Experimental') return 'Explorer'
    return 'Strategist'
  }

  const getHybridIdentity = (primary: string, secondary: string) => {
    const hybrids: Record<string, { name: string; symbol: string; description: string }> = {
      'Achiever-Socializer': {
        name: 'The Leader',
        symbol: '👑',
        description: 'You drive others toward success while achieving your own goals. Your competitive spirit inspires teams to victory.'
      },
      'Achiever-Strategist': {
        name: 'The Tactician',
        symbol: '♟️',
        description: 'You combine goal-driven ambition with brilliant planning. Every achievement is a calculated step toward mastery.'
      },
      'Achiever-Explorer': {
        name: 'The Pioneer',
        symbol: '🏔️',
        description: 'You conquer new territories while collecting achievements. Your drive pushes boundaries and discovers new paths.'
      },
      'Explorer-Immersive': {
        name: 'The Wanderer',
        symbol: '🌌',
        description: 'You lose yourself in vast worlds, discovering every secret while becoming one with the adventure.'
      },
      'Explorer-Socializer': {
        name: 'The Guide',
        symbol: '🧭',
        description: 'You lead others through new experiences, sharing discoveries and building communities around exploration.'
      },
      'Socializer-Achiever': {
        name: 'The Champion',
        symbol: '🏆',
        description: 'You rally teams to victory while celebrating every win. Your success is measured by the group\'s achievements.'
      },
      'Strategist-Immersive': {
        name: 'The Architect',
        symbol: '🏛️',
        description: 'You design complex worlds and master their systems. Every detail is part of your grand vision.'
      },
      'Immersive-Explorer': {
        name: 'The Seeker',
        symbol: '🔍',
        description: 'You dive deep into worlds, uncovering their deepest secrets and becoming part of their stories.'
      },
      'Competitor-Strategist': {
        name: 'The Commander',
        symbol: '⚔️',
        description: 'You outthink opponents while dominating the battlefield. Strategy and skill make you unstoppable.'
      },
      'Casual-Explorer': {
        name: 'The Wanderer',
        symbol: '🍃',
        description: 'You explore at your own pace, enjoying the journey without pressure. Every discovery is a pleasant surprise.'
      }
    }

    const key = `${primary}-${secondary}`
    const reverseKey = `${secondary}-${primary}`
    
    return hybrids[key] || hybrids[reverseKey] || hybrids['Achiever-Strategist']
  }

  if (!personaSnapshot) {
    return (
      <div className="glass-morphism rounded-xl p-6 border border-white/10">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🌟</div>
          <p className="text-sm">Loading hybrid identity...</p>
        </div>
      </div>
    )
  }

  const primaryArchetype = personaSnapshot.traits.archetypeId
  const secondaryArchetype = inferSecondaryArchetype(personaSnapshot.traits)
  const hybridIdentity = getHybridIdentity(primaryArchetype, secondaryArchetype)

  return (
    <div className={`glass-morphism rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-all duration-300 cursor-pointer`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="text-5xl mb-2">{hybridIdentity.symbol}</div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{hybridIdentity.name}</h3>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs ${theme.bg} ${theme.accent} border border-white/20`}>
            {primaryArchetype}
          </span>
          <span className="text-gray-400">+</span>
          <span className={`px-2 py-1 rounded-full text-xs ${theme.bg} ${theme.accent} border border-white/20`}>
            {secondaryArchetype}
          </span>
        </div>
        
        <p className="text-sm text-gray-300 leading-relaxed">
          {hybridIdentity.description}
        </p>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-gray-400">
            <span className="block mb-1">Primary: {primaryArchetype}</span>
            <span className="block">Secondary: {secondaryArchetype}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

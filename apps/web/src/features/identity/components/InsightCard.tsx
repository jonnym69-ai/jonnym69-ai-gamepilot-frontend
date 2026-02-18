import React, { useState } from 'react'
import { usePersonaSnapshot } from '../../../hooks/persona/usePersonaSnapshot'

// Simple Card component to replace UI package dependency
const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div className={`glass-morphism rounded-xl p-4 cursor-pointer hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl ${className}`} onClick={onClick}>
    {children}
  </div>
)

interface InsightCardProps {
  insight: {
    title: string
    description: string
    icon: string
    type: 'strength' | 'behaviour' | 'recommendation'
    expanded?: boolean
  }
  isExpanded: boolean
  onToggle: () => void
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, isExpanded, onToggle }) => {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'border-green-500/30 bg-green-500/10'
      case 'behaviour': return 'border-blue-500/30 bg-blue-500/10'
      case 'recommendation': return 'border-purple-500/30 bg-purple-500/10'
      default: return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'strength': return 'text-green-400'
      case 'behaviour': return 'text-blue-400'
      case 'recommendation': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getExpandedContent = () => {
    switch (insight.type) {
      case 'strength':
        return {
          details: 'This strength reflects your natural gaming tendencies and core motivations. It influences how you approach challenges and what brings you the most satisfaction.',
          recommendations: 'Lean into games that highlight this strength for maximum enjoyment and personal growth.',
          genres: insight.title.includes('Discovery') ? ['Open World', 'Adventure', 'Exploration'] :
                   insight.title.includes('Goal') ? ['RPG', 'Action', 'Platformer'] :
                   insight.title.includes('Social') ? ['MMO', 'Co-op', 'Party Games'] :
                   ['Strategy', 'Puzzle', 'Simulation']
        }
      case 'behaviour':
        return {
          details: 'This behavioral pattern shows how you typically engage with games over time. Understanding these patterns helps optimize your gaming experience.',
          recommendations: 'Schedule gaming sessions when this behavior is most beneficial for your mood and energy levels.',
          triggers: insight.title.includes('Evening') ? 'Lower stress, more focused mindset' :
                   insight.title.includes('Weekend') ? 'More free time, relaxed pace' :
                   'Consistent routine and habits'
        }
      case 'recommendation':
        return {
          details: 'This recommendation is based on your persona analysis and gaming history. It\'s designed to enhance your gaming experience.',
          reasoning: 'Your persona traits and mood patterns suggest this type of game would be particularly enjoyable for you.',
          expectedOutcome: 'Increased satisfaction, better mood alignment, and more engaging gameplay sessions'
        }
      default:
        return {
          details: 'This insight provides valuable information about your gaming preferences and patterns.',
          recommendations: 'Use this information to make more informed decisions about your gaming choices.',
          benefits: 'Better game selection, improved enjoyment, and more satisfying gaming experiences'
        }
    }
  }

  const expandedContent = getExpandedContent()

  return (
    <Card 
      className={`${getInsightColor(insight.type)} border ${isExpanded ? 'ring-2 ring-white/20' : ''}`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${getInsightIconColor(insight.type)}`}>
          {insight.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
          <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
          
          {isExpanded && expandedContent && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="text-gray-200">
                <span className="font-medium text-white">Details:</span> {expandedContent.details}
              </div>
              
              {expandedContent.recommendations && (
                <div className="text-gray-200">
                  <span className="font-medium text-white">Recommendations:</span> {expandedContent.recommendations}
                </div>
              )}
              
              {expandedContent.genres && (
                <div className="text-gray-200">
                  <span className="font-medium text-white">Suggested Genres:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {expandedContent.genres.map((genre: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-white/10 rounded text-xs">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button 
            className="text-xs text-gray-400 hover:text-white transition-colors mt-2"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      </div>
    </Card>
  )
}

// Generate insights based on persona data
export const InsightCards: React.FC = () => {
  const personaSnapshot = usePersonaSnapshot()

  if (!personaSnapshot) {
    return (
      <div className="glass-morphism rounded-xl p-6 text-center text-gray-400">
        <div className="text-4xl mb-2">💡</div>
        <p>Loading insights...</p>
      </div>
    )
  }

  // Generate insights based on persona data
  const generateInsights = () => {
    const insights = []
    
    // Strength insight based on archetype
    const archetypeStrengths: Record<string, { title: string; description: string; icon: string }> = {
      'Achiever': {
        title: 'Goal-Oriented Excellence',
        description: 'Your drive for achievement pushes you to complete challenges and master new skills.',
        icon: '🏆'
      },
      'Explorer': {
        title: 'Natural Curiosity',
        description: 'Your love for discovery leads you to explore new worlds and uncover hidden secrets.',
        icon: '🗺️'
      },
      'Socializer': {
        title: 'Community Builder',
        description: 'Your social nature helps you build connections and create lasting friendships.',
        icon: '👥'
      },
      'Competitor': {
        title: 'Victory Drive',
        description: 'Your competitive spirit drives you to excel and overcome challenges.',
        icon: '⚔️'
      },
      'Strategist': {
        title: 'Tactical Mind',
        description: 'Your strategic thinking helps you plan ahead and make optimal decisions.',
        icon: '♟️'
      },
      'Creative': {
        title: 'Artistic Expression',
        description: 'Your creativity allows you to express yourself through unique gameplay experiences.',
        icon: '🎨'
      },
      'Casual': {
        title: 'Balanced Approach',
        description: 'Your relaxed attitude helps you enjoy gaming without stress or pressure.',
        icon: '😌'
      },
      'Specialist': {
        title: 'Deep Expertise',
        description: 'Your dedication to mastery makes you an expert in your chosen domains.',
        icon: '🎯'
      }
    }

    const strength = archetypeStrengths[personaSnapshot.traits.archetypeId] || archetypeStrengths.Explorer
    insights.push({ ...strength, type: 'strength' as const })

    // Behaviour insight based on pacing
    const pacingBehaviours: Record<string, { title: string; description: string; icon: string }> = {
      'Burst': {
        title: 'High-Energy Sessions',
        description: 'You prefer short, intense gaming sessions that maximize engagement.',
        icon: '⚡'
      },
      'Flow': {
        title: 'Steady Engagement',
        description: 'You maintain consistent focus and enjoy extended gaming sessions.',
        icon: '🌊'
      },
      'Marathon': {
        title: 'Endurance Gaming',
        description: 'You excel at long gaming sessions and can maintain focus for hours.',
        icon: '⏱️'
      }
    }

    const behaviour = pacingBehaviours[personaSnapshot.traits.pacing] || pacingBehaviours.Flow
    insights.push({ ...behaviour, type: 'behaviour' as const })

    // Recommendation based on mood and traits
    const recommendation = {
      title: 'Optimal Gaming Time',
      description: `Your ${personaSnapshot.traits.archetypeId.toLowerCase()} nature suggests gaming during ${personaSnapshot.traits.intensity === 'High' ? 'peak energy hours' : 'relaxed evening times'} for best results.`,
      icon: '🎯',
      type: 'recommendation' as const
    }
    insights.push(recommendation)

    return insights
  }

  const insights = generateInsights()
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Personal Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            insight={insight}
            isExpanded={expandedCard === `${index}`}
            onToggle={() => setExpandedCard(expandedCard === `${index}` ? null : `${index}`)}
          />
        ))}
      </div>
    </div>
  )
}

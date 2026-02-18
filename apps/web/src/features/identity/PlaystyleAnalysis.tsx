import React, { useState, useMemo } from 'react'
import type { Game } from '@gamepilot/types'

interface PlaystyleAnalysisProps {
  games: Game[]
  userMoodProfile: any
}

export const PlaystyleAnalysis: React.FC<PlaystyleAnalysisProps> = ({ games }) => {
  const [isLoading] = useState(false)

  // Mock playstyle scores
  const playstyleScores = useMemo(() => ({
    explorer: Math.floor(Math.random() * 100),
    achiever: Math.floor(Math.random() * 100),
    social: Math.floor(Math.random() * 100),
    strategist: Math.floor(Math.random() * 100),
    casual: Math.floor(Math.random() * 100),
    competitive: Math.floor(Math.random() * 100)
  }), [games])

  // Get dominant playstyle
  const dominantPlaystyle = useMemo(() => {
    const entries = Object.entries(playstyleScores) as [string, number][]
    const maxEntry = entries.reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: '', value: 0 })
    return maxEntry.key
  }, [playstyleScores])

  // Mock insights
  const insights = [
    'You prefer exploration and discovery',
    'Achievement hunting motivates your gameplay',
    'Social gaming enhances your experience',
    'Strategic thinking is your strength'
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Playstyle Analysis</h2>
        
        {/* Dominant Playstyle */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Your Playstyle</h3>
          <div className="flex items-center space-x-4">
            <div className="text-4xl">
              {dominantPlaystyle === 'explorer' && '🗺️'}
              {dominantPlaystyle === 'achiever' && '🏆'}
              {dominantPlaystyle === 'social' && '👥'}
              {dominantPlaystyle === 'strategist' && '🧠'}
              {dominantPlaystyle === 'casual' && '🌟'}
              {dominantPlaystyle === 'competitive' && '⚔️'}
            </div>
            <div>
              <div className="text-xl font-bold text-white capitalize">
                {dominantPlaystyle}
              </div>
              <div className="text-sm text-gray-400">
                {playstyleScores[dominantPlaystyle as keyof typeof playstyleScores]}% match
              </div>
            </div>
          </div>
        </div>

        {/* All Playstyle Scores */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">All Playstyles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(playstyleScores).map(([playstyle, score]) => (
              <div key={playstyle} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">
                      {playstyle === 'explorer' && '🗺️'}
                      {playstyle === 'achiever' && '🏆'}
                      {playstyle === 'social' && '👥'}
                      {playstyle === 'strategist' && '🧠'}
                      {playstyle === 'casual' && '🌟'}
                      {playstyle === 'competitive' && '⚔️'}
                    </div>
                    <div className="text-sm text-gray-400 min-w-[80px] capitalize">
                      {playstyle}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    {typeof score === 'number' ? `${score}%` : score}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${typeof score === 'number' ? score : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-blue-400 mt-1">💡</div>
                <div className="text-gray-300">{insight}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaystyleAnalysis

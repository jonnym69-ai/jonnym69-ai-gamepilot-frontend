import React from 'react'
import { Achievement } from '../hooks/useAchievements'

interface AchievementSystemProps {
  achievements: Achievement[]
  unlockedAchievements: Achievement[]
  isOpen: boolean
  onClose: () => void
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  achievements,
  unlockedAchievements,
  isOpen,
  onClose
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-600 to-gray-700'
      case 'rare': return 'from-blue-600 to-purple-600'
      case 'epic': return 'from-purple-600 to-pink-600'
      case 'legendary': return 'from-yellow-600 to-orange-600'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500'
      case 'rare': return 'border-blue-500'
      case 'epic': return 'border-purple-500'
      case 'legendary': return 'border-yellow-500'
      default: return 'border-gray-500'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Achievements</h2>
              <p className="text-gray-400">
                {unlockedAchievements.length} of {achievements.length} unlocked
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close achievements"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(achievement => {
              const isUnlocked = achievement.unlockedAt
              const progress = (achievement.progress / achievement.maxProgress) * 100

              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    isUnlocked
                      ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} ${getRarityBorder(achievement.rarity)}`
                      : 'bg-gray-800/50 border-gray-600 opacity-60'
                  }`}
                >
                  {/* Achievement Icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`text-3xl ${!isUnlocked && 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{achievement.title}</h3>
                      <p className="text-xs text-gray-300 capitalize">{achievement.rarity}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-3">{achievement.description}</p>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isUnlocked
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Unlocked Date */}
                  {isUnlocked && achievement.unlockedAt && (
                    <div className="mt-2 text-xs text-green-400">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

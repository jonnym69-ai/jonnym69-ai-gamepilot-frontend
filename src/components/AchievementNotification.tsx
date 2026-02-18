import React from 'react'
import { Achievement } from '../hooks/useAchievements'

interface AchievementNotificationProps {
  achievements: Achievement[]
  isOpen: boolean
  onClose: () => void
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievements,
  isOpen,
  onClose
}) => {
  if (!isOpen || achievements.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg shadow-2xl p-4 min-w-[300px] border border-yellow-400/30">
        <div className="flex items-start gap-3">
          <div className="text-3xl animate-bounce">
            🏆
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Achievement Unlocked!</h3>
            {achievements.map(achievement => (
              <div key={achievement.id} className="text-yellow-100 text-sm">
                {achievement.icon} {achievement.title}
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-yellow-200 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

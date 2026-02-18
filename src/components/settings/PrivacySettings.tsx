import React, { useState } from 'react'
import { useLibraryPersona } from '../../hooks/persona'
import { useLibraryStore } from '../../stores/useLibraryStore'

export const PrivacySettings: React.FC = () => {
  const personaSnapshot = useLibraryPersona()
  const { games } = useLibraryStore()
  
  const [privacy, setPrivacy] = useState({
    sharePlaytime: true,
    shareAchievements: false,
    shareGameLibrary: false,
    sharePersona: false,
    analyticsEnabled: true,
    crashReporting: true
  })

  const updatePrivacy = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gaming-text">Privacy</h3>
      
      <div className="space-y-3">
        {[
          { key: 'sharePlaytime', label: 'Share Playtime Data', description: 'Help improve recommendations by sharing your playtime' },
          { key: 'shareAchievements', label: 'Share Achievements', description: 'Show off your gaming achievements' },
          { key: 'shareGameLibrary', label: 'Share Game Library', description: 'Let friends see your game collection' },
          { key: 'sharePersona', label: 'Share Gaming Persona', description: 'Share your gaming personality profile' },
          { key: 'analyticsEnabled', label: 'Analytics', description: 'Help us improve GamePilot with usage data' },
          { key: 'crashReporting', label: 'Crash Reporting', description: 'Automatically report crashes to help us fix bugs' }
        ].map(({ key, label, description }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gaming-text">{label}</span>
              <input
                type="checkbox"
                checked={privacy[key as keyof typeof privacy]}
                onChange={(e) => updatePrivacy(key, e.target.checked)}
                className="w-4 h-4 text-gaming-primary bg-gaming-surface border-gaming-border rounded"
                title={`Toggle ${label}`}
                aria-label={`Toggle ${label}`}
              />
            </div>
            <p className="text-xs text-gaming-text-muted">{description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

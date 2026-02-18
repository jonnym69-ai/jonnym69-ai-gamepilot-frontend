import React, { useState } from 'react'
import { useCustomisation, useCustomisationActions } from '../../features/customisation/customisationStore'

export const NotificationSettings: React.FC = () => {
  const customisation = useCustomisation()
  const { updateCustomisation } = useCustomisationActions()
  
  const [notifications, setNotifications] = useState({
    desktop: customisation.notifications?.desktop ?? true,
    email: customisation.notifications?.email ?? false,
    discord: customisation.notifications?.discord ?? true,
    achievements: customisation.notifications?.achievements ?? true,
    friendRequests: customisation.notifications?.friendRequests ?? true
  })

  const updateNotification = (type: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [type]: value }))
    updateCustomisation('notifications', { ...notifications, [type]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gaming-text">Notifications</h3>
      
      <div className="space-y-3">
        {[
          { key: 'desktop', label: 'Desktop Notifications' },
          { key: 'email', label: 'Email Notifications' },
          { key: 'discord', label: 'Discord Notifications' },
          { key: 'achievements', label: 'Achievement Notifications' },
          { key: 'friendRequests', label: 'Friend Request Notifications' }
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gaming-text">{label}</span>
            <input
              type="checkbox"
              checked={notifications[key as keyof typeof notifications]}
              onChange={(e) => updateNotification(key, e.target.checked)}
              className="w-4 h-4 text-gaming-primary bg-gaming-surface border-gaming-border rounded"
              title={`Toggle ${label}`}
              aria-label={`Toggle ${label}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

import React from 'react'
import { SteamApiKeySettings } from '../components/settings/SteamApiKeySettings'
import { DiscordSettings } from '../components/settings/DiscordSettings'
import { AppearanceSettings } from '../components/settings/AppearanceSettings'
import { NotificationSettings } from '../components/settings/NotificationSettings'
import { PrivacySettings } from '../components/settings/PrivacySettings'

interface SettingsLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, title, description }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gaming-text mb-2">{title}</h1>
        {description && (
          <p className="text-gaming-text-muted">{description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  )
}

export const SettingsPage: React.FC = () => {
  return (
    <SettingsLayout 
      title="Settings" 
      description="Manage your GamePilot preferences and integrations"
    >
      <SteamApiKeySettings />
      <DiscordSettings />
      <AppearanceSettings />
      <NotificationSettings />
      <PrivacySettings />
    </SettingsLayout>
  )
}

export default SettingsPage

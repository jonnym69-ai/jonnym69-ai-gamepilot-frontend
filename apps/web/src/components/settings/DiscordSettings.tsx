import React, { useState } from 'react'
import { useIntegrationsStore } from '../../features/integrations/integrationsStore'

export const DiscordSettings: React.FC = () => {
  const integrations = useIntegrationsStore()
  const [apiKeys, setApiKeys] = useState({
    discordBotToken: ''
  })

  const updateApiKey = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }))
    // TODO: Implement Discord bot token storage
    console.log('Discord bot token updated:', value)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gaming-text">Discord Integration</h3>
      
      <div className="space-y-2">
        <input
          id="discord-bot-token"
          type="password"
          value={apiKeys.discordBotToken}
          onChange={(e) => updateApiKey('discordBotToken', e.target.value)}
          placeholder="Enter Discord Bot Token"
          className="w-full p-2 bg-gaming-surface border border-gaming-border rounded-lg text-gaming-text"
        />

        <p className="text-sm text-gaming-text-muted">
          Connect your Discord bot to enable rich presence and notifications
        </p>
      </div>
    </div>
  )
}

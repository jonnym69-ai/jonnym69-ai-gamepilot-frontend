import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'

interface SteamApiKeyState {
  hasApiKey: boolean
  maskedKey: string | null
  isLoading: boolean
  error: string | null
}

export const SteamApiKeySettings: React.FC = () => {
  const { user } = useAuthStore()
  const [steamApiKeyState, setSteamApiKeyState] = useState<SteamApiKeyState>({
    hasApiKey: false,
    maskedKey: null,
    isLoading: false,
    error: null
  })

  const loadSteamApiKey = async () => {
    try {
      setSteamApiKeyState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/auth/steam-api-key', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSteamApiKeyState({
          hasApiKey: data.hasApiKey,
          maskedKey: data.maskedKey,
          isLoading: false,
          error: null
        })
      } else {
        throw new Error('Failed to load Steam API key')
      }
    } catch (error) {
      setSteamApiKeyState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  const updateSteamApiKey = async (apiKey: string) => {
    try {
      setSteamApiKeyState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/auth/steam-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ apiKey })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSteamApiKeyState({
          hasApiKey: true,
          maskedKey: data.maskedKey,
          isLoading: false,
          error: null
        })
      } else {
        throw new Error('Failed to update Steam API key')
      }
    } catch (error) {
      setSteamApiKeyState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  const deleteSteamApiKey = async () => {
    try {
      setSteamApiKeyState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/auth/steam-api-key', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        setSteamApiKeyState({
          hasApiKey: false,
          maskedKey: null,
          isLoading: false,
          error: null
        })
      } else {
        throw new Error('Failed to delete Steam API key')
      }
    } catch (error) {
      setSteamApiKeyState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  useEffect(() => {
    if (user) {
      loadSteamApiKey()
    }
  }, [user])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gaming-text">Steam API</h3>
      
      <div className="space-y-2">
        <input
          type="password"
          placeholder="Enter Steam API Key"
          className="w-full p-2 bg-gaming-surface border border-gaming-border rounded-lg text-gaming-text"
          onChange={(e) => updateSteamApiKey(e.target.value)}
        />

        {steamApiKeyState.error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">❌ {steamApiKeyState.error}</p>
          </div>
        )}

        {steamApiKeyState.hasApiKey ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gaming-text">
                API Key: {steamApiKeyState.maskedKey}
              </span>
              <button
                onClick={deleteSteamApiKey}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                disabled={steamApiKeyState.isLoading}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gaming-text-muted">
            Add your Steam API key to sync your game library
          </p>
        )}
      </div>
    </div>
  )
}

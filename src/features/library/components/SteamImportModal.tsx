import React, { useState, useEffect } from 'react'
import type { Game } from '@gamepilot/types'
import { useLibraryStore } from '../../../stores/useLibraryStore'
import { useAuth } from '../../../store/authStore'
import { Loading } from '../../../components/Loading'

interface SteamImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportGames: (games: Game[]) => void
  onImportComplete?: (importedGames: Game[]) => void
}

export const SteamImportModal: React.FC<SteamImportModalProps> = ({ isOpen, onClose, onImportGames }) => {
  const [steamId, setSteamId] = useState('')
  const [importStatus, setImportStatus] = useState('')
  const [errorDetails, setErrorDetails] = useState('')
  const [forceReimport, setForceReimport] = useState(false)
  const { actions, isLoading, games } = useLibraryStore()
  const { user } = useAuth()

  // Auto-fill Steam ID when user is logged in
  useEffect(() => {
    if (user?.steamId || (user as any)?.steamProfile) {
      const steamIdValue = user?.steamId || ((user as any)?.steamProfile || '').split('/').pop()
      if (steamIdValue) {
        setSteamId(steamIdValue)
        console.log('🎯 Auto-filled Steam ID from logged-in user:', steamIdValue)
      }
    }
  }, [user])

  const handleImport = async () => {
    console.log('🎮 SteamImportModal: handleImport called!')
    console.log('🎮 SteamImportModal: Steam ID:', steamId)
    console.log('🎮 SteamImportModal: Force re-import:', forceReimport)
    
    if (!steamId) {
      console.log('🎮 SteamImportModal: No Steam ID provided')
      setImportStatus('Steam ID is required')
      setErrorDetails('Please try logging in with Steam again')
      return
    }

    console.log('🎮 SteamImportModal: Starting import process...')
    setImportStatus('Fetching your Steam library...')
    setErrorDetails('')

    try {
      const apiKey = import.meta.env.VITE_STEAM_API_KEY || '52A301EC230E81BA57BA5155BEB2F6E8'
      console.log('🎮 SteamImportModal: Calling importSteamLibrary with Steam ID:', steamId)
      
      const result = await actions.importSteamLibrary(steamId, apiKey, forceReimport)
      console.log('🎮 SteamImportModal: Import result:', result)
      
      if (result.success && result.gameCount > 0) {
        console.log('🎮 SteamImportModal: Import successful! Games:', result.gameCount)
        setImportStatus(`Successfully imported ${result.gameCount} games!`)
        
        // Keep existing callback for compatibility
        console.log('🎮 SteamImportModal: Calling onImportGames callback with', result.games.length, 'games')
        onImportGames(result.games.map((g: Game) => ({ ...g, id: g.id })))
        
        setTimeout(() => {
          console.log('🎮 SteamImportModal: Closing modal...')
          onClose()
          setImportStatus('')
          setErrorDetails('')
          setSteamId('')
        }, 2000)
      } else {
        console.log('🎮 SteamImportModal: No games found')
        setImportStatus('No games found in your Steam library')
        setErrorDetails('Make sure your Steam profile is public and you own games')
      }
    } catch (error) {
      console.error('🎮 SteamImportModal: Import error:', error)
      
      // Enhanced error handling with detailed logging
      let errorMessage = 'Unknown error occurred'
      let errorDetails = 'Please try again later'
      
      if (error instanceof Error) {
        errorMessage = error.message
        console.log('🎮 SteamImportModal: Error message:', errorMessage)
        console.log('🎮 SteamImportModal: Error stack:', error.stack)
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        errorMessage = 'Steam API request failed'
        errorDetails = JSON.stringify(error, null, 2)
        console.log('🎮 SteamImportModal: Error object:', error)
      }
      
      // Handle different error types
      if (errorMessage.includes('Invalid Steam Web API key')) {
        setImportStatus('Invalid API Key')
        setErrorDetails('Please check your Steam Web API key and try again')
      } else if (errorMessage.includes('Steam profile is private')) {
        setImportStatus('Private Profile')
        setErrorDetails('Please make your Steam profile public and set your game details to public')
      } else if (errorMessage.includes('Invalid Steam ID')) {
        setImportStatus('Invalid Steam ID')
        setErrorDetails('Please check your Steam ID and ensure your profile is public')
      } else if (errorMessage.includes('Failed to connect') || errorMessage.includes('Failed to fetch')) {
        setImportStatus('Connection Error')
        setErrorDetails('Unable to connect to Steam API. Please check your internet connection and try again.')
      } else if (errorMessage.includes('Steam API request failed')) {
        setImportStatus('API Error')
        setErrorDetails('Steam API is temporarily unavailable. Please try again in a few minutes.')
      } else {
        setImportStatus('Import Failed')
        setErrorDetails(`${errorMessage}. ${errorDetails}`)
      }
    } finally {
      // Loading state is handled globally by the store
      console.log('🎮 SteamImportModal: Import process completed')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-morphism rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto cinematic-shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Import Steam Library</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Steam ID</label>
              <input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
                placeholder="Your Steam ID (auto-filled from login)"
                disabled={isLoading || !!user?.steamId || !!(user as any)?.steamProfile}
              />
              <p className="text-xs text-gray-400 mt-1">
                {user?.steamId || (user as any)?.steamProfile ? 'Steam ID auto-filled from your login' : 'Find your Steam ID in your profile URL'}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Import Your Steam Library</h3>
              <p className="text-xs text-gray-400 mb-3">
                Click "Import Library" to fetch all games from your Steam account. This will import game titles, playtime, achievements, and cover images.
              </p>
              {games.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="forceReimport"
                    checked={forceReimport}
                    onChange={(e) => setForceReimport(e.target.checked)}
                    className="w-4 h-4 text-gaming-accent bg-gray-700 border-gray-600 rounded focus:ring-gaming-accent focus:ring-2"
                  />
                  <label htmlFor="forceReimport" className="text-xs text-gray-300">
                    Force re-import (update existing games)
                  </label>
                </div>
              )}
            </div>

            {(importStatus || errorDetails) && (
              <div className={`p-3 rounded-lg text-sm ${
                importStatus.includes('Successfully') 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                  : 'bg-red-600/20 text-red-400 border border-red-600/50'
              }`}>
                <div className="font-medium flex items-center gap-2">
                  {isLoading && <Loading />}
                  {importStatus}
                </div>
                {errorDetails && <div className="text-xs mt-1 opacity-75">{errorDetails}</div>}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading || !steamId}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Importing...' : 'Import Library'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

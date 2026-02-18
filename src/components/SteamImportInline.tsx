import React from 'react'
import { useLibraryStore } from '../stores/useLibraryStore'
import { Button } from './ui/Button'
import { Loading } from './Loading'
import type { Game } from '../types'

interface SteamImportInlineProps {
  className?: string
}

export function SteamImportInline({ className = '' }: SteamImportInlineProps) {
  const { actions } = useLibraryStore()
  const [isImporting, setIsImporting] = React.useState(false)
  const [importStatus, setImportStatus] = React.useState('')

  const handleImport = () => {
    setIsImporting(true)
    setImportStatus('Redirecting to Steam...')

    // Real Steam authentication flow
    // Redirect user to backend's Steam auth endpoint
    const apiBaseUrl = 'http://localhost:3001'
    window.location.href = `${apiBaseUrl}/api/auth/steam`
  }

  return (
    <div className={`glass-morphism rounded-xl p-6 ${className}`}>
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎮</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Import from Steam</h3>
          <p className="text-gray-400 text-sm mb-4">
            Connect your Steam account to automatically import your game library
          </p>
        </div>

        {isImporting ? (
          <div className="space-y-3">
            <Loading size="sm" />
            <p className="text-blue-400 text-sm">{importStatus}</p>
          </div>
        ) : (
          <Button
            onClick={handleImport}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            disabled={isImporting}
          >
            Import Steam Library
          </Button>
        )}

        {importStatus && !isImporting && (
          <p className={`text-sm mt-2 ${
            importStatus.includes('Successfully') 
              ? 'text-green-400' 
              : importStatus.includes('failed') || importStatus.includes('Failed')
              ? 'text-red-400'
              : 'text-blue-400'
          }`}>
            {importStatus}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            This is a demo import that adds sample games to your library
          </p>
        </div>
      </div>
    </div>
  )
}

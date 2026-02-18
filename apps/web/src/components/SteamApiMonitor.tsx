import React, { useState, useEffect } from 'react'
import { toast } from './Toast'
import { SteamService } from '../services/api'

interface SteamApiStatus {
  isOnline: boolean
  lastCheck: Date
  responseTime: number
  errorCount: number
  lastError?: string
  rateLimitReset?: Date
  cacheInfo: {
    size: number
    keys: string[]
    oldestEntry?: string
    newestEntry?: string
  }
}

export const SteamApiMonitor: React.FC = () => {
  const [status, setStatus] = useState<SteamApiStatus>({
    isOnline: true,
    lastCheck: new Date(),
    responseTime: 0,
    errorCount: 0,
    cacheInfo: { size: 0, keys: [] }
  })
  const [isVisible, setIsVisible] = useState(false)

  // Monitor Steam API health
  useEffect(() => {
    const checkSteamApiHealth = async () => {
      const startTime = Date.now()
      
      try {
        // Try a lightweight API call to check health
        const token = localStorage.getItem('auth_token')
        if (!token) return

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/steam/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        const responseTime = Date.now() - startTime
        const cacheInfo = SteamService.getCacheInfo()

        if (response.ok) {
          setStatus(prev => ({
            ...prev,
            isOnline: true,
            lastCheck: new Date(),
            responseTime,
            errorCount: 0,
            lastError: undefined,
            cacheInfo
          }))
        } else {
          const errorCount = status.errorCount + 1
          setStatus(prev => ({
            ...prev,
            isOnline: false,
            lastCheck: new Date(),
            responseTime,
            errorCount,
            lastError: `HTTP ${response.status}: ${response.statusText}`,
            cacheInfo
          }))

          // Log error for monitoring
          console.error('Steam API health check failed:', {
            status: response.status,
            statusText: response.statusText,
            responseTime,
            errorCount,
            timestamp: new Date().toISOString()
          })

          // Show warning if multiple consecutive failures
          if (errorCount >= 3) {
            toast.warning('Steam API issues detected', 'Steam integration may be temporarily unavailable')
          }
        }
      } catch (error) {
        const responseTime = Date.now() - startTime
        const errorCount = status.errorCount + 1
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        setStatus(prev => ({
          ...prev,
          isOnline: false,
          lastCheck: new Date(),
          responseTime,
          errorCount,
          lastError: errorMessage,
          cacheInfo: SteamService.getCacheInfo()
        }))

        // Log error for monitoring
        console.error('Steam API health check error:', {
          error: errorMessage,
          responseTime,
          errorCount,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Check health every 30 seconds
    const interval = setInterval(checkSteamApiHealth, 30000)
    
    // Initial check
    checkSteamApiHealth()

    return () => clearInterval(interval)
  }, [status.errorCount])

  // Log comprehensive error data
  const logErrorData = () => {
    const errorData = {
      steamApiStatus: status,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      cacheInfo: SteamService.getCacheInfo(),
      localStorage: {
        auth_token: localStorage.getItem('auth_token') ? 'present' : 'missing',
        user: localStorage.getItem('user') ? 'present' : 'missing'
      }
    }

    console.group('🔍 Steam API Debug Information')
    console.log('Status:', status)
    console.log('Cache Info:', SteamService.getCacheInfo())
    console.log('Full Debug Data:', errorData)
    console.groupEnd()

    // Copy to clipboard for easy sharing
    navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
    toast.info('Debug info copied', 'Steam API debug information copied to clipboard')
  }

  const clearCache = () => {
    SteamService.clearSteamCache()
    setStatus(prev => ({
      ...prev,
      cacheInfo: { size: 0, keys: [] }
    }))
  }

  const getStatusColor = () => {
    if (!status.isOnline) return 'text-red-400'
    if (status.responseTime > 2000) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline'
    if (status.responseTime > 2000) return 'Slow'
    return 'Online'
  }

  // Only show in development or when manually toggled
  if (process.env.NODE_ENV !== 'development' && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-lg opacity-50 hover:opacity-100 transition-opacity z-40"
        title="Show Steam API Status"
      >
        🎮
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold">Steam API Status</h3>
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-400 hover:text-white"
          >
            {isVisible ? '−' : '+'}
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className={getStatusColor()}>{getStatusText()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Response Time:</span>
          <span className="text-white">{status.responseTime}ms</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Errors:</span>
          <span className={status.errorCount > 0 ? 'text-red-400' : 'text-green-400'}>
            {status.errorCount}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Cache Size:</span>
          <span className="text-white">{status.cacheInfo.size} items</span>
        </div>

        {status.lastError && (
          <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
            <span className="text-red-400 text-xs">{status.lastError}</span>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={logErrorData}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            📋 Log Data
          </button>
          <button
            onClick={clearCache}
            className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
          >
            🗑️ Clear Cache
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for components to check Steam API status
export const useSteamApiStatus = () => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const checkStatus = () => {
      // Simple check - in production this would be more sophisticated
      const lastError = localStorage.getItem('steam_api_last_error')
      const errorTime = localStorage.getItem('steam_api_error_time')
      
      if (lastError && errorTime) {
        const errorAge = Date.now() - parseInt(errorTime)
        if (errorAge < 60000) { // Less than 1 minute ago
          setIsOnline(false)
        } else {
          setIsOnline(true)
          localStorage.removeItem('steam_api_last_error')
          localStorage.removeItem('steam_api_error_time')
        }
      }
    }

    const interval = setInterval(checkStatus, 10000)
    checkStatus()

    return () => clearInterval(interval)
  }, [])

  return { isOnline }
}

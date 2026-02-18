import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LoadingState {
  [key: string]: {
    isLoading: boolean
    message?: string
    progress?: number
    error?: string
  }
}

interface LoadingContextType {
  loadingStates: LoadingState
  setLoading: (key: string, isLoading: boolean, message?: string, progress?: number) => void
  setError: (key: string, error: string) => void
  clearLoading: (key: string) => void
  clearAllLoading: () => void
  isLoading: (key?: string) => boolean
  getLoadingMessage: (key: string) => string | undefined
  getLoadingProgress: (key: string) => number | undefined
  getLoadingError: (key: string) => string | undefined
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})

  const setLoading = useCallback((
    key: string, 
    isLoading: boolean, 
    message?: string, 
    progress?: number
  ) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading,
        message,
        progress,
        error: isLoading ? undefined : prev[key]?.error
      }
    }))
  }, [])

  const setError = useCallback((key: string, error: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        error
      }
    }))
  }, [])

  const clearLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }, [])

  const clearAllLoading = useCallback(() => {
    setLoadingStates({})
  }, [])

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key]?.isLoading || false
    }
    return Object.values(loadingStates).some(state => state.isLoading)
  }, [loadingStates])

  const getLoadingMessage = useCallback((key: string) => {
    return loadingStates[key]?.message
  }, [loadingStates])

  const getLoadingProgress = useCallback((key: string) => {
    return loadingStates[key]?.progress
  }, [loadingStates])

  const getLoadingError = useCallback((key: string) => {
    return loadingStates[key]?.error
  }, [loadingStates])

  return (
    <LoadingContext.Provider value={{
      loadingStates,
      setLoading,
      setError,
      clearLoading,
      clearAllLoading,
      isLoading,
      getLoadingMessage,
      getLoadingProgress,
      getLoadingError
    }}>
      {children}
    </LoadingContext.Provider>
  )
}

// Component for displaying loading states
export const LoadingIndicator: React.FC<{
  key: string
  className?: string
}> = ({ key, className = '' }) => {
  const { isLoading, getLoadingMessage, getLoadingProgress, getLoadingError } = useLoading()

  if (!isLoading(key)) return null

  const message = getLoadingMessage(key)
  const progress = getLoadingProgress(key)
  const error = getLoadingError(key)

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gaming-primary"></div>
      {message && <span className="text-sm text-gray-300">{message}</span>}
      {progress !== undefined && (
        <div className="flex-1 bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gaming-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  )
}

// Global loading overlay
export const GlobalLoadingOverlay: React.FC = () => {
  const { isLoading } = useLoading()

  if (!isLoading()) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-morphism rounded-lg p-6 border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gaming-primary"></div>
          <span className="text-white">Loading...</span>
        </div>
      </div>
    </div>
  )
}
import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <div className={`inline-block animate-spin ${sizeClasses[size]} ${className}`}>
      <svg 
        className="w-full h-full text-gaming-primary" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

interface LoadingProps {
  children?: React.ReactNode
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
  className?: string
}

export const Loading: React.FC<LoadingProps> = ({ 
  children, 
  message = 'Loading...', 
  size = 'lg',
  fullScreen = false,
  className = ''
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <LoadingSpinner size={size} />
      {message && (
        <p className="text-gray-300 text-center animate-pulse">
          {message}
        </p>
      )}
      {children}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker z-50 flex items-center justify-center">
        <div className="glass-morphism rounded-xl p-8 border border-white/10">
          {content}
        </div>
      </div>
    )
  }

  return content
}

// Page-level loading component
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading page...' 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
    <div className="glass-morphism rounded-xl p-8 border border-white/10">
      <Loading message={message} size="xl" />
    </div>
  </div>
)

// Component-level loading skeleton
export const LoadingSkeleton: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded-lg w-full"></div>
      </div>
    ))}
  </div>
)

// Card loading skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-morphism rounded-xl p-6 border border-white/10 ${className}`}>
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-700 rounded-lg w-3/4"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded-lg w-full"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded-lg w-5/6"></div>
      </div>
    </div>
  </div>
)

// Game card loading skeleton
export const GameCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-morphism rounded-xl overflow-hidden border border-white/10 ${className}`}>
    <div className="aspect-video bg-gray-700 animate-pulse"></div>
    <div className="p-4 space-y-3">
      <div className="animate-pulse">
        <div className="h-5 bg-gray-700 rounded-lg w-3/4"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded-lg w-full"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="animate-pulse">
          <div className="h-3 bg-gray-700 rounded-lg w-16"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-3 bg-gray-700 rounded-lg w-12"></div>
        </div>
      </div>
    </div>
  </div>
)

// List loading skeleton
export const ListSkeleton: React.FC<{
  items?: number
  className?: string
}> = ({ items = 5, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
)

// Loading overlay for components
export const LoadingOverlay: React.FC<{
  isLoading: boolean
  children: React.ReactNode
  message?: string
}> = ({ isLoading, children, message }) => (
  <div className="relative">
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
        <div className="glass-morphism rounded-lg p-4 border border-white/10">
          <LoadingSpinner size="md" />
          {message && (
            <p className="text-gray-300 text-sm mt-2">{message}</p>
          )}
        </div>
      </div>
    )}
  </div>
)

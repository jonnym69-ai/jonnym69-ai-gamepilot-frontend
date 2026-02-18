import React, { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { useAuth } from '../store/authStore'

interface MobileLayoutProps {
  children: ReactNode
  showNavigation?: boolean
  className?: string
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  showNavigation = true,
  className = ''
}) => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Navigation */}
      {showNavigation && isAuthenticated && (
        <Navigation 
          isAuthenticated={isAuthenticated}
          user={user}
        />
      )}

      {/* Main Content - Natural Page Scrolling */}
      <main className="bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {showNavigation && isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
          <div className="glass-morphism border-t border-white/10">
            <div className="grid grid-cols-5 gap-1 p-2">
              {[
                { path: '/', icon: '🏠', label: 'Home' },
                { path: '/library', icon: '📚', label: 'Library' },
                { path: '/identity', icon: '👤', label: 'Identity' },
                { path: '/integrations', icon: '🔗', label: 'Links' },
                { path: '/settings', icon: '⚙️', label: 'Settings' },
              ].map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for mobile bottom navigation */}
      {showNavigation && isAuthenticated && (
        <div className="h-20 lg:hidden" />
      )}
    </div>
  )
}

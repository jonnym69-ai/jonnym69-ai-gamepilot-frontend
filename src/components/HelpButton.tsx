// Help Button Component - Centralized Help Access
import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTour } from './TourManager'
import Tooltip from './Tooltip'

interface HelpButtonProps {
  position?: 'fixed' | 'static'
  location?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'small' | 'medium' | 'large'
  showTooltip?: boolean
  className?: string
}

interface HelpOption {
  id: string
  title: string
  description: string
  icon: string
  action: () => void
  category: 'tour' | 'documentation' | 'support' | 'feedback'
  badge?: string
}

const HelpButton: React.FC<HelpButtonProps> = ({
  position = 'fixed',
  location = 'bottom-right',
  size = 'medium',
  showTooltip = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { startTour, getAvailableTours } = useTour()

  const availableTours = getAvailableTours()

  const helpOptions: HelpOption[] = [
    // Tour options
    ...availableTours
      .filter(tour => !tour.hasSeen)
      .map(tour => ({
        id: `tour-${tour.id}`,
        title: tour.name,
        description: tour.description,
        icon: '🎯',
        action: () => {
          startTour(tour.id)
          setIsOpen(false)
        },
        category: 'tour' as const,
        badge: 'New'
      })),

    // Documentation options
    {
      id: 'help-center',
      title: 'Help Center',
      description: 'Browse comprehensive documentation and guides',
      icon: '📚',
      action: () => {
        window.open('/help', '_blank')
        setIsOpen(false)
      },
      category: 'documentation'
    },
    {
      id: 'quick-start',
      title: 'Quick Start Guide',
      description: 'Get started with GamePilot in 5 minutes',
      icon: '🚀',
      action: () => {
        window.open('/help/quick-start', '_blank')
        setIsOpen(false)
      },
      category: 'documentation'
    },
    {
      id: 'features-guide',
      title: 'Features Guide',
      description: 'Learn about all GamePilot features',
      icon: '⚡',
      action: () => {
        window.open('/help/features', '_blank')
        setIsOpen(false)
      },
      category: 'documentation'
    },

    // Support options
    {
      id: 'contact-support',
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: '💬',
      action: () => {
        window.open('/support', '_blank')
        setIsOpen(false)
      },
      category: 'support'
    },
    {
      id: 'report-bug',
      title: 'Report a Bug',
      description: 'Help us improve by reporting issues',
      icon: '🐛',
      action: () => {
        window.open('/support/bug-report', '_blank')
        setIsOpen(false)
      },
      category: 'support'
    },
    {
      id: 'feature-request',
      title: 'Request a Feature',
      description: 'Suggest new features or improvements',
      icon: '💡',
      action: () => {
        window.open('/support/feature-request', '_blank')
        setIsOpen(false)
      },
      category: 'support'
    },

    // Feedback options
    {
      id: 'send-feedback',
      title: 'Send Feedback',
      description: 'Share your thoughts and suggestions',
      icon: '📝',
      action: () => {
        window.open('/feedback', '_blank')
        setIsOpen(false)
      },
      category: 'feedback'
    },
    {
      id: 'rate-experience',
      title: 'Rate Your Experience',
      description: 'Help us improve by rating your experience',
      icon: '⭐',
      action: () => {
        window.open('/feedback/rating', '_blank')
        setIsOpen(false)
      },
      category: 'feedback'
    },

    // Community options
    {
      id: 'community-forum',
      title: 'Community Forum',
      description: 'Connect with other GamePilot users',
      icon: '👥',
      action: () => {
        window.open('https://community.gamepilot.app', '_blank')
        setIsOpen(false)
      },
      category: 'support'
    },
    {
      id: 'discord-server',
      title: 'Discord Server',
      description: 'Join our Discord community',
      icon: '💎',
      action: () => {
        window.open('https://discord.gg/gamepilot', '_blank')
        setIsOpen(false)
      },
      category: 'support'
    }
  ]

  const filteredOptions = helpOptions.filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPositionClasses = () => {
    if (position === 'static') return ''

    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    }
    return positions[location]
  }

  const getSizeClasses = () => {
    const sizes = {
      small: 'w-10 h-10',
      medium: 'w-12 h-12',
      large: 'w-14 h-14'
    }
    return sizes[size]
  }

  const getIconSize = () => {
    const sizes = {
      small: 'text-lg',
      medium: 'text-xl',
      large: 'text-2xl'
    }
    return sizes[size]
  }

  const getMenuPosition = () => {
    if (position === 'static') return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'

    const positions = {
      'bottom-right': 'bottom-full mb-2 right-0',
      'bottom-left': 'bottom-full mb-2 left-0',
      'top-right': 'top-full mt-2 right-0',
      'top-left': 'top-full mt-2 left-0'
    }
    return positions[location]
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const getCategoryColor = (category: string) => {
    const colors = {
      tour: 'bg-purple-500/20 text-purple-300 border-purple-500',
      documentation: 'bg-blue-500/20 text-blue-300 border-blue-500',
      support: 'bg-green-500/20 text-green-300 border-green-500',
      feedback: 'bg-orange-500/20 text-orange-300 border-orange-500'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500'
  }

  const helpButton = (
    <button
      ref={buttonRef}
      onClick={() => setIsOpen(!isOpen)}
      className={`
        ${position === 'fixed' ? 'fixed' : 'relative'} 
        ${getPositionClasses()}
        ${getSizeClasses()}
        bg-gradient-to-r from-purple-500 to-blue-500 
        text-white rounded-full 
        shadow-lg hover:shadow-xl 
        transform transition-all duration-200 
        hover:scale-110 
        flex items-center justify-center
        z-50
        ${className}
      `}
      aria-label="Help"
    >
      <span className={getIconSize()}>?</span>
      
      {/* Notification dot for new tours */}
      {availableTours.some(tour => !tour.hasSeen) && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  )

  const helpMenu = isOpen ? createPortal(
    <div
      ref={menuRef}
      className={`
        fixed z-50 
        ${getMenuPosition()}
        w-80 max-h-96 
        bg-gray-900 border border-gray-700 
        rounded-xl shadow-2xl 
        overflow-hidden
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">How can we help?</h3>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            autoFocus
          />
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Options */}
      <div className="max-h-64 overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No help options found</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredOptions.map(option => (
              <button
                key={option.id}
                onClick={option.action}
                className="w-full p-3 text-left hover:bg-gray-800 rounded-lg transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm">
                    {option.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-medium truncate">{option.title}</h4>
                      {option.badge && (
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{option.description}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${getCategoryColor(option.category)}`}>
                        {option.category}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Need more help?</span>
          <button
            onClick={() => {
              window.open('/help', '_blank')
              setIsOpen(false)
            }}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Visit Help Center →
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      {showTooltip ? (
        <Tooltip content="Get help with GamePilot" position="left">
          {helpButton}
        </Tooltip>
      ) : (
        helpButton
      )}
      {helpMenu}
    </>
  )
}

// Help Context for managing help state across the app
export const HelpContext = React.createContext<{
  showHelp: (topic?: string) => void
  hideHelp: () => void
  isHelpVisible: boolean
}>({
  showHelp: () => {},
  hideHelp: () => {},
  isHelpVisible: false
})

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHelpVisible, setIsHelpVisible] = useState(false)

  const showHelp = (topic?: string) => {
    if (topic) {
      // Navigate to specific help topic
      window.open(`/help/${topic}`, '_blank')
    } else {
      setIsHelpVisible(true)
    }
  }

  const hideHelp = () => {
    setIsHelpVisible(false)
  }

  return (
    <HelpContext.Provider value={{ showHelp, hideHelp, isHelpVisible }}>
      {children}
      <HelpButton />
    </HelpContext.Provider>
  )
}

// Hook for accessing help functionality
export const useHelp = () => {
  const context = React.useContext(HelpContext)
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider')
  }
  return context
}

export default HelpButton

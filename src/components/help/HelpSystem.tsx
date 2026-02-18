import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = rect.left + rect.width / 2
    const y = rect.top

    setCoords({ x, y })

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const getTooltipPosition = () => {
    const tooltipWidth = 200
    const tooltipHeight = 40
    const offset = 10

    switch (position) {
      case 'top':
        return {
          left: coords.x - tooltipWidth / 2,
          top: coords.y - tooltipHeight - offset
        }
      case 'bottom':
        return {
          left: coords.x - tooltipWidth / 2,
          top: coords.y + offset
        }
      case 'left':
        return {
          left: coords.x - tooltipWidth - offset,
          top: coords.y - tooltipHeight / 2
        }
      case 'right':
        return {
          left: coords.x + offset,
          top: coords.y - tooltipHeight / 2
        }
      default:
        return { left: coords.x - tooltipWidth / 2, top: coords.y - tooltipHeight - offset }
    }
  }

  const tooltipPosition = getTooltipPosition()

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-block ${className}`}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-700 pointer-events-none transition-opacity duration-200"
            style={{
              left: `${tooltipPosition.left}px`,
              top: `${tooltipPosition.top}px`,
              maxWidth: '200px',
              wordWrap: 'break-word'
            }}
          >
            <div className="relative">
              {content}
              <div
                className={`absolute w-2 h-2 bg-gray-900 border border-gray-700 transform rotate-45 ${
                  position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2' :
                  position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2' :
                  position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2' :
                  'left-[-5px] top-1/2 -translate-y-1/2'
                }`}
              />
            </div>
          </div>,
          document.body
        )
      }
    </>
  )
}

interface HelpTooltipProps {
  title: string
  content: string
  children: React.ReactNode
  className?: string
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-help"
      >
        {children}
      </div>
      {isOpen && (
        <div
          ref={tooltipRef}
          className="absolute z-50 w-80 bg-gray-900 text-white p-4 rounded-lg shadow-xl border border-gray-700 top-full mt-2"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{title}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  )
}

interface HelpCenterProps {
  isOpen: boolean
  onClose: () => void
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const helpCategories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: '🚀',
      articles: [
        {
          id: 'welcome',
          title: 'Welcome to GamePilot',
          content: 'GamePilot is your personal gaming identity platform that helps you discover, organize, and connect your gaming experiences across multiple platforms.',
          tags: ['beginner', 'overview']
        },
        {
          id: 'first-steps',
          title: 'Your First Steps',
          content: 'Start by connecting your gaming platforms, then explore your personalized recommendations and mood-based gaming suggestions.',
          tags: ['beginner', 'tutorial']
        },
        {
          id: 'account-setup',
          title: 'Setting Up Your Account',
          content: 'Complete your profile, set your gaming preferences, and configure privacy settings to get the most out of GamePilot.',
          tags: ['beginner', 'account']
        }
      ]
    },
    {
      id: 'features',
      name: 'Features',
      icon: '🎮',
      articles: [
        {
          id: 'game-library',
          title: 'Game Library',
          content: 'Organize your entire game collection from Steam, Epic, GOG, and more. Add games manually, track playtime, and manage your gaming backlog.',
          tags: ['library', 'games']
        },
        {
          id: 'mood-engine',
          title: 'Mood Engine',
          content: 'Discover games based on your current mood. Whether you\'re feeling competitive, relaxed, or creative, GamePilot has recommendations for you.',
          tags: ['mood', 'recommendations']
        },
        {
          id: 'recommendations',
          title: 'Personalized Recommendations',
          content: 'Get AI-powered game recommendations based on your gaming history, preferences, and mood patterns.',
          tags: ['ai', 'recommendations']
        },
        {
          id: 'integrations',
          title: 'Platform Integrations',
          content: 'Connect your Steam, Epic Games, GOG, Xbox, PlayStation, and Nintendo accounts to sync your game library.',
          tags: ['integrations', 'platforms']
        }
      ]
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      icon: '🔧',
      articles: [
        {
          id: 'connection-issues',
          title: 'Connection Issues',
          content: 'Having trouble connecting your gaming platforms? Check your credentials, ensure your accounts are public, and try refreshing the connection.',
          tags: ['troubleshooting', 'connections']
        },
        {
          id: 'sync-problems',
          title: 'Game Library Sync Problems',
          content: 'If your game library isn\'t syncing properly, try disconnecting and reconnecting the platform, or check if your profile is set to public.',
          tags: ['troubleshooting', 'sync']
        },
        {
          id: 'performance',
          title: 'Performance Issues',
          content: 'Experiencing slow performance? Try clearing your cache, disabling extensions, or checking your internet connection.',
          tags: ['troubleshooting', 'performance']
        }
      ]
    },
    {
      id: 'privacy',
      name: 'Privacy & Security',
      icon: '🔒',
      articles: [
        {
          id: 'data-privacy',
          title: 'Data Privacy',
          content: 'Learn how GamePilot protects your data, what information we collect, and how you can control your privacy settings.',
          tags: ['privacy', 'security']
        },
        {
          id: 'account-security',
          title: 'Account Security',
          content: 'Keep your account secure with strong passwords, two-factor authentication, and regular security checkups.',
          tags: ['security', 'account']
        },
        {
          id: 'data-deletion',
          title: 'Data Deletion',
          content: 'Learn how to delete your account and remove all your data from GamePilot if you decide to leave the platform.',
          tags: ['privacy', 'deletion']
        }
      ]
    }
  ]

  const filteredArticles = helpCategories
    .filter(category => activeCategory === 'all' || category.id === activeCategory)
    .flatMap(category => category.articles)
    .filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Help Center</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Search and Categories */}
            <div className="p-6 border-b border-gray-700">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {helpCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {filteredArticles.length > 0 ? (
                <div className="space-y-4">
                  {filteredArticles.map(article => (
                    <div
                      key={article.id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {article.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-400">No help articles found matching your search.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Can't find what you're looking for?
                </p>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Quick Help Component for inline help
interface QuickHelpProps {
  topic: string
  className?: string
}

export const QuickHelp: React.FC<QuickHelpProps> = ({ topic, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)

  const helpContent = {
    'game-library': {
      title: 'Game Library',
      content: 'Your game library is where you can organize all your games from different platforms. Add games manually, connect platforms, and track your gaming progress.',
      tips: [
        'Connect Steam to import your game library automatically',
        'Add games manually if they\'re not on connected platforms',
        'Use tags to organize your games by genre, mood, or platform',
        'Track your playtime and gaming sessions'
      ]
    },
    'mood-engine': {
      title: 'Mood Engine',
      content: 'The Mood Engine helps you discover games based on your current emotional state. Select your mood and get personalized recommendations.',
      tips: [
        'Choose your current mood from the mood bar',
        'Get recommendations that match your emotional state',
        'Track your mood patterns over time',
        'Discover games you might not have considered'
      ]
    },
    'recommendations': {
      title: 'Recommendations',
      content: 'Get personalized game recommendations based on your gaming history, preferences, and mood patterns.',
      tips: [
        'Rate games to improve recommendations',
        'Connect more platforms for better recommendations',
        'Use the mood engine for mood-based suggestions',
        'Explore new genres based on your preferences'
      ]
    },
    'integrations': {
      title: 'Platform Integrations',
      content: 'Connect your gaming platforms to sync your game library and get personalized recommendations.',
      tips: [
        'Steam: Connect your Steam account to import your library',
        'Epic Games: Link your Epic Games account',
        'GOG: Connect your GOG account',
        'Make sure your profiles are set to public for syncing'
      ]
    }
  }

  const content = helpContent[topic as keyof typeof helpContent]

  if (!content) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-purple-400 hover:text-purple-300 transition-colors"
      >
        <span className="text-lg">❓</span>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-80 bg-gray-900 text-white p-4 rounded-lg shadow-xl border border-gray-700 top-full mt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">{content.title}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-300 text-sm mb-3">{content.content}</p>
          <div className="border-t border-gray-700 pt-3">
            <h4 className="font-semibold text-white mb-2">Quick Tips:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              {content.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// Contextual Help Provider
interface HelpContextType {
  showTooltip: (content: string, element: HTMLElement, position?: string) => void
  hideTooltip: () => void
  showHelp: (topic: string) => void
  hideHelp: () => void
}

const HelpContext = React.createContext<HelpContextType | null>(null)

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tooltip, setTooltip] = useState<{
    content: string
    element: HTMLElement
    position: string
  } | null>(null)
  
  const showTooltip = (content: string, element: HTMLElement, position = 'top') => {
    setTooltip({ content, element, position })
  }

  const hideTooltip = () => {
    setTooltip(null)
  }

  const showHelp = (topic: string) => {
    // Help modal functionality - displays contextual help content
    // Future enhancement: Implement modal with rich content, videos, and guided tours
    console.log(`Help requested for topic: ${topic}`)
    // Implementation: Show help modal with topic-specific content
  }

  const hideHelp = () => {
    // Help modal functionality - hides the help interface
    // Future enhancement: Track help usage analytics for improvement
    console.log('Help hidden')
    // Implementation: Hide help modal and cleanup resources
  }

  return (
    <HelpContext.Provider value={{ showTooltip, hideTooltip, showHelp, hideHelp }}>
      {children}
      {/* Tooltip Portal */}
      {tooltip &&
        createPortal(
          <div
            className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-700 pointer-events-none"
            style={{
              position: 'absolute',
              left: tooltip.element.getBoundingClientRect().left,
              top: tooltip.element.getBoundingClientRect().top - 40
            }}
          >
            {tooltip.content}
          </div>,
          document.body
        )
      }
    </HelpContext.Provider>
  )
}

export const useHelp = () => {
  const context = React.useContext(HelpContext)
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider')
  }
  return context
}

// Help Button Component
export const HelpButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { showHelp } = useHelp()

  return (
    <button
      onClick={() => showHelp('game-library')}
      className={`fixed bottom-6 right-6 w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors flex items-center justify-center ${className}`}
    >
      <span className="text-xl">?</span>
    </button>
  )
}

// Keyboard Shortcuts Help
export const KeyboardShortcuts: React.FC = () => {
  const shortcuts = [
    { key: 'Ctrl + K', description: 'Open search' },
    { key: 'Ctrl + /', description: 'Open help center' },
    { key: 'Ctrl + N', description: 'Add new game' },
    { key: 'Ctrl + L', description: 'Go to library' },
    { key: 'Ctrl + H', description: 'Go to home' },
    { key: 'Escape', description: 'Close modal' }
  ]

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="font-semibold text-white mb-3">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between">
            <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
              {shortcut.key}
            </kbd>
            <span className="text-gray-400 text-sm">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default {
  Tooltip,
  HelpTooltip,
  HelpCenter,
  QuickHelp,
  HelpProvider,
  useHelp,
  HelpButton,
  KeyboardShortcuts
}

import React, { useState } from 'react'
import { QuickAction } from '../types'

interface QuickActionsProps {
  actions: QuickAction[]
  onActionClick?: (action: QuickAction) => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onActionClick
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const handleActionClick = (action: QuickAction) => {
    action.action()
    onActionClick?.(action)
  }

  if (actions.length === 0) {
    return null
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center">
          <span className="text-xl">⚡</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
          <p className="text-sm text-gray-400">Common tasks and shortcuts</p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            className={`
              relative p-4 rounded-xl transition-all duration-300 transform
              ${hoveredAction === action.id ? 'scale-105 -translate-y-1' : 'scale-100 translate-y-0'}
              ${hoveredAction === action.id ? 'ring-2 ring-white/20' : ''}
            `}
          >
            {/* Background Gradient */}
            <div className={`
              absolute inset-0 rounded-xl bg-gradient-to-br ${action.gradient}
              opacity-10 hover:opacity-20 transition-opacity duration-300
            `} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 mx-auto
                bg-gradient-to-r ${action.gradient}
              `}>
                {action.icon}
              </div>
              
              <h3 className="text-white font-medium text-sm mb-1">
                {action.title}
              </h3>
              
              <p className="text-gray-400 text-xs leading-relaxed">
                {action.description}
              </p>
            </div>

            {/* Glow effect on hover */}
            {hoveredAction === action.id && (
              <div className={`
                absolute inset-0 rounded-xl bg-gradient-to-r ${action.gradient}
                opacity-20 blur-xl -z-10
              `} />
            )}
          </button>
        ))}
      </div>

      {/* Additional Quick Links */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 hover:text-white rounded-lg transition-colors text-sm">
            📚 View Library
          </button>
          <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 hover:text-white rounded-lg transition-colors text-sm">
            🏆 Achievements
          </button>
          <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 hover:text-white rounded-lg transition-colors text-sm">
            📊 Statistics
          </button>
          <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 hover:text-white rounded-lg transition-colors text-sm">
            🔗 Integrations
          </button>
          <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 hover:text-white rounded-lg transition-colors text-sm">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  )
}

// Default quick actions that can be used as a starting point
export const defaultQuickActions: QuickAction[] = [
  {
    id: 'add-game',
    title: 'Add Game',
    description: 'Manually add a game to your library',
    icon: '➕',
    gradient: 'from-green-500 to-emerald-600',
    action: () => {
      console.log('Add game clicked')
      // Navigate to add game form
    }
  },
  {
    id: 'import-games',
    title: 'Import Games',
    description: 'Import from Steam, Xbox, PlayStation',
    icon: '📥',
    gradient: 'from-blue-500 to-cyan-600',
    action: () => {
      console.log('Import games clicked')
      // Navigate to import wizard
    }
  },
  {
    id: 'random-game',
    title: 'Random Game',
    description: 'Pick a random game from your library',
    icon: '🎲',
    gradient: 'from-purple-500 to-pink-600',
    action: () => {
      console.log('Random game clicked')
      // Show random game picker
    }
  },
  {
    id: 'backup',
    title: 'Backup Data',
    description: 'Export your game library and data',
    icon: '💾',
    gradient: 'from-orange-500 to-red-600',
    action: () => {
      console.log('Backup clicked')
      // Start backup process
    }
  },
  {
    id: 'discover',
    title: 'Discover',
    description: 'Find new games to play',
    icon: '🔍',
    gradient: 'from-indigo-500 to-purple-600',
    action: () => {
      console.log('Discover clicked')
      // Navigate to discovery page
    }
  },
  {
    id: 'share',
    title: 'Share Profile',
    description: 'Share your gaming profile',
    icon: '🔗',
    gradient: 'from-teal-500 to-green-600',
    action: () => {
      // Generate shareable profile URL
      const profileUrl = `${window.location.origin}/profile/${Math.random().toString(36).substr(2, 9)}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(profileUrl).then(() => {
        console.log('Profile URL copied to clipboard:', profileUrl);
        // Show success message
        alert('Profile link copied to clipboard! Share it with friends.');
      }).catch(err => {
        console.error('Failed to copy profile URL:', err);
        // Fallback: open share dialog
        if (navigator.share) {
          navigator.share({
            title: 'My GamePilot Profile',
            text: 'Check out my gaming profile on GamePilot!',
            url: profileUrl
          });
        } else {
          // Fallback: open in new tab
          window.open(profileUrl, '_blank');
        }
      });
    }
  },
  {
    id: 'wishlist',
    title: 'Wishlist',
    description: 'View your game wishlist',
    icon: '⭐',
    gradient: 'from-yellow-500 to-orange-600',
    action: () => {
      console.log('Wishlist clicked')
      // Navigate to wishlist
    }
  },
  {
    id: 'reviews',
    title: 'Reviews',
    description: 'Write and read game reviews',
    icon: '📝',
    gradient: 'from-pink-500 to-rose-600',
    action: () => {
      console.log('Reviews clicked')
      // Navigate to reviews section
    }
  }
]

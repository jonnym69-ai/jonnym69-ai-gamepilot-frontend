import React, { useState, useEffect } from 'react'
import { cn } from '../utils/cn'

export interface ActivityItem {
  id: string
  type: 'game' | 'friend' | 'achievement' | 'community'
  title: string
  description?: string
  timestamp: Date
  user?: string
  avatar?: string
  icon?: string
  intensity?: 'low' | 'medium' | 'high'
}

export interface ActivityPulseProps {
  activities: ActivityItem[]
  maxItems?: number
  refreshInterval?: number
  onRefresh?: () => void
  className?: string
  variant?: 'compact' | 'detailed' | 'minimal'
}

export const ActivityPulse: React.FC<ActivityPulseProps> = ({
  activities,
  maxItems = 5,
  refreshInterval = 30000,
  onRefresh,
  className,
  variant = 'detailed'
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [visibleActivities, setVisibleActivities] = useState(activities.slice(0, maxItems))

  useEffect(() => {
    setVisibleActivities(activities.slice(0, maxItems))
  }, [activities, maxItems])

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        handleRefresh()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [refreshInterval])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.()
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconMap = {
      game: '🎮',
      friend: '👥',
      achievement: '🏆',
      community: '🌐'
    }
    return iconMap[type]
  }

  const getActivityColor = (type: ActivityItem['type'], intensity?: ActivityItem['intensity']) => {
    const baseColors = {
      game: 'from-blue-500 to-purple-600',
      friend: 'from-green-500 to-teal-600',
      achievement: 'from-yellow-500 to-orange-600',
      community: 'from-purple-500 to-pink-600'
    }

    const intensityModifiers = {
      low: 'opacity-60',
      medium: 'opacity-80',
      high: 'opacity-100'
    }

    return cn(
      'bg-gradient-to-r',
      baseColors[type],
      intensity && intensityModifiers[intensity]
    )
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getVariantClasses = () => {
    const variantClasses = {
      compact: 'p-3 space-y-2',
      detailed: 'p-4 space-y-3',
      minimal: 'p-2 space-y-1'
    }
    return variantClasses[variant]
  }

  const getItemClasses = () => {
    const baseClasses = 'relative rounded-lg border transition-all duration-300'
    
    const variantClasses = {
      compact: 'p-2 border-gray-700 hover:border-gray-600',
      detailed: 'p-3 border-gray-700 hover:border-gaming-accent/50',
      minimal: 'p-1 border-gray-800 hover:border-gray-700'
    }
    
    return cn(baseClasses, variantClasses[variant])
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('glass-morphism rounded-xl', getVariantClasses(), className)}>
        {/* Pulse indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gaming-accent rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Activity</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            {isRefreshing ? '⟳' : '↻'}
          </button>
        </div>

        {/* Activity dots */}
        <div className="flex gap-1">
          {visibleActivities.map((activity: ActivityItem) => (
            <div
              key={activity.id}
              className={cn(
                'w-2 h-2 rounded-full',
                getActivityColor(activity.type, activity.intensity)
              )}
              title={activity.title}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('glass-morphism rounded-xl', getVariantClasses(), className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gaming-accent rounded-full animate-pulse" />
          <h3 className="text-white font-medium">Activity Pulse</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            'text-gray-400 hover:text-white transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isRefreshing && 'animate-spin'
          )}
        >
          ↻
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        {visibleActivities.map((activity) => (
          <div
            key={activity.id}
            className={getItemClasses()}
          >
            <div className="flex items-start gap-3">
              {/* Activity icon */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                getActivityColor(activity.type, activity.intensity)
              )}>
                {activity.icon || getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">
                  {activity.title}
                </h4>
                
                {variant === 'detailed' && activity.description && (
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1">
                  {activity.user && (
                    <span className="text-xs text-gray-500">
                      {activity.user}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>

              {/* Intensity indicator */}
              {activity.intensity && variant === 'detailed' && (
                <div className="flex flex-col gap-1">
                  {Array.from({ length: activity.intensity === 'low' ? 1 : activity.intensity === 'medium' ? 2 : 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-gaming-accent rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {visibleActivities.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-4xl mb-2">📭</div>
          <p className="text-gray-400 text-sm">
            No recent activity
          </p>
        </div>
      )}

      {/* Show more */}
      {activities.length > maxItems && (
        <div className="text-center mt-4">
          <button className="text-gaming-accent hover:text-gaming-accent/80 text-sm transition-colors">
            View {activities.length - maxItems} more activities
          </button>
        </div>
      )}
    </div>
  )
}

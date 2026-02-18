// Animated Components for GamePilot - Micro-interactions & Polish
import React, { useEffect, useState } from 'react'
import { 
  useIntersectionObserver, 
  useHoverAnimation, 
  useRippleEffect,
  useTypingAnimation
} from '../hooks/useAnimations'

// Animated Game Card Component
interface AnimatedGameCardProps {
  game: {
    id: string
    title: string
    coverImage: string
    genre: string
    playtime: number
    status: string
  }
  onClick?: () => void
  className?: string
}

export const AnimatedGameCard: React.FC<AnimatedGameCardProps> = ({
  game,
  onClick,
  className = ''
}) => {
  const { ref, hasIntersected } = useIntersectionObserver()
  const { isHovered, handlers } = useHoverAnimation()
  const { ripples } = useRippleEffect()

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`
        relative overflow-hidden rounded-xl cursor-pointer
        transition-all duration-300 ease-out
        ${hasIntersected ? 'animate-fade-in' : 'opacity-0'}
        ${isHovered ? 'transform scale-105 shadow-2xl' : 'transform scale-100 shadow-lg'}
        ${className}
      `}
      onClick={onClick}
      {...handlers}
    >
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}

      {/* Game Cover */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
        />
        
        {/* Overlay */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-black/70 to-transparent
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-70'}
        `}>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-lg mb-1">{game.title}</h3>
            <p className="text-white/80 text-sm">{game.genre}</p>
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-4 bg-white/10 backdrop-blur-sm">
        <div className="flex justify-between items-center text-white/80 text-sm">
          <span>{game.status}</span>
          <span>{game.playtime}h</span>
        </div>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <div className="absolute inset-0 rounded-xl border-2 border-purple-500/50 animate-glow pointer-events-none" />
      )}
    </div>
  )
}

// Animated Mood Button Component
interface AnimatedMoodButtonProps {
  mood: string
  emoji: string
  isSelected: boolean
  onClick: () => void
  className?: string
}

export const AnimatedMoodButton: React.FC<AnimatedMoodButtonProps> = ({
  mood,
  emoji,
  isSelected,
  onClick,
  className = ''
}) => {
  const { ref, hasIntersected } = useIntersectionObserver()
  const { isHovered, handlers } = useHoverAnimation()

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300 ease-out
        ${hasIntersected ? 'animate-slide-in-up' : 'opacity-0 translate-y-4'}
        ${isSelected 
          ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30 animate-glow' 
          : 'border-white/20 bg-white/10 hover:border-purple-400 hover:bg-purple-400/10'
        }
        ${isHovered ? 'transform scale-110 -translate-y-2' : 'transform scale-100'}
        ${className}
      `}
      {...handlers}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{emoji}</div>
        <div className="text-white text-sm font-medium">{mood}</div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  )
}

// Animated Loading Component
interface AnimatedLoadingProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  message = 'Loading...',
  size = 'medium',
  className = ''
}) => {
  const { displayedText, isTyping } = useTypingAnimation(message, 50, 300)

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Spinner */}
      <div className={`
        ${sizeClasses[size]} 
        border-2 border-white/20 border-t-white rounded-full
        animate-spin
      `} />

      {/* Typing Message */}
      <div className="text-white/80 text-sm">
        {displayedText}
        {isTyping && <span className="animate-pulse">|</span>}
      </div>
    </div>
  )
}

// Animated Stats Component
interface AnimatedStatsProps {
  stats: Array<{
    label: string
    value: string | number
    icon?: string
  }>
  className?: string
}

export const AnimatedStats: React.FC<AnimatedStatsProps> = ({
  stats,
  className = ''
}) => {
  const { ref, hasIntersected } = useIntersectionObserver()

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`
            bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center
            transition-all duration-500 ease-out delay-100
            ${hasIntersected ? 'animate-slide-in-up opacity-100' : 'opacity-0 translate-y-4'}
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {stat.icon && (
            <div className="text-2xl mb-2">{stat.icon}</div>
          )}
          <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
          <div className="text-white/60 text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// Animated Progress Bar Component
interface AnimatedProgressBarProps {
  value: number
  max: number
  label?: string
  color?: string
  className?: string
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  max,
  label,
  color = 'bg-purple-500',
  className = ''
}) => {
  const { ref, hasIntersected } = useIntersectionObserver()
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    if (hasIntersected) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [hasIntersected, percentage])

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm text-white/80">
          <span>{label}</span>
          <span>{Math.round(animatedValue)}%</span>
        </div>
      )}
      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
        <div
          className={`
            h-full rounded-full transition-all duration-1000 ease-out
            ${color}
            ${hasIntersected ? 'animate-slide-in-left' : 'translate-x-full opacity-0'}
          `}
          style={{ width: `${animatedValue}%` }}
        />
      </div>
    </div>
  )
}

// Animated Notification Component
interface AnimatedNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void
  className?: string
}

export const AnimatedNotification: React.FC<AnimatedNotificationProps> = ({
  type,
  message,
  onClose,
  className = ''
}) => {
  const { ref, hasIntersected } = useIntersectionObserver()
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  const typeStyles = {
    success: 'bg-green-500/20 border-green-500 text-green-300',
    error: 'bg-red-500/20 border-red-500 text-red-300',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-500 text-blue-300'
  }

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`
        relative p-4 rounded-lg border backdrop-blur-sm
        transition-all duration-300 ease-out
        ${hasIntersected && isVisible ? 'animate-slide-in-right opacity-100' : 'opacity-0 translate-x-full'}
        ${!isVisible ? 'animate-slide-out-right opacity-0' : ''}
        ${typeStyles[type]}
        ${className}
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm">
          {typeIcons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-4 h-4 rounded hover:bg-current/20 transition-colors"
          >
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Animated Floating Action Button Component
interface AnimatedFabProps {
  icon: React.ReactNode
  onClick: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className?: string
}

export const AnimatedFab: React.FC<AnimatedFabProps> = ({
  icon,
  onClick,
  position = 'bottom-right',
  className = ''
}) => {
  const { isHovered, handlers } = useHoverAnimation()
  const { ripples, createRipple } = useRippleEffect()

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <button
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        createRipple(e as any)
        onClick()
      }}
      className={`
        fixed w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500
        rounded-full shadow-lg flex items-center justify-center
        transition-all duration-300 ease-out
        ${positionClasses[position]}
        ${isHovered ? 'transform scale-110 shadow-2xl' : 'transform scale-100'}
        ${className}
      `}
      {...handlers}
    >
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}

      {/* Icon */}
      <div className="relative z-10 text-white">
        {icon}
      </div>

      {/* Hover Glow */}
      {isHovered && (
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
      )}
    </button>
  )
}

// Animated List Component
interface AnimatedListProps {
  items: Array<{
    id: string
    content: React.ReactNode
    icon?: React.ReactNode
  }>
  className?: string
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  items,
  className = ''
}) => {
  const { ref, hasIntersected } = useIntersectionObserver()

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`
            flex items-center space-x-3 p-3 rounded-lg
            bg-white/10 backdrop-blur-sm transition-all duration-300 ease-out
            ${hasIntersected ? 'animate-slide-in-left opacity-100' : 'opacity-0 -translate-x-4'}
          `}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {item.icon && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
              {item.icon}
            </div>
          )}
          <div className="flex-1 text-white/80">{item.content}</div>
        </div>
      ))}
    </div>
  )
}

// Animated Badge Component
interface AnimatedBadgeProps {
  count: number
  max?: number
  className?: string
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  count,
  max = 99,
  className = ''
}) => {
  const { ref, hasIntersected } = useIntersectionObserver()
  const displayCount = count > max ? `${max}+` : count.toString()

  if (count === 0) return null

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`
        relative inline-flex items-center justify-center
        w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full
        transition-all duration-300 ease-out
        ${hasIntersected ? 'animate-scale-in' : 'scale-0 opacity-0'}
        ${className}
      `}
    >
      {displayCount}
      {/* Pulse animation for new badges */}
      {hasIntersected && (
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping" />
      )}
    </div>
  )
}

// Animated Skeleton Loader Component
interface AnimatedSkeletonProps {
  lines?: number
  className?: string
}

export const AnimatedSkeleton: React.FC<AnimatedSkeletonProps> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            h-4 bg-white/20 rounded-full
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
            loading-skeleton
          `}
        />
      ))}
    </div>
  )
}

export default {
  AnimatedGameCard,
  AnimatedMoodButton,
  AnimatedLoading,
  AnimatedStats,
  AnimatedProgressBar,
  AnimatedNotification,
  AnimatedFab,
  AnimatedList,
  AnimatedBadge,
  AnimatedSkeleton
}

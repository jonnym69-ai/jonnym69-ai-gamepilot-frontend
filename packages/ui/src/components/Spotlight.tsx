import React from 'react'
import { cn } from '../utils/cn'

export interface SpotlightProps {
  children: React.ReactNode
  className?: string
  variant?: 'hero' | 'featured' | 'card'
  intensity?: 'subtle' | 'medium' | 'strong'
  color?: 'blue' | 'purple' | 'orange' | 'green' | 'pink'
}

export const Spotlight: React.FC<SpotlightProps> = ({
  children,
  className,
  variant = 'featured',
  intensity = 'medium',
  color = 'purple'
}) => {
  const getSpotlightClasses = () => {
    const baseClasses = 'relative overflow-hidden'
    
    const variantClasses = {
      hero: 'rounded-2xl',
      featured: 'rounded-xl',
      card: 'rounded-lg'
    }
    
    const intensityClasses = {
      subtle: 'before:opacity-30',
      medium: 'before:opacity-50',
      strong: 'before:opacity-70'
    }
    
    const colorClasses = {
      blue: 'before:bg-gradient-to-r before:from-blue-600 before:to-cyan-600',
      purple: 'before:bg-gradient-to-r before:from-purple-600 before:to-pink-600',
      orange: 'before:bg-gradient-to-r before:from-orange-600 before:to-red-600',
      green: 'before:bg-gradient-to-r before:from-green-600 before:to-emerald-600',
      pink: 'before:bg-gradient-to-r before:from-pink-600 before:to-rose-600'
    }
    
    return cn(
      baseClasses,
      variantClasses[variant],
      intensityClasses[intensity],
      colorClasses[color],
      className
    )
  }

  return (
    <div className={getSpotlightClasses()}>
      {/* Spotlight effect overlay */}
      <div 
        className={cn(
          'absolute inset-0 pointer-events-none',
          'before:absolute before:inset-0 before:blur-3xl',
          'after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:to-white/10'
        )}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

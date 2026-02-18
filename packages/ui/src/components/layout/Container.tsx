import React from 'react'
import { cn } from '../../utils/cn'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
  cinematic?: boolean
  children: React.ReactNode
}

export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  centered = false,
  cinematic = false,
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  const baseClasses = 'w-full px-4 sm:px-6 lg:px-8'
  const sizeClass = sizeClasses[size]
  const centeredClass = centered ? 'mx-auto' : ''
  const cinematicClass = cinematic ? 'backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10' : ''

  return (
    <div
      className={cn(
        baseClasses,
        sizeClass,
        centeredClass,
        cinematicClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

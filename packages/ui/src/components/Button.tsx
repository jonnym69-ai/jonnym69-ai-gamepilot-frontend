import React, { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'

const buttonVariants = cva(
  // Base classes
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        // Primary variants
        primary: 'bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white hover:opacity-90 focus:ring-gaming-primary/50 shadow-cinematic',
        secondary: 'bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-500/50 border border-gray-700',
        accent: 'bg-gradient-to-r from-gaming-accent to-purple-500 text-white hover:opacity-90 focus:ring-gaming-accent/50 shadow-cinematic',
        
        // Outline variants
        'outline-primary': 'border-2 border-gaming-primary text-gaming-primary hover:bg-gaming-primary hover:text-white focus:ring-gaming-primary/50',
        'outline-secondary': 'border-2 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white focus:ring-gray-500/50',
        'outline-accent': 'border-2 border-gaming-accent text-gaming-accent hover:bg-gaming-accent hover:text-white focus:ring-gaming-accent/50',
        
        // Ghost variants
        'ghost-primary': 'text-gaming-primary hover:bg-gaming-primary/10 focus:ring-gaming-primary/50',
        'ghost-secondary': 'text-gray-300 hover:bg-gray-800 focus:ring-gray-500/50',
        'ghost-accent': 'text-gaming-accent hover:bg-gaming-accent/10 focus:ring-gaming-accent/50',
        
        // Link variants
        link: 'text-gaming-primary hover:text-gaming-secondary underline-offset-4 hover:underline focus:ring-gaming-primary/50 p-0',
        'link-secondary': 'text-gray-300 hover:text-white underline-offset-4 hover:underline focus:ring-gray-500/50 p-0',
        'link-accent': 'text-gaming-accent hover:text-purple-500 underline-offset-4 hover:underline focus:ring-gaming-accent/50 p-0',
        
        // Gaming variants
        gaming: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-gaming tracking-wide uppercase hover:opacity-90 focus:ring-purple-500/50 shadow-cinematic transform hover:scale-105',
        neon: 'bg-black text-gaming-accent border-2 border-gaming-accent shadow-glow-accent hover:shadow-glow-primary focus:ring-gaming-accent/50 font-gaming',
        retro: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold hover:opacity-90 focus:ring-yellow-500/50 shadow-cinematic',
        cyberpunk: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-gaming tracking-wider hover:opacity-90 focus:ring-pink-500/50 shadow-glow-accent transform hover:scale-105',
        
        // Status variants
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 focus:ring-green-500/50 shadow-cinematic',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:opacity-90 focus:ring-yellow-500/50 shadow-cinematic',
        error: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90 focus:ring-red-500/50 shadow-cinematic',
        info: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:opacity-90 focus:ring-blue-500/50 shadow-cinematic'
      },
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
        '2xl': 'px-12 py-6 text-xl'
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      rounded: 'lg'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  cinematic?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  fullWidth,
  rounded,
  loading = false,
  icon,
  iconPosition = 'left',
  cinematic = false,
  disabled,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading
  const cinematicClass = cinematic ? 'shadow-cinematic hover:shadow-glow-primary transform hover:scale-105' : ''

  const renderIcon = () => {
    if (!icon) return null
    
    return (
      <span className={cn(
        'flex items-center',
        iconPosition === 'left' ? 'mr-2' : 'ml-2'
      )}>
        <>{icon}</>
      </span>
    )
  }

  return (
    <button
      className={cn(
        buttonVariants({ variant, size, fullWidth, rounded }),
        cinematicClass,
        isDisabled && 'cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          Loading...
        </div>
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          {children}
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </button>
  )
}

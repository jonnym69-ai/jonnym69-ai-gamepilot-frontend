import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'

const inputVariants = cva(
  // Base classes
  'flex w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Default variants
        default: 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
        primary: 'bg-gray-800/50 border-gaming-primary/30 text-white placeholder-gray-400 focus:border-gaming-primary focus:ring-gaming-primary/50',
        secondary: 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500/50',
        accent: 'bg-gray-800/50 border-gaming-accent/30 text-white placeholder-gray-400 focus:border-gaming-accent focus:ring-gaming-accent/50',
        
        // Glass variants
        glass: 'glass-morphism border-white/20 text-white placeholder-gray-400 focus:border-gaming-primary focus:ring-gaming-primary/50',
        'glass-dark': 'glass-morphism border-white/10 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
        'glass-light': 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
        
        // Gaming variants
        gaming: 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 text-white placeholder-purple-300 focus:border-gaming-accent focus:ring-gaming-accent/50 font-gaming',
        neon: 'bg-black border-gaming-accent text-gaming-accent placeholder-gaming-accent/50 focus:border-gaming-primary focus:ring-gaming-primary/50 shadow-glow-accent font-gaming',
        retro: 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400 focus:ring-yellow-400/50 font-bold',
        cyberpunk: 'bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-pink-500/30 text-pink-100 placeholder-pink-300 focus:border-gaming-accent focus:ring-gaming-accent/50 font-gaming tracking-wider',
        
        // Minimal variants
        minimal: 'bg-transparent border-gray-700 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
        flat: 'bg-gray-900 border-0 border-b-2 border-gray-700 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-0 rounded-none'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg'
      },
      state: {
        default: '',
        error: 'border-red-500 text-white placeholder-red-300 focus:border-red-500 focus:ring-red-500/50',
        success: 'border-green-500 text-white placeholder-green-300 focus:border-green-500 focus:ring-green-500/50',
        warning: 'border-yellow-500 text-white placeholder-yellow-300 focus:border-yellow-500 focus:ring-yellow-500/50'
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
      fullWidth: true
    }
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  description?: string
  error?: string
  success?: string
  warning?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  cinematic?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  variant,
  size,
  state,
  fullWidth,
  label,
  description,
  error,
  success,
  warning,
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  cinematic = true,
  disabled,
  ...props
}, ref) => {
  const inputState = error ? 'error' : success ? 'success' : warning ? 'warning' : state
  const cinematicClass = cinematic ? 'animate-fade-in' : ''

  const renderLeftContent = () => {
    if (leftAddon) {
      return (
        <div className="flex items-center px-3 bg-gray-800/50 border-r border-gray-700 rounded-l-lg">
          {leftAddon}
        </div>
      )
    }
    
    if (leftIcon) {
      return (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )
    }
    
    return null
  }

  const renderRightContent = () => {
    if (rightAddon) {
      return (
        <div className="flex items-center px-3 bg-gray-800/50 border-l border-gray-700 rounded-r-lg">
          {rightAddon}
        </div>
      )
    }
    
    if (rightIcon) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )
    }
    
    return null
  }

  const getInputPaddingLeft = () => {
    if (leftAddon) return 'pl-0'
    if (leftIcon) return 'pl-10'
    return ''
  }

  const getInputPaddingRight = () => {
    if (rightAddon) return 'pr-0'
    if (rightIcon) return 'pr-10'
    return ''
  }

  return (
    <div className={cn('w-full', cinematicClass)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative flex">
        {renderLeftContent()}
        
        <input
          ref={ref}
          className={cn(
            inputVariants({ variant, size, state: inputState, fullWidth }),
            getInputPaddingLeft(),
            getInputPaddingRight(),
            leftAddon && 'rounded-l-none',
            rightAddon && 'rounded-r-none',
            className
          )}
          disabled={disabled}
          {...props}
        />
        
        {renderRightContent()}
      </div>
      
      {/* Helper text */}
      {(description || error || success || warning) && (
        <div className="mt-2 text-sm">
          {error && (
            <p className="text-red-400 flex items-center gap-1">
              <span>⚠️</span>
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 flex items-center gap-1">
              <span>✓</span>
              {success}
            </p>
          )}
          {warning && (
            <p className="text-yellow-400 flex items-center gap-1">
              <span>⚡</span>
              {warning}
            </p>
          )}
          {description && !error && !success && !warning && (
            <p className="text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Specialized input components
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {}

export const SearchInput: React.FC<SearchInputProps> = ({
  className,
  ...props
}) => {
  return (
    <Input
      variant="glass"
      size="md"
      leftIcon={<span>🔍</span>}
      placeholder="Search..."
      className={cn('font-gaming', className)}
      {...props}
    />
  )
}

interface NumberInputProps extends Omit<InputProps, 'type'> {}

export const NumberInput: React.FC<NumberInputProps> = ({
  className,
  ...props
}) => {
  return (
    <Input
      type="number"
      variant="default"
      size="md"
      className={cn('font-mono tabular-nums', className)}
      {...props}
    />
  )
}

interface TextAreaInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: 'default' | 'glass' | 'gaming'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const TextArea: React.FC<TextAreaInputProps> = ({
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const variantClasses: Record<string, string> = {
    default: 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
    glass: 'glass-morphism border-white/20 text-white placeholder-gray-400 focus:border-gaming-primary focus:ring-gaming-primary/50',
    gaming: 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 text-white placeholder-purple-300 focus:border-gaming-accent focus:ring-gaming-accent/50 font-gaming'
  }

  return (
    <div className="w-full">
      <textarea
        className={cn(
          'flex w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical min-h-[100px]',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    </div>
  )
}

interface SelectInputProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'default' | 'glass' | 'gaming'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  options: Array<{
    value: string | number
    label: string
    disabled?: boolean
  }>
}

export const Select: React.FC<SelectInputProps> = ({
  className,
  variant = 'default',
  size = 'md',
  options,
  ...props
}) => {
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const variantClasses: Record<string, string> = {
    default: 'bg-gray-800/50 border-gray-700 text-white focus:border-gaming-primary focus:ring-gaming-primary/50',
    glass: 'glass-morphism border-white/20 text-white focus:border-gaming-primary focus:ring-gaming-primary/50',
    gaming: 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 text-white focus:border-gaming-accent focus:ring-gaming-accent/50 font-gaming'
  }

  return (
    <select
      className={cn(
        'flex w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

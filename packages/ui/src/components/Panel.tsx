import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'

const panelVariants = cva(
  // Base classes
  'relative backdrop-blur-md border transition-all duration-300',
  {
    variants: {
      variant: {
        // Glass morphism variants
        glass: 'bg-white/10 border-white/20',
        'glass-dark': 'bg-black/40 border-white/10',
        'glass-light': 'bg-white/80 border-gray-200/30',
        'glass-primary': 'bg-gaming-primary/10 border-gaming-primary/30',
        'glass-accent': 'bg-gaming-accent/10 border-gaming-accent/30',
        
        // Solid variants
        solid: 'bg-gray-900 border-gray-800',
        'solid-primary': 'bg-gaming-primary/20 border-gaming-primary/40',
        'solid-accent': 'bg-gaming-accent/20 border-gaming-accent/40',
        
        // Gaming variants
        gaming: 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur-sm',
        neon: 'bg-black border-gaming-accent shadow-glow-accent',
        retro: 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30',
        cyberpunk: 'bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-500/30 backdrop-blur-sm',
        
        // Minimal variants
        minimal: 'bg-gray-800/50 border-gray-700/50',
        subtle: 'bg-gray-900/30 border-gray-700/30'
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12',
        full: 'p-16'
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full'
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        cinematic: 'shadow-cinematic',
        glow: 'shadow-glow-primary'
      },
      animated: {
        true: 'transition-all duration-300',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'glass',
      size: 'md',
      rounded: 'xl',
      shadow: 'cinematic',
      animated: true
    }
  }
)

export interface PanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelVariants> {
  header?: React.ReactNode
  body?: React.ReactNode
  footer?: React.ReactNode
  overlay?: React.ReactNode
  cinematic?: boolean
}

export const Panel: React.FC<PanelProps> = ({
  className,
  variant,
  size,
  rounded,
  shadow,
  animated,
  header,
  body,
  footer,
  overlay,
  cinematic = true,
  children,
  ...props
}) => {
  const cinematicClass = cinematic ? 'animate-fade-in' : ''

  return (
    <div
      className={cn(
        panelVariants({ variant, size, rounded, shadow, animated }),
        cinematicClass,
        className
      )}
      {...props}
    >
      {/* Overlay content */}
      {overlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {overlay}
        </div>
      )}
      
      {/* Panel content */}
      <div className="relative z-0 h-full flex flex-col">
        {/* Header */}
        {header && (
          <div className="flex-shrink-0 mb-6 pb-4 border-b border-white/10">
            {header}
          </div>
        )}
        
        {/* Body */}
        <div className="flex-1 min-w-0">
          {body || children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 mt-6 pt-4 border-t border-white/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Panel sub-components
interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  centered?: boolean
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  className,
  title,
  subtitle,
  icon,
  actions,
  centered = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-4',
        centered && 'justify-center',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl flex items-center justify-center text-white text-xl">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <h2 className="text-xl font-semibold text-white mb-1">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-sm text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}

interface PanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  centered?: boolean
  scrollable?: boolean
}

export const PanelBody: React.FC<PanelBodyProps> = ({
  className,
  centered = false,
  scrollable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'text-gray-100',
        centered && 'text-center',
        scrollable && 'overflow-y-auto max-h-96',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  centered?: boolean
  spaced?: boolean
}

export const PanelFooter: React.FC<PanelFooterProps> = ({
  className,
  centered = false,
  spaced = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center',
        centered && 'justify-center',
        spaced && 'justify-between',
        !centered && !spaced && 'gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Specialized panel components
interface StatsPanelProps extends Omit<PanelProps, 'variant'> {
  title?: string
  stats: Array<{
    label: string
    value: string | number
    change?: number
    icon?: React.ReactNode
  }>
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  title,
  stats,
  className,
  ...props
}) => {
  return (
    <Panel
      variant="glass-dark"
      size="lg"
      className={className}
      {...props}
    >
      {title && (
        <PanelHeader title={title} />
      )}
      
      <PanelBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              {stat.icon && (
                <div className="w-10 h-10 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center text-white mx-auto mb-2">
                  {stat.icon}
                </div>
              )}
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 mb-1">
                {stat.label}
              </div>
              {stat.change !== undefined && (
                <div className={cn(
                  'text-xs font-medium',
                  stat.change > 0 ? 'text-green-400' : stat.change < 0 ? 'text-red-400' : 'text-gray-400'
                )}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </div>
              )}
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}

interface SettingsPanelProps extends Omit<PanelProps, 'variant'> {
  title?: string
  description?: string
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  title,
  description,
  children,
  className,
  ...props
}) => {
  return (
    <Panel
      variant="glass"
      size="lg"
      className={className}
      {...props}
    >
      {(title || description) && (
        <PanelHeader
          title={title}
          subtitle={description}
        />
      )}
      
      <PanelBody>
        {children}
      </PanelBody>
    </Panel>
  )
}

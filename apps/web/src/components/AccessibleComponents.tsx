// Accessible Components for GamePilot - WCAG 2.1 AA Compliance
import React, { useRef, useEffect, useState, forwardRef } from 'react'
import {
  useFocusManagement,
  useScreenReaderAnnouncements,
  useAriaAttributes,
  useFocusVisible,
  useAccessibleForm
} from '../hooks/useAccessibility'

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'medium',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled = false,
    className = '',
    onClick,
    ...props
  }, ref) => {
  const { announcePolite } = useScreenReaderAnnouncements()
  const { getAriaAttributes } = useAriaAttributes()
  const isFocusVisible = useFocusVisible()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return
    
    if (onClick) {
      onClick(event)
    }
    
    // Announce button action for screen readers
    const buttonText = typeof children === 'string' ? children : 'Button'
    announcePolite(`${buttonText} activated`)
  }

  const getVariantClasses = () => {
    const baseClasses = 'btn-accessible transition-all duration-200 ease-out'
    const variantClasses = {
      primary: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white',
      secondary: 'bg-white/10 text-white border border-white/20',
      danger: 'bg-red-500 text-white'
    }
    const sizeClasses = {
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-3 text-base',
      large: 'px-6 py-4 text-lg'
    }

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''}`
  }

  const ariaAttrs = getAriaAttributes({
    'aria-busy': loading ? 'true' : 'false',
    'aria-disabled': disabled ? 'true' : 'false'
  })

  return (
    <button
      ref={ref}
      className={`
        ${getVariantClasses()}
        ${isFocusVisible ? 'focus-visible' : ''}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      {...ariaAttrs}
      {...props}
    >
      {loading && (
        <span className="loading-spinner-accessible mr-2" aria-hidden="true" />
      )}
      
      {icon && iconPosition === 'left' && (
        <span className="mr-2" aria-hidden="true">{icon}</span>
      )}
      
      <span className="flex items-center justify-center">
        {children}
      </span>
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2" aria-hidden="true">{icon}</span>
      )}
    </button>
  )
})

AccessibleButton.displayName = 'AccessibleButton'

// Accessible Form Field Component
interface AccessibleFormFieldProps {
  label: string
  id: string
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  className?: string
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  id,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  value,
  onChange,
  onBlur,
  className = ''
}) => {
  const { announcePolite } = useScreenReaderAnnouncements()
  const { hasError } = useAccessibleForm()
  const { getAriaAttributes } = useAriaAttributes()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value)
    }
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur()
    }
    
    // Announce field validation status
    if (error) {
      announcePolite(`${label} field has error: ${error}`)
    }
  }

  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`
  const errorId = `${fieldId}-error`
  const helperId = `${fieldId}-helper`

  const ariaAttrs = getAriaAttributes({
    'aria-required': required ? 'true' : 'false',
    'aria-invalid': !!error ? 'true' : 'false',
    'aria-describedby': [
      error ? errorId : null,
      helperText ? helperId : null
    ].filter(Boolean).join(' ')
  })

  return (
    <div className={`form-field ${className}`}>
      <label 
        htmlFor={fieldId}
        className="form-label"
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </label>
      
      <input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={`form-control ${hasError(fieldId) ? 'border-red-500' : ''}`}
        {...ariaAttrs}
      />
      
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div id={helperId} className="text-sm text-gray-400 mt-1">
          {helperText}
        </div>
      )}
    </div>
  )
}

// Accessible Modal Component
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnEscape = true,
  closeOnBackdrop = true
}) => {
  const { trapFocus, restoreFocus } = useFocusManagement()
  const { announcePolite } = useScreenReaderAnnouncements()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const getSizeClasses = () => {
    const sizes = {
      small: 'max-w-md',
      medium: 'max-w-2xl',
      large: 'max-w-4xl'
    }
    return sizes[size]
  }

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Trap focus within modal
      const cleanup = trapFocus(modalRef.current)
      
      // Announce modal opening
      announcePolite(`${title} modal opened`)
      
      return cleanup
    } else if (!isOpen && previousFocusRef.current) {
      // Restore focus when modal closes
      restoreFocus()
    }
  }, [isOpen, trapFocus, restoreFocus, announcePolite, title])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeOnEscape, onClose])

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="modal-accessible"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />
      
      <div className={`modal-content-accessible ${getSizeClasses()}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-white">
            {title}
          </h2>
          
          <button
            onClick={onClose}
            className="modal-close-accessible"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="text-white">
          {children}
        </div>
      </div>
    </div>
  )
}

// Accessible Tabs Component
interface AccessibleTabProps {
  tabs: Array<{
    id: string
    label: string
    content: React.ReactNode
  }>
  defaultTab?: string
  className?: string
}

export const AccessibleTabs: React.FC<AccessibleTabProps> = ({
  tabs,
  defaultTab,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')

  const currentTab = defaultTab || activeTab

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  return (
    <div className={className}>
      <div 
        className="tablist-accessible"
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={currentTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`tab-accessible ${currentTab === tab.id ? 'font-semibold' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`tabpanel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          className={`tabpanel-accessible ${currentTab === tab.id ? 'block' : 'hidden'}`}
          hidden={currentTab !== tab.id}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}

// Accessible Accordion Component
interface AccessibleAccordionProps {
  items: Array<{
    id: string
    title: string
    content: React.ReactNode
  }>
  allowMultiple?: boolean
  defaultOpen?: string[]
  className?: string
}

export const AccessibleAccordion: React.FC<AccessibleAccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = ''
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen))
  const { announcePolite } = useScreenReaderAnnouncements()

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      
      if (allowMultiple) {
        if (newSet.has(itemId)) {
          newSet.delete(itemId)
          announcePolite(`Section ${items.find(i => i.id === itemId)?.title} collapsed`)
        } else {
          newSet.add(itemId)
          announcePolite(`Section ${items.find(i => i.id === itemId)?.title} expanded`)
        }
      } else {
        if (newSet.has(itemId)) {
          newSet.clear()
          announcePolite(`Section ${items.find(i => i.id === itemId)?.title} collapsed`)
        } else {
          newSet.clear()
          newSet.add(itemId)
          announcePolite(`Section ${items.find(i => i.id === itemId)?.title} expanded`)
        }
      }
      
      return newSet
    })
  }

  return (
    <div className={className}>
      {items.map((item) => (
        <div key={item.id} className="accordion-accessible">
          <button
            aria-expanded={openItems.has(item.id)}
            aria-controls={`accordion-content-${item.id}`}
            id={`accordion-header-${item.id}`}
            className="accordion-header-accessible"
            onClick={() => toggleItem(item.id)}
          >
            <span>{item.title}</span>
            <span 
              className={`transform transition-transform duration-200 ${
                openItems.has(item.id) ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              ▼
            </span>
          </button>
          
          <div
            id={`accordion-content-${item.id}`}
            aria-labelledby={`accordion-header-${item.id}`}
            className={`accordion-content-accessible ${
              openItems.has(item.id) ? 'block' : 'hidden'
            }`}
            hidden={!openItems.has(item.id)}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}

// Accessible Skip Links Component
interface AccessibleSkipLinksProps {
  links: Array<{
    id: string
    label: string
    target: string
  }>
  className?: string
}

export const AccessibleSkipLinks: React.FC<AccessibleSkipLinksProps> = ({
  links,
  className = ''
}) => {
  return (
    <div className={className}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.target}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault()
            const target = document.querySelector(link.target) as HTMLElement
            if (target) {
              target.focus()
              target.scrollIntoView()
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}

// Accessible Card Component
interface AccessibleCardProps {
  children: React.ReactNode
  title?: string
  description?: string
  onClick?: () => void
  focusable?: boolean
  className?: string
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  children,
  title,
  description,
  onClick,
  focusable = false,
  className = ''
}) => {
  const { getAriaAttributes } = useAriaAttributes()
  const isFocusVisible = useFocusVisible()

  const CardComponent = focusable ? 'button' : 'div'
  const cardProps = focusable ? {
    onClick,
    type: 'button' as const,
    'aria-label': title || description
  } : {}

  const ariaAttrs = getAriaAttributes({
    ...(description && { 'aria-describedby': 'card-description' })
  })

  return (
    <CardComponent
      className={`card-accessible ${isFocusVisible ? 'focus-visible' : ''} ${className}`}
      {...cardProps}
      {...ariaAttrs}
    >
      {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
      {description && (
        <p id="card-description" className="text-white/80 text-sm">
          {description}
        </p>
      )}
      {children}
    </CardComponent>
  )
}

// Accessible Progress Bar Component
interface AccessibleProgressProps {
  value: number
  max: number
  label?: string
  showValue?: boolean
  className?: string
}

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max,
  label,
  showValue = true,
  className = ''
}) => {
  const percentage = Math.round((value / max) * 100)
  const { announcePolite } = useScreenReaderAnnouncements()

  useEffect(() => {
    announcePolite(`Progress: ${percentage} percent`)
  }, [percentage, announcePolite])

  return (
    <div className={className}>
      {label && (
        <div className="progress-label-accessible">
          {label}
          {showValue && <span className="ml-2">({percentage}%)</span>}
        </div>
      )}
      
      <div 
        className="progress-accessible"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${percentage} percent`}
      >
        <div 
          className="progress-bar-accessible"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Accessible Alert Component
interface AccessibleAlertProps {
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export const AccessibleAlert: React.FC<AccessibleAlertProps> = ({
  type,
  message,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const { announcePolite } = useScreenReaderAnnouncements()

  useEffect(() => {
    announcePolite(`${type}: ${message}`)
  }, [message, type, announcePolite])

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss()
    }
    announcePolite('Alert dismissed')
  }

  return (
    <div 
      className={`alert-accessible alert-${type} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center">
        <span className="mr-2">
          {type === 'success' && '✓'}
          {type === 'warning' && '⚠'}
          {type === 'error' && '✕'}
          {type === 'info' && 'ℹ'}
        </span>
        <span>{message}</span>
      </div>
      
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="ml-auto text-white/60 hover:text-white"
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  )
}

// Accessible Badge Component
interface AccessibleBadgeProps {
  count: number
  max?: number
  label?: string
  className?: string
}

export const AccessibleBadge: React.FC<AccessibleBadgeProps> = ({
  count,
  max = 99,
  label,
  className = ''
}) => {
  const { announcePolite } = useScreenReaderAnnouncements()
  const displayCount = count > max ? `${max}+` : count.toString()

  useEffect(() => {
    if (label) {
      announcePolite(`${label}: ${displayCount}`)
    }
  }, [count, label, displayCount, announcePolite])

  if (count === 0) return null

  return (
    <div 
      className={`badge-accessible ${className}`}
      aria-label={`${label || 'Badge'}: ${displayCount}`}
    >
      {displayCount}
    </div>
  )
}

export default {
  AccessibleButton,
  AccessibleFormField,
  AccessibleModal,
  AccessibleTabs,
  AccessibleAccordion,
  AccessibleSkipLinks,
  AccessibleCard,
  AccessibleProgress,
  AccessibleAlert,
  AccessibleBadge
}

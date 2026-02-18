import React, { useRef, useEffect, useState } from 'react'

// Accessibility utilities for React components
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const focusableElementsRef = useRef<HTMLElement[]>([])

  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ]
    
    return Array.from(container.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[]
  }

  const trapFocus = (container: HTMLElement) => {
    focusableElementsRef.current = getFocusableElements(container)
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const firstElement = focusableElementsRef.current[0]
        const lastElement = focusableElementsRef.current[focusableElementsRef.current.length - 1]
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }
    
    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }

  const restoreFocus = () => {
    if (focusedElement) {
      focusedElement.focus()
    }
  }

  const setInitialFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container)
    if (focusableElements.length > 0) {
      setFocusedElement(document.activeElement as HTMLElement)
      focusableElements[0].focus()
    }
  }

  return { trapFocus, restoreFocus, setInitialFocus, getFocusableElements }
}

// Keyboard navigation hook
export const useKeyboardNavigation = (onEscape?: () => void, onEnter?: () => void) => {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onEscape?.()
          break
        case 'Enter':
          onEnter?.()
          break
        case 'ArrowUp':
          e.preventDefault()
          // Navigate to previous element
          break
        case 'ArrowDown':
          e.preventDefault()
          // Navigate to next element
          break
        case 'Home':
          e.preventDefault()
          // Navigate to first element
          break
        case 'End':
          e.preventDefault()
          // Navigate to last element
          break
      }
    }

    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, onEnter])

  return elementRef
}

// Screen reader announcements
export const useScreenReader = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const announcePolite = (message: string) => announce(message, 'polite')
  const announceAssertive = (message: string) => announce(message, 'assertive')

  return { announce, announcePolite, announceAssertive }
}

// ARIA attributes hook
export const useAria = (initialState: Record<string, string> = {}) => {
  const [ariaAttributes, setAriaAttributes] = useState(initialState)

  const updateAria = (key: string, value: string) => {
    setAriaAttributes(prev => ({ ...prev, [key]: value }))
  }

  const removeAria = (key: string) => {
    setAriaAttributes(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }

  return { ariaAttributes, updateAria, removeAria }
}

// Skip links component
export const SkipLinks: React.FC = () => {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>
      <a href="#search" className="skip-link">
        Skip to search
      </a>
    </>
  )
}

// Focus trap component
interface FocusTrapProps {
  children: React.ReactNode
  isActive: boolean
  onEscape?: () => void
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, isActive, onEscape }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { trapFocus, restoreFocus, setInitialFocus } = useFocusManagement()

  useEffect(() => {
    if (isActive && containerRef.current) {
      const cleanup = trapFocus(containerRef.current)
      setInitialFocus(containerRef.current)
      
      return () => {
        cleanup()
        restoreFocus()
      }
    }
  }, [isActive, trapFocus, restoreFocus, setInitialFocus])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
      }
    }

    if (isActive) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isActive, onEscape])

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  )
}

// Accessible button component
interface AccessibleButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  variant = 'primary',
  size = 'medium',
  className = ''
}) => {
  const baseClasses = 'btn'
  const variantClasses = `btn-${variant}`
  const sizeClasses = `btn-${size}`
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  )
}

// Helper function to convert percentage to width class
const getPercentageWidth = (percentage: number): string => {
  if (percentage <= 0) return 'w-0'
  if (percentage <= 10) return 'w-10'
  if (percentage <= 20) return 'w-20'
  if (percentage <= 30) return 'w-30'
  if (percentage <= 40) return 'w-40'
  if (percentage <= 50) return 'w-50'
  if (percentage <= 60) return 'w-60'
  if (percentage <= 70) return 'w-70'
  if (percentage <= 80) return 'w-80'
  if (percentage <= 90) return 'w-90'
  return 'w-100'
}

// Accessible form input component
interface AccessibleInputProps {
  label: string
  type?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helpText?: string
  className?: string
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  className = ''
}) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${inputId}-error` : undefined
  const helpId = helpText ? `${inputId}-help` : undefined

  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`form-group ${className}`}>
      <label 
        htmlFor={inputId}
        className="form-label"
      >
        {label}
        {required && <span className="required" aria-label="required">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="form-input"
      />
      {error && (
        <div id={errorId} className="error-message" role="alert">
          {error}
        </div>
      )}
      {helpText && (
        <div id={helpId} className="help-text">
          {helpText}
        </div>
      )}
    </div>
  )
}

// Accessible modal component
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium'
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const { announceAssertive } = useScreenReader()

  useEffect(() => {
    if (isOpen) {
      announceAssertive(`${title} modal opened`)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, title, announceAssertive])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div
        ref={modalRef}
        className={`modal-content modal-${size}`}
        role="document"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="modal-close"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

// Accessible tabs component
interface AccessibleTabProps {
  tabs: Array<{
    id: string
    label: string
    content: React.ReactNode
  }>
  defaultTab?: string
}

export const AccessibleTabs: React.FC<AccessibleTabProps> = ({
  tabs,
  defaultTab
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const { announcePolite } = useScreenReader()

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const tab = tabs.find(t => t.id === tabId)
    announcePolite(`Switched to ${tab?.label} tab`)
  }

  return (
    <div className="tabs">
      <div className="tablist" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id ? true : false}
            aria-controls={`panel-${tab.id}`}
            onClick={() => handleTabChange(tab.id)}
            className="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className="tabpanel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}

// Accessible accordion component
interface AccessibleAccordionProps {
  items: Array<{
    id: string
    title: string
    content: React.ReactNode
  }>
  allowMultiple?: boolean
}

export const AccessibleAccordion: React.FC<AccessibleAccordionProps> = ({
  items,
  allowMultiple = false
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const { announcePolite } = useScreenReader()

  const toggleItem = (itemId: string) => {
    const isOpen = openItems.has(itemId)
    const newOpenItems = new Set(openItems)
    
    if (isOpen) {
      newOpenItems.delete(itemId)
      announcePolite(`Collapsed ${items.find(item => item.id === itemId)?.title}`)
    } else {
      if (!allowMultiple) {
        newOpenItems.clear()
      }
      newOpenItems.add(itemId)
      announcePolite(`Expanded ${items.find(item => item.id === itemId)?.title}`)
    }
    
    setOpenItems(newOpenItems)
  }

  return (
    <div className="accordion">
      {items.map((item) => (
        <div key={item.id} className="accordion-item">
          <button
            id={`accordion-header-${item.id}`}
            aria-expanded={openItems.has(item.id) ? true : false}
            aria-controls={`accordion-content-${item.id}`}
            onClick={() => toggleItem(item.id)}
            className="accordion-header"
          >
            <span>{item.title}</span>
            <div className="progress-bar">
              <div className={`progress-bar-fill-gaming ${getPercentageWidth((item.achievements.unlocked / item.achievements.total) * 100)}`}>
              </div>
            </div>
          </button>
          <div
            id={`accordion-content-${item.id}`}
            aria-labelledby={`accordion-header-${item.id}`}
            hidden={!openItems.has(item.id)}
            className="accordion-content"
            role="region"
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}

// Accessible progress bar component
interface AccessibleProgressProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  className?: string
}

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  className = ''
}) => {
  const percentage = Math.round((value / max) * 100)
  const progressId = `progress-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`progress ${className}`}>
      {label && (
        <label htmlFor={progressId} className="progress-label">
          {label}
        </label>
      )}
      <div
        id={progressId}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="progress-bar"
      >
        <div
          className={`progress-bar-fill-gaming ${getPercentageWidth(percentage)}`}
        >
        </div>
        {showValue && (
          <span className="progress-label">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  )
}

// Accessible tooltip component
interface AccessibleTooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const AccessibleTooltip: React.FC<AccessibleTooltipProps> = ({
  content,
  children,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="tooltip-container">
      {React.cloneElement(children as React.ReactElement, {
        'aria-describedby': isVisible ? tooltipId : undefined,
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
        onFocus: () => setIsVisible(true),
        onBlur: () => setIsVisible(false)
      })}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`tooltip tooltip-${position}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}

// Accessibility testing utilities
export const runAccessibilityTests = () => {
  const tests = {
    checkColorContrast: () => {
      // Check color contrast ratios
      const elements = document.querySelectorAll('*')
      const issues: string[] = []
      
      elements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        // Simple contrast check (would need proper implementation)
        if (color === backgroundColor) {
          issues.push(`Element has same color and background: ${element.tagName}`)
        }
      })
      
      return issues
    },
    
    checkFocusableElements: () => {
      // Check focusable elements have proper focus indicators
      const focusableElements = document.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      )
      const issues: string[] = []
      
      focusableElements.forEach(element => {
        const styles = window.getComputedStyle(element, ':focus')
        if (!styles.outline || styles.outline === 'none') {
          issues.push(`Focusable element lacks focus indicator: ${element.tagName}`)
        }
      })
      
      return issues
    },
    
    checkAltText: () => {
      // Check images have alt text
      const images = document.querySelectorAll('img')
      const issues: string[] = []
      
      images.forEach(img => {
        if (!img.alt && !img.getAttribute('role')) {
          issues.push(`Image missing alt text: ${img.src}`)
        }
      })
      
      return issues
    },
    
    checkAriaLabels: () => {
      // Check elements have proper ARIA labels
      const buttons = document.querySelectorAll('button')
      const inputs = document.querySelectorAll('input')
      const issues: string[] = []
      
      buttons.forEach(button => {
        if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
          issues.push('Button missing accessible name')
        }
      })
      
      inputs.forEach(input => {
        if (!input.getAttribute('aria-label') && !document.querySelector(`label[for="${input.id}"]`)) {
          issues.push(`Input missing label: ${input.type}`)
        }
      })
      
      return issues
    },
    
    checkHeadings: () => {
      // Check heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const issues: string[] = []
      let lastLevel = 0
      
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.substring(1))
        if (level > lastLevel + 1) {
          issues.push(`Heading level skipped from h${lastLevel} to h${level}`)
        }
        lastLevel = level
      })
      
      return issues
    }
  }

  return {
    colorContrast: tests.checkColorContrast(),
    focusableElements: tests.checkFocusableElements(),
    altText: tests.checkAltText(),
    ariaLabels: tests.checkAriaLabels(),
    headings: tests.checkHeadings()
  }
}

export default {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReader,
  useAria,
  SkipLinks,
  FocusTrap,
  AccessibleButton,
  AccessibleInput,
  AccessibleModal,
  AccessibleTabs,
  AccessibleAccordion,
  AccessibleProgress,
  AccessibleTooltip,
  runAccessibilityTests
}

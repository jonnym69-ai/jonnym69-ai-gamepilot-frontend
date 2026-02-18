// Accessibility Hooks for React Components - WCAG 2.1 AA Compliance
import { useEffect, useRef, useState, useCallback } from 'react'

// Focus Management Hook
export const useFocusManagement = (initialFocusRef?: React.RefObject<HTMLElement>) => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const containerRef = useRef<HTMLElement>(null)

  const setFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus()
      setFocusedElement(element)
    }
  }, [])

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    
    // Set initial focus
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus()
    } else {
      firstElement.focus()
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [initialFocusRef])

  const restoreFocus = useCallback(() => {
    if (focusedElement) {
      focusedElement.focus()
    }
  }, [focusedElement])

  return {
    containerRef,
    setFocus,
    trapFocus,
    restoreFocus,
    focusedElement
  }
}

// Keyboard Navigation Hook
export const useKeyboardNavigation = (
  items: Array<{ id: string; element?: HTMLElement }>,
  onSelect?: (id: string) => void
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(() => {
          const next = selectedIndex + 1
          return next >= items.length ? 0 : next
        })
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(() => {
          const prev = selectedIndex - 1
          return prev < 0 ? items.length - 1 : prev
        })
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (selectedIndex >= 0 && onSelect) {
          onSelect(items[selectedIndex].id)
        }
        break
      case 'Escape':
        event.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }, [isOpen, items, selectedIndex, onSelect])

  useEffect(() => {
    if (selectedIndex >= 0 && items[selectedIndex]?.element) {
      items[selectedIndex].element?.focus()
    }
  }, [selectedIndex, items])

  const open = useCallback(() => {
    setIsOpen(true)
    setSelectedIndex(0)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setSelectedIndex(-1)
  }, [])

  return {
    selectedIndex,
    isOpen,
    handleKeyDown,
    open,
    close
  }
}

// Screen Reader Announcements Hook
export const useScreenReaderAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<string[]>([])
  const announcementRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message])
    
    // Clear announcement after it's read
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1))
    }, 1000)
  }, [])

  const announcePolite = useCallback((message: string) => {
    announce(message)
  }, [announce])

  const announceAssertive = useCallback((message: string) => {
    announce(message)
  }, [announce])

  return {
    announcementRef,
    announcements,
    announce,
    announcePolite,
    announceAssertive
  }
}

// Skip Links Hook
export const useSkipLinks = () => {
  const [skipLinks, setSkipLinks] = useState<Array<{
    id: string
    label: string
    target: string
  }>>([])

  const addSkipLink = useCallback((id: string, label: string, target: string) => {
    setSkipLinks(prev => [...prev, { id, label, target }])
  }, [])

  const removeSkipLink = useCallback((id: string) => {
    setSkipLinks(prev => prev.filter(link => link.id !== id))
  }, [])

  return {
    skipLinks,
    addSkipLink,
    removeSkipLink
  }
}

// ARIA Attributes Hook
export const useAriaAttributes = () => {
  const [ariaAttributes, setAriaAttributes] = useState<Record<string, string>>({})

  const setAriaAttribute = useCallback((attribute: string, value: string) => {
    setAriaAttributes(prev => ({ ...prev, [attribute]: value }))
  }, [])

  const removeAriaAttribute = useCallback((attribute: string) => {
    setAriaAttributes(prev => {
      const newAttrs = { ...prev }
      delete newAttrs[attribute]
      return newAttrs
    })
  }, [])

  const getAriaAttributes = useCallback((baseAttrs: Record<string, string> = {}) => {
    return { ...baseAttrs, ...ariaAttributes }
  }, [ariaAttributes])

  return {
    ariaAttributes,
    setAriaAttribute,
    removeAriaAttribute,
    getAriaAttributes
  }
}

// Color Contrast Hook
export const useColorContrast = () => {
  const [contrastRatio, setContrastRatio] = useState<number>(0)
  const [contrastLevel, setContrastLevel] = useState<'AA' | 'AAA' | 'fail'>('fail')

  const calculateContrast = useCallback((color1: string, color2: string) => {
    // Simple contrast calculation (in real implementation, use a proper library)
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255

      // Calculate relative luminance
      const sRGB = [r, g, b].map(val => {
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05)

    setContrastRatio(ratio)

    // Determine WCAG compliance
    if (ratio >= 7) {
      setContrastLevel('AAA')
    } else if (ratio >= 4.5) {
      setContrastLevel('AA')
    } else {
      setContrastLevel('fail')
    }

    return ratio
  }, [])

  return {
    contrastRatio,
    contrastLevel,
    calculateContrast
  }
}

// Reduced Motion Hook
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// High Contrast Hook
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersHighContrast
}

// Touch Detection Hook
export const useTouchDetection = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(hasTouch)
  }, [])

  return isTouchDevice
}

// Focus Visible Hook
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false)
  const [isKeyboardFocus, setIsKeyboardFocus] = useState(false)

  useEffect(() => {
    const handleMouseDown = () => {
      setIsKeyboardFocus(false)
      setIsFocusVisible(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardFocus(true)
        setIsFocusVisible(true)
      }
    }

    const handleFocus = () => {
      if (isKeyboardFocus) {
        setIsFocusVisible(true)
      }
    }

    const handleBlur = () => {
      setIsFocusVisible(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focus', handleFocus, true)
    document.addEventListener('blur', handleBlur, true)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focus', handleFocus, true)
      document.removeEventListener('blur', handleBlur, true)
    }
  }, [isKeyboardFocus])

  return isFocusVisible
}

// Accessible Form Hook
export const useAccessibleForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const setTouchedField = useCallback((field: string) => {
    setTouched(prev => new Set(prev).add(field))
  }, [])

  const validateField = useCallback((field: string, value: string, rules: Array<(value: string) => string | null>) => {
    for (const rule of rules) {
      const error = rule(value)
      if (error) {
        setError(field, error)
        return false
      }
    }
    clearError(field)
    return true
  }, [setError, clearError])

  const hasError = useCallback((field: string) => {
    return touched.has(field) && !!errors[field]
  }, [touched, errors])

  const getErrorMessage = useCallback((field: string) => {
    return hasError(field) ? errors[field] : ''
  }, [hasError, errors])

  return {
    errors,
    touched,
    setError,
    clearError,
    setTouchedField,
    validateField,
    hasError,
    getErrorMessage
  }
}

// Accessible Modal Hook
export const useAccessibleModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { trapFocus, restoreFocus } = useFocusManagement()
  const { announcePolite } = useScreenReaderAnnouncements()

  const open = useCallback(() => {
    setIsOpen(true)
    announcePolite('Modal opened')
  }, [announcePolite])

  const close = useCallback(() => {
    setIsOpen(false)
    restoreFocus()
    announcePolite('Modal closed')
  }, [restoreFocus, announcePolite])

  useEffect(() => {
    if (isOpen) {
      const cleanup = trapFocus(document.body)
      return cleanup
    }
  }, [isOpen, trapFocus])

  return {
    isOpen,
    open,
    close
  }
}

// Accessible Tabs Hook
export const useAccessibleTabs = (tabs: Array<{ id: string; label: string }>) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')
  const { announcePolite } = useScreenReaderAnnouncements()

  const selectTab = useCallback((tabId: string) => {
    setActiveTab(tabId)
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      announcePolite(`Tab ${tab.label} selected`)
    }
  }, [tabs, announcePolite])

  return {
    activeTab,
    selectTab,
    tabs
  }
}

// Accessible Accordion Hook
export const useAccessibleAccordion = (items: Array<{ id: string; label: string }>) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const { announcePolite } = useScreenReaderAnnouncements()

  const toggleItem = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
        announcePolite(`Section ${item.label} collapsed`)
      } else {
        newSet.add(itemId)
        announcePolite(`Section ${item.label} expanded`)
      }
      return newSet
    })
  }, [items, announcePolite])

  const isItemOpen = useCallback((itemId: string) => {
    return openItems.has(itemId)
  }, [openItems])

  return {
    openItems,
    toggleItem,
    isItemOpen
  }
}

// Accessibility Testing Hook
export const useAccessibilityTesting = () => {
  const [isTestingMode, setIsTestingMode] = useState(false)

  const enableTestingMode = useCallback(() => {
    setIsTestingMode(true)
    document.body.classList.add('a11y-test-outline')
  }, [])

  const disableTestingMode = useCallback(() => {
    setIsTestingMode(false)
    document.body.classList.remove('a11y-test-outline')
  }, [])

  const testContrast = useCallback(() => {
    document.body.classList.add('a11y-test-contrast')
    setTimeout(() => {
      document.body.classList.remove('a11y-test-contrast')
    }, 3000)
  }, [])

  const testReducedMotion = useCallback(() => {
    document.body.classList.add('a11y-test-reduced-motion')
    setTimeout(() => {
      document.body.classList.remove('a11y-test-reduced-motion')
    }, 3000)
  }, [])

  return {
    isTestingMode,
    enableTestingMode,
    disableTestingMode,
    testContrast,
    testReducedMotion
  }
}

export default {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReaderAnnouncements,
  useSkipLinks,
  useAriaAttributes,
  useColorContrast,
  useReducedMotion,
  useHighContrast,
  useTouchDetection,
  useFocusVisible,
  useAccessibleForm,
  useAccessibleModal,
  useAccessibleTabs,
  useAccessibleAccordion,
  useAccessibilityTesting
}

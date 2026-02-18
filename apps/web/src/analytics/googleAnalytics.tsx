import { useEffect } from 'react'

// Google Analytics 4 Configuration
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const GA4_MEASUREMENT_ID = process.env.VITE_GA4_MEASUREMENT_ID || 'GA-MEASUREMENT-ID'

// Initialize Google Analytics 4
export const initializeGA4 = () => {
  if (typeof window === 'undefined' || !GA4_MEASUREMENT_ID) {
    console.warn('📊 Google Analytics 4 not initialized - missing measurement ID')
    return
  }

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  
  // Configure gtag
  window.gtag('js', new Date())
  window.gtag('config', GA4_MEASUREMENT_ID, {
    debug_mode: process.env.NODE_ENV === 'development',
    send_page_view: false // We'll handle page views manually
  })

  console.log('📊 Google Analytics 4 initialized')
}

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag || !GA4_MEASUREMENT_ID) return

  window.gtag('pageview', path, {
    page_title: title || document.title
  })
}

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag || !GA4_MEASUREMENT_ID) return

  window.gtag('event', eventName, parameters)
}

// Track user interactions
export const trackUserInteraction = (_action: string, category: string, label?: string, value?: number) => {
  trackEvent('user_interaction', {
    event_category: category,
    event_label: label,
    value: value
  })
}

// Track Steam import events
export const trackSteamImport = (action: 'start' | 'success' | 'error', gameCount?: number, errorType?: string) => {
  trackEvent('steam_import', {
    event_category: 'steam',
    event_label: action,
    value: gameCount,
    custom_parameters: {
      error_type: errorType
    }
  })
}

// Track mood recommendations
export const trackMoodRecommendation = (mood: string, gameCount: number, recommendationType: string) => {
  trackEvent('mood_recommendation', {
    event_category: 'recommendations',
    event_label: mood,
    value: gameCount,
    custom_parameters: {
      recommendation_type: recommendationType
    }
  })
}

// Track game interactions
export const trackGameInteraction = (action: string, gameTitle: string, category?: string) => {
  trackEvent('game_interaction', {
    event_category: category || 'games',
    event_label: action,
    custom_parameters: {
      game_title: gameTitle
    }
  })
}

// Track beta feedback
export const trackBetaFeedback = (feedbackType: string, category: string) => {
  trackEvent('beta_feedback', {
    event_category: 'beta',
    event_label: feedbackType,
    custom_parameters: {
      feedback_category: category
    }
  })
}

// Track onboarding steps
export const trackOnboardingStep = (step: number, stepName: string, completed: boolean) => {
  trackEvent('onboarding', {
    event_category: 'user_journey',
    event_label: stepName,
    value: step,
    custom_parameters: {
      completed: completed
    }
  })
}

// Track performance metrics
export const trackPerformance = (metricName: string, value: number, unit: string) => {
  trackEvent('performance', {
    event_category: 'technical',
    event_label: metricName,
    value: value,
    custom_parameters: {
      unit: unit
    }
  })
}

// Track errors
export const trackError = (errorName: string, errorMessage: string, context?: string) => {
  trackEvent('error', {
    event_category: 'technical',
    event_label: errorName,
    custom_parameters: {
      error_message: errorMessage,
      context: context
    }
  })
}

// Custom hook for analytics
export const useAnalytics = () => {
  useEffect(() => {
    initializeGA4()
  }, [])

  return {
    trackPageView,
    trackEvent,
    trackUserInteraction,
    trackSteamImport,
    trackMoodRecommendation,
    trackGameInteraction,
    trackBetaFeedback,
    trackOnboardingStep,
    trackPerformance,
    trackError
  }
}

// Analytics Provider Component
import { createContext, useContext, ReactNode } from 'react'

interface AnalyticsContextType {
  trackPageView: (path: string, title?: string) => void
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void
  trackUserInteraction: (action: string, category: string, label?: string, value?: number) => void
  trackSteamImport: (action: 'start' | 'success' | 'error', gameCount?: number, errorType?: string) => void
  trackMoodRecommendation: (mood: string, gameCount: number, recommendationType: string) => void
  trackGameInteraction: (action: string, gameTitle: string, category?: string) => void
  trackBetaFeedback: (feedbackType: string, category: string) => void
  trackOnboardingStep: (step: number, stepName: string, completed: boolean) => void
  trackPerformance: (metricName: string, value: number, unit: string) => void
  trackError: (errorName: string, errorMessage: string, context?: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const analytics = useAnalytics()

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider')
  }
  return context
}

// Enhanced page tracking hook
export const usePageTracking = (path: string, title?: string) => {
  const { trackPageView } = useAnalyticsContext()

  useEffect(() => {
    trackPageView(path, title)
  }, [path, title, trackPageView])
}

// Performance monitoring hook
export const usePerformanceTracking = () => {
  const { trackPerformance, trackError } = useAnalyticsContext()

  useEffect(() => {
    // Track page load time
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          const loadTime = navEntry.loadEventEnd - navEntry.fetchStart
          trackPerformance('page_load_time', Math.round(loadTime), 'milliseconds')
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })

    return () => observer.disconnect()
  }, [trackPerformance, trackError])

  // Track vitals
  useEffect(() => {
    const vitalsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcpEntry = entry as PerformancePaintTiming
          trackPerformance('largest_contentful_paint', Math.round(lcpEntry.startTime), 'milliseconds')
        }
        if (entry.entryType === 'first-contentful-paint') {
          const fcpEntry = entry as PerformancePaintTiming
          trackPerformance('first_contentful_paint', Math.round(fcpEntry.startTime), 'milliseconds')
        }
      }
    })

    vitalsObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-contentful-paint'] })

    return () => vitalsObserver.disconnect()
  }, [trackPerformance])
}

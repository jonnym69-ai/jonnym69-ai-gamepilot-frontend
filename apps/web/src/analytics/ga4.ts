// Google Analytics 4 Configuration
// Analytics package integration - install ga-gtag when analytics tracking is needed
// Command: npm install ga-gtag
// import { gtag } from 'ga-gtag'

// Window type declarations for gtag
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

// Google Analytics 4 Configuration for GamePilot Production
export interface GA4Config {
  measurementId: string
  trackingEnabled: boolean
  debugMode: boolean
  anonymizeIp: boolean
  cookieDomain: string
  cookieFlags: string
  sendPageView: boolean
  sampleRate: number
  siteSpeedSampleRate: number
  allowAdFeatures: boolean
  allowAdPersonalizationSignals: boolean
  allowGoogleSignals: boolean
  cookieUpdate: boolean
  cookieExpires: number
}

export const ga4Config: GA4Config = {
  measurementId: process.env.REACT_APP_GA4_MEASUREMENT_ID || 'G-XXXXXXXXX',
  trackingEnabled: process.env.NODE_ENV === 'production',
  debugMode: process.env.NODE_ENV === 'development',
  anonymizeIp: true,
  cookieDomain: 'auto',
  cookieFlags: 'SameSite=Lax;Secure',
  sendPageView: true,
  sampleRate: 100,
  siteSpeedSampleRate: 1,
  allowAdFeatures: false,
  allowAdPersonalizationSignals: false,
  allowGoogleSignals: false,
  cookieUpdate: true,
  cookieExpires: 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
}

// Initialize Google Analytics 4
export const initializeGA4 = (): void => {
  if (!ga4Config.trackingEnabled || !ga4Config.measurementId) {
    return
  }

  // Load gtag script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Config.measurementId}`
  document.head.appendChild(script)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() {
    (window.dataLayer as any[]).push(arguments)
  }

  // Configure gtag
  // gtag('js', new Date())
  // gtag('config', ga4Config.measurementId, {
  //   debug_mode: ga4Config.debugMode,
  //   anonymize_ip: ga4Config.anonymizeIp,
  //   cookie_domain: ga4Config.cookieDomain,
  //   cookie_flags: ga4Config.cookieFlags,
  //   send_page_view: ga4Config.sendPageView,
  //   sample_rate: ga4Config.sampleRate,
  //   site_speed_sample_rate: ga4Config.siteSpeedSampleRate,
  //   allow_ad_features: ga4Config.allowAdFeatures,
  //   allow_ad_personalization_signals: ga4Config.allowAdPersonalizationSignals,
  //   allow_google_signals: ga4Config.allowGoogleSignals,
  //   cookie_update: ga4Config.cookieUpdate,
  //   cookie_expires: ga4Config.cookieExpires
  // })
}

// Custom Google Analytics 4 tracking utilities
export class GA4Tracker {
  private static isInitialized = false

  // Initialize tracker
  static initialize(): void {
    if (this.isInitialized) {
      return
    }

    initializeGA4()
    this.isInitialized = true
  }

  // Track page view
  static trackPageView(_pagePath?: string, _pageTitle?: string): void {
    if (!this.isInitialized) {
      return
    }

    // gtag('event', 'page_view', {
    //   page_location: window.location.href,
    //   page_path: _pagePath || window.location.pathname,
    //   page_title: _pageTitle || document.title,
    //   send_to: ga4Config.measurementId
    // })
  }

  // Track custom event
  static trackEvent(_eventName: string, _parameters?: Record<string, any>): void {
    if (!this.isInitialized) {
      return
    }

    // gtag('event', eventName, {
    //   send_to: ga4Config.measurementId,
    //   ...parameters
    // })
  }

  // Track user engagement
  static trackUserEngagement(action: string, category: string, label?: string, value?: number): void {
    this.trackEvent('user_engagement', {
      event_category: category,
      event_action: action,
      event_label: label,
      value: value,
      engagement_time_msec: Date.now()
    })
  }

  // Track authentication events
  static trackAuth(action: 'login' | 'signup' | 'logout', method?: string, userId?: string): void {
    this.trackEvent(action, {
      event_category: 'authentication',
      event_action: action,
      event_label: method,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
  }

  // Track game library events
  static trackGameLibrary(action: 'add' | 'remove' | 'edit' | 'play' | 'complete', gameId?: string, gameTitle?: string): void {
    this.trackEvent('game_library', {
      event_category: 'game_library',
      event_action: action,
      event_label: gameTitle,
      game_id: gameId,
      timestamp: new Date().toISOString()
    })
  }

  // Track mood engine events
  static trackMoodEngine(action: 'analyze' | 'recommend' | 'select', mood?: string, count?: number): void {
    this.trackEvent('mood_engine', {
      event_category: 'mood_engine',
      event_action: action,
      event_label: mood,
      recommendation_count: count,
      timestamp: new Date().toISOString()
    })
  }

  // Track search events
  static trackSearch(query: string, results: number, category?: string): void {
    this.trackEvent('search', {
      event_category: 'search',
      event_action: 'perform_search',
      event_label: category,
      search_term: query,
      search_results: results,
      timestamp: new Date().toISOString()
    })
  }

  // Track integration events
  static trackIntegration(platform: string, action: 'connect' | 'disconnect' | 'sync', success?: boolean): void {
    this.trackEvent('integration', {
      event_category: 'integration',
      event_action: action,
      event_label: platform,
      success: success,
      timestamp: new Date().toISOString()
    })
  }

  // Track file upload events
  static trackFileUpload(fileName: string, fileSize: number, fileType: string, success?: boolean): void {
    this.trackEvent('file_upload', {
      event_category: 'file_upload',
      event_action: success ? 'upload_success' : 'upload_failure',
      event_label: fileName,
      file_size: fileSize,
      file_type: fileType,
      timestamp: new Date().toISOString()
    })
  }

  // Track WebSocket events
  static trackWebSocket(action: 'connect' | 'disconnect' | 'message' | 'error', userId?: string): void {
    this.trackEvent('websocket', {
      event_category: 'websocket',
      event_action: action,
      event_label: userId,
      timestamp: new Date().toISOString()
    })
  }

  // Track performance metrics
  static trackPerformance(metric: string, value: number, unit?: string): void {
    this.trackEvent('performance', {
      event_category: 'performance',
      event_action: metric,
      event_label: unit,
      value: value,
      timestamp: new Date().toISOString()
    })
  }

  // Track error events
  static trackError(error: Error, context?: string, userId?: string): void {
    this.trackEvent('error', {
      event_category: 'error',
      event_action: 'javascript_error',
      event_label: context,
      error_message: error.message,
      error_stack: error.stack,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
  }

  // Track user feedback
  static trackFeedback(rating: number, feedback?: string, userId?: string): void {
    this.trackEvent('user_feedback', {
      event_category: 'feedback',
      event_action: 'submit_feedback',
      event_label: rating.toString(),
      feedback_text: feedback,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
  }

  // Track feature usage
  static trackFeatureUsage(feature: string, action: string, userId?: string): void {
    this.trackEvent('feature_usage', {
      event_category: 'feature',
      event_action: action,
      event_label: feature,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
  }

  // Track A/B test events
  static trackABTest(testName: string, variation: string, userId?: string): void {
    this.trackEvent('ab_test', {
      event_category: 'ab_test',
      event_action: 'view',
      event_label: testName,
      variation: variation,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
  }

  // Track social sharing events
  static trackSocialShare(platform: string, content: string, userId?: string): void {
    this.trackEvent('social_share', {
      event_category: 'social',
      event_action: 'share',
      event_label: platform,
      content_type: content,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
  }

  // Track purchase events (for future monetization)
  static trackPurchase(transactionId: string, value: number, currency: string, items: any[], userId?: string): void {
    this.trackEvent('purchase', {
      event_category: 'ecommerce',
      event_action: 'purchase',
      event_label: transactionId,
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
  }

  // Track custom conversion events
  static trackConversion(conversionName: string, value?: number, currency?: string): void {
    this.trackEvent('conversion', {
      event_category: 'conversion',
      event_action: conversionName,
      event_label: 'conversion',
      value: value,
      currency: currency,
      timestamp: new Date().toISOString()
    })
  }

  // Track user properties
  static setUserProperty(_property: string, _value: string): void {
    if (!this.isInitialized) {
      return
    }

    // gtag('config', ga4Config.measurementId, {
    //   [_property]: _value
    // })
  }

  // Set user ID
  static setUserId(_userId: string): void {
    if (!this.isInitialized) {
      return
    }

    // gtag('config', ga4Config.measurementId, {
    //   user_id: _userId
    // })
  }

  // Track session metrics
  static trackSessionMetrics(sessionDuration: number, pageViews: number): void {
    this.trackEvent('session_metrics', {
      event_category: 'session',
      event_action: 'session_end',
      session_duration: sessionDuration,
      page_views: pageViews,
      timestamp: new Date().toISOString()
    })
  }

  // Track scroll depth
  static trackScrollDepth(depth: number, pagePath?: string): void {
    this.trackEvent('scroll_depth', {
      event_category: 'engagement',
      event_action: 'scroll',
      event_label: pagePath || window.location.pathname,
      scroll_percentage: depth,
      timestamp: new Date().toISOString()
    })
  }

  // Track form interactions
  static trackFormInteraction(formName: string, action: 'start' | 'complete' | 'abandon', step?: number): void {
    this.trackEvent('form_interaction', {
      event_category: 'form',
      event_action: action,
      event_label: formName,
      form_step: step,
      timestamp: new Date().toISOString()
    })
  }

  // Track content engagement
  static trackContentEngagement(contentType: string, contentId: string, duration: number): void {
    this.trackEvent('content_engagement', {
      event_category: 'engagement',
      event_action: 'content_view',
      event_label: contentType,
      content_id: contentId,
      engagement_duration: duration,
      timestamp: new Date().toISOString()
    })
  }

  // Track outbound links
  static trackOutboundLink(url: string, linkText?: string): void {
    this.trackEvent('outbound_link', {
      event_category: 'outbound',
      event_action: 'click',
      event_label: url,
      link_text: linkText,
      timestamp: new Date().toISOString()
    })
  }

  // Track download events
  static trackDownload(fileName: string, fileType: string, fileSize?: number): void {
    this.trackEvent('download', {
      event_category: 'download',
      event_action: 'click',
      event_label: fileName,
      file_type: fileType,
      file_size: fileSize,
      timestamp: new Date().toISOString()
    })
  }

  // Track video events
  static trackVideoEvent(videoTitle: string, action: 'play' | 'pause' | 'complete' | 'progress', progress?: number): void {
    this.trackEvent('video', {
      event_category: 'video',
      event_action: action,
      event_label: videoTitle,
      video_progress: progress,
      timestamp: new Date().toISOString()
    })
  }

  // Track custom dimensions
  static trackCustomDimension(_dimension: string, _value: string): void {
    if (!this.isInitialized) {
      return
    }

    // gtag('config', ga4Config.measurementId, {
    //   [_dimension]: _value
    // })
  }

  // Track custom metrics
  static trackCustomMetric(_metric: string, _value: number): void {
    if (!this.isInitialized) {
      return
    }

    // gtag('config', ga4Config.measurementId, {
    //   [_metric]: _value
    // })
  }

  // Disable tracking
  static disableTracking(): void {
    if (!this.isInitialized) {
      return
    }

    ;(window as any)['ga-disable-' + ga4Config.measurementId] = true
  }

  // Enable tracking
  static enableTracking(): void {
    if (!this.isInitialized) {
      return
    }

    ;(window as any)['ga-disable-' + ga4Config.measurementId] = false
  }

  // Check if tracking is enabled
  static isTrackingEnabled(): boolean {
    return this.isInitialized && !(window as any)['ga-disable-' + ga4Config.measurementId]
  }

  // Get current configuration
  static getConfig(): GA4Config {
    return { ...ga4Config }
  }

  // Update configuration
  static updateConfig(config: Partial<GA4Config>): void {
    Object.assign(ga4Config, config)
  }
}

// Export default for easy import
export default GA4Tracker

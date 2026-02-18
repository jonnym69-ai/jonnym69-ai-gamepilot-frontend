export interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: number
  userId?: string
  sessionId?: string
  properties?: Record<string, any>
  context?: AnalyticsContext
}

export interface AnalyticsContext {
  userAgent?: string
  ip?: string
  url?: string
  referrer?: string
  screenResolution?: string
  viewportSize?: string
  language?: string
  timezone?: string
  platform?: string
  version?: string
  environment?: string
}

// Browser API type declarations
declare const window: {
  navigator: {
    userAgent: string
    language: string
    platform: string
  }
  location: {
    href: string
  }
  screen: {
    width: number
    height: number
  }
  innerWidth: number
  innerHeight: number
} & typeof globalThis

declare const document: {
  referrer: string
}

export interface AnalyticsContext {
  userAgent?: string
  ip?: string
  url?: string
  referrer?: string
  screenResolution?: string
  viewportSize?: string
  language?: string
  timezone?: string
  platform?: string
  version?: string
  environment?: string
}

export interface PageView {
  path: string
  title: string
  timestamp: number
  userId?: string
  sessionId?: string
  referrer?: string
  properties?: Record<string, any>
  context?: AnalyticsContext
}

export interface UserSession {
  id: string
  userId?: string
  startTime: number
  endTime?: number
  duration?: number
  pageViews: number
  events: AnalyticsEvent[]
  properties?: Record<string, any>
  context?: AnalyticsContext
}

export interface AnalyticsStats {
  totalEvents: number
  totalPageViews: number
  totalSessions: number
  averageSessionDuration: number
  bounceRate: number
  uniqueUsers: number
  topPages: Array<{
    path: string
    views: number
    avgDuration: number
  }>
  topEvents: Array<{
    event: string
    count: number
    category: string
    action: string
  }>
  userRetention: Array<{
    period: string
    retentionRate: number
    users: number
  }>
}

export class AnalyticsEngine {
  private events: AnalyticsEvent[] = []
  private pageViews: PageView[] = []
  private sessions: Map<string, UserSession> = new Map()
  private stats: AnalyticsStats = {
    totalEvents: 0,
    totalPageViews: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    uniqueUsers: 0,
    topPages: [],
    topEvents: [],
    userRetention: []
  }
  private maxEvents: number = 10000
  private maxSessions: number = 1000

  constructor() {
    this.setupSessionTracking()
  }

  /**
   * Setup session tracking
   */
  private setupSessionTracking(): void {
    // Clean up old sessions periodically
    setInterval(() => {
      this.cleanupOldSessions()
    }, 60000) // Every minute
  }

  /**
   * Track an event
   */
  track(event: string, category: string, action: string, options?: {
    label?: string
    value?: number
    properties?: Record<string, any>
    userId?: string
    sessionId?: string
  }): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label: options?.label,
      value: options?.value,
      timestamp: Date.now(),
      userId: options?.userId,
      sessionId: options?.sessionId,
      properties: options?.properties,
      context: this.getContext()
    }

    this.events.push(analyticsEvent)
    this.stats.totalEvents++

    // Add to session
    if (analyticsEvent.sessionId) {
      const session = this.sessions.get(analyticsEvent.sessionId)
      if (session) {
        session.events.push(analyticsEvent)
      }
    }

    // Clean up old events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Update top events
    this.updateTopEvents()
  }

  /**
   * Track page view
   */
  pageView(path: string, title: string, options?: {
    userId?: string
    sessionId?: string
    referrer?: string
    properties?: Record<string, any>
  }): void {
    const pageViewData: PageView = {
      path,
      title,
      timestamp: Date.now(),
      userId: options?.userId,
      sessionId: options?.sessionId,
      referrer: options?.referrer,
      properties: options?.properties,
      context: this.getContext()
    }

    this.pageViews.push(pageViewData)
    this.stats.totalPageViews++

    // Add to session
    if (pageViewData.sessionId) {
      const session = this.sessions.get(pageViewData.sessionId)
      if (session) {
        session.pageViews++
      }
    }

    // Clean up old page views
    if (this.pageViews.length > this.maxEvents) {
      this.pageViews = this.pageViews.slice(-this.maxEvents)
    }

    // Update top pages
    this.updateTopPages()
  }

  /**
   * Start a session
   */
  startSession(sessionId: string, options?: {
    userId?: string
    properties?: Record<string, any>
  }): void {
    const session: UserSession = {
      id: sessionId,
      userId: options?.userId,
      startTime: Date.now(),
      pageViews: 0,
      events: [],
      properties: options?.properties,
      context: this.getContext()
    }

    this.sessions.set(sessionId, session)
    this.stats.totalSessions++

    // Clean up old sessions
    if (this.sessions.size > this.maxSessions) {
      this.cleanupOldSessions()
    }
  }

  /**
   * End a session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.endTime = Date.now()
      session.duration = session.endTime - session.startTime
    }

    this.updateStats()
  }

  /**
   * Get current context
   */
  private getContext(): AnalyticsContext {
    return {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      ip: typeof window !== 'undefined' ? undefined : undefined, // Server-side only
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : undefined,
      viewportSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined,
      language: typeof window !== 'undefined' ? window.navigator.language : undefined,
      timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
      platform: typeof window !== 'undefined' ? window.navigator.platform : undefined,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  }

  /**
   * Update top pages
   */
  private updateTopPages(): void {
    const pageCounts = new Map<string, { views: number; totalDuration: number }>()
    
    this.pageViews.forEach(pageView => {
      const existing = pageCounts.get(pageView.path)
      if (existing) {
        existing.views++
      } else {
        pageCounts.set(pageView.path, { views: 1, totalDuration: 0 })
      }
    })

    this.stats.topPages = Array.from(pageCounts.entries())
      .map(([path, data]) => ({
        path,
        views: data.views,
        avgDuration: data.totalDuration / data.views
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }

  /**
   * Update top events
   */
  private updateTopEvents(): void {
    const eventCounts = new Map<string, { count: number; category: string; action: string }>()
    
    this.events.forEach(event => {
      const key = `${event.category}:${event.action}`
      const existing = eventCounts.get(key)
      if (existing) {
        existing.count++
      } else {
        eventCounts.set(key, { count: 1, category: event.category, action: event.action })
      }
    })

    this.stats.topEvents = Array.from(eventCounts.entries())
      .map(([key, data]) => ({
        event: key,
        count: data.count,
        category: data.category,
        action: data.action
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const sessions = Array.from(this.sessions.values())
    
    // Calculate average session duration
    const completedSessions = sessions.filter(s => s.duration !== undefined)
    if (completedSessions.length > 0) {
      const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      this.stats.averageSessionDuration = totalDuration / completedSessions.length
    }

    // Calculate bounce rate (sessions with only one page view)
    const singlePageSessions = sessions.filter(s => s.pageViews === 1).length
    this.stats.bounceRate = sessions.length > 0 ? (singlePageSessions / sessions.length) * 100 : 0

    // Calculate unique users
    const uniqueUsers = new Set(sessions.map(s => s.userId).filter(Boolean))
    this.stats.uniqueUsers = uniqueUsers.size

    // Calculate user retention
    this.calculateUserRetention()
  }

  /**
   * Calculate user retention
   */
  private calculateUserRetention(): void {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    
    const periods = [
      { name: '1d', ms: dayMs },
      { name: '7d', ms: 7 * dayMs },
      { name: '30d', ms: 30 * dayMs }
    ]

    this.stats.userRetention = periods.map(period => {
      const cutoff = now - period.ms
      const recentSessions = Array.from(this.sessions.values()).filter(s => s.startTime >= cutoff)
      const returningUsers = new Set(recentSessions.map(s => s.userId).filter(Boolean))
      
      return {
        period: period.name,
        retentionRate: returningUsers.size / Math.max(1, this.stats.uniqueUsers) * 100,
        users: returningUsers.size
      }
    })
  }

  /**
   * Clean up old sessions
   */
  private cleanupOldSessions(): void {
    const now = Date.now()
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.startTime < now - maxAge) {
        this.sessions.delete(sessionId)
      }
    }
  }

  /**
   * Get analytics data
   */
  getData(): AnalyticsStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: string): AnalyticsEvent[] {
    return this.events.filter(event => event.category === category)
  }

  /**
   * Get events by action
   */
  getEventsByAction(action: string): AnalyticsEvent[] {
    return this.events.filter(event => event.action === action)
  }

  /**
   * Get user events
   */
  getUserEvents(userId: string): AnalyticsEvent[] {
    return this.events.filter(event => event.userId === userId)
  }

  /**
   * Get session events
   */
  getSessionEvents(sessionId: string): AnalyticsEvent[] {
    return this.events.filter(event => event.sessionId === sessionId)
  }

  /**
   * Get page views by path
   */
  getPageViewsByPath(path: string): PageView[] {
    return this.pageViews.filter(pageView => pageView.path === path)
  }

  /**
   * Get user sessions
   */
  getUserSessions(userId: string): UserSession[] {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId)
  }

  /**
   * Export analytics data
   */
  exportData(): {
    events: AnalyticsEvent[]
    pageViews: PageView[]
    sessions: Array<UserSession>
    stats: AnalyticsStats
    exportedAt: number
  } {
    return {
      events: this.events,
      pageViews: this.pageViews,
      sessions: Array.from(this.sessions.values()),
      stats: this.getData(),
      exportedAt: Date.now()
    }
  }

  /**
   * Import analytics data
   */
  importData(data: {
    events: AnalyticsEvent[]
    pageViews: PageView[]
    sessions: Array<UserSession>
  }): void {
    this.events = data.events
    this.pageViews = data.pageViews
    this.sessions = new Map(data.sessions.map(session => [session.id, session]))
    this.updateStats()
  }

  /**
   * Clear all data
   */
  clearData(): void {
    this.events = []
    this.pageViews = []
    this.sessions.clear()
    this.stats = {
      totalEvents: 0,
      totalPageViews: 0,
      totalSessions: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      uniqueUsers: 0,
      topPages: [],
      topEvents: [],
      userRetention: []
    }
  }

  /**
   * Generate analytics report
   */
  generateReport() {
    const data = this.getData()
    
    return {
      summary: {
        totalEvents: data.totalEvents,
        totalPageViews: data.totalPageViews,
        totalSessions: data.totalSessions,
        uniqueUsers: data.uniqueUsers,
        averageSessionDuration: Math.round(data.averageSessionDuration / 1000), // Convert to seconds
        bounceRate: Math.round(data.bounceRate)
      },
      topPages: data.topPages.map(page => ({
        ...page,
        avgDuration: Math.round(page.avgDuration / 1000) // Convert to seconds
      })),
      topEvents: data.topEvents,
      userRetention: data.userRetention,
      generatedAt: new Date().toISOString()
    }
  }
}

// Express middleware for analytics
export function analyticsMiddleware(analytics: AnalyticsEngine) {
  return (req: any, res: any, next: any) => {
    // Track page view
    if (req.method === 'GET') {
      analytics.pageView(req.path, req.path, {
        userId: req.user?.id,
        sessionId: req.session?.id,
        referrer: req.get('Referer')
      })
    }
    
    next()
  }
}

// Singleton instance
export const analytics = new AnalyticsEngine()

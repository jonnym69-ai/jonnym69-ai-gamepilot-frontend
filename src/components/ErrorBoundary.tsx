import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Production error logging - integrate with error tracking service
      // Future: Implement Sentry, LogRocket, or similar error tracking
      this.logErrorToService(error, errorInfo)
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      errorId: this.state.errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId()
    }
    
    console.log('Error details:', errorData)
    
    // Future: Send to error tracking service
    // Sentry.captureException(error, { extra: errorData })
  }

  private getUserId = () => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user).id : 'anonymous'
    } catch {
      return 'anonymous'
    }
  }

  private getSessionId = () => {
    let sessionId = sessionStorage.getItem('error_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('error_session_id', sessionId)
    }
    return sessionId
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
    // Note: Removed toast.info call to avoid React hook issues
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center p-4">
          <div className="glass-morphism rounded-xl p-8 max-w-md w-full border border-red-500/30">
            <div className="text-center">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
              <p className="text-gray-300 mb-6">
                {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full px-6 py-3 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors"
                >
                  🔄 Try Again
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 bg-gaming-secondary text-white rounded-lg hover:bg-gaming-secondary/80 transition-colors"
                >
                  🔄 Reload Page
                </button>
                
                <Link
                  to="/"
                  className="block w-full px-6 py-3 bg-gaming-accent text-white rounded-lg hover:bg-gaming-accent/80 transition-colors text-center"
                >
                  🏠 Go Home
                </Link>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="mt-6 text-left">
                  <summary className="text-red-400 cursor-pointer hover:text-red-300 transition-colors">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-4 bg-black/50 rounded-lg text-xs text-red-300 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Page-specific error boundaries
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center p-4">
        <div className="glass-morphism rounded-xl p-8 max-w-md w-full border border-red-500/30">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <h1 className="text-2xl font-bold text-white mb-4">Page Load Error</h1>
            <p className="text-gray-300 mb-6">
              This page couldn't be loaded properly. Please try refreshing or go back to the home page.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors"
              >
                🔄 Refresh Page
              </button>
              
              <Link
                to="/"
                className="block w-full px-6 py-3 bg-gaming-secondary text-white rounded-lg hover:bg-gaming-secondary/80 transition-colors text-center"
              >
                🏠 Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
)

// Component-specific error boundaries
export const ComponentErrorBoundary: React.FC<{ children: ReactNode; componentName?: string }> = ({ 
  children, 
  componentName = 'Component' 
}) => (
  <ErrorBoundary
    fallback={
      <div className="glass-morphism rounded-xl p-6 border border-red-500/30">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-white mb-2">{componentName} Error</h3>
          <p className="text-gray-300 text-sm mb-4">
            This component encountered an error and couldn't be displayed.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors text-sm"
          >
            🔄 Reload
          </button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
)

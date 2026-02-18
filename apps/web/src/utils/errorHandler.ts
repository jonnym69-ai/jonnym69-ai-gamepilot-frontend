import { toast } from '../components/Toast'

export interface ErrorContext {
  userMessage: string
  technicalMessage?: string
  action?: {
    label: string
    onClick: () => void
  }
  severity: 'low' | 'medium' | 'high'
}

export class UserFriendlyErrorHandler {
  private static getErrorMessage(error: Error, context?: string): ErrorContext {
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return {
        userMessage: 'Connection issue detected',
        technicalMessage: 'Unable to connect to the server',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        },
        severity: 'medium'
      }
    }

    // Authentication errors
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return {
        userMessage: 'Please sign in to continue',
        technicalMessage: 'Authentication required',
        action: {
          label: 'Sign In',
          onClick: () => {
            // Navigate to login page
            window.location.href = '/login'
          }
        },
        severity: 'high'
      }
    }

    // Permission errors
    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return {
        userMessage: 'You don\'t have permission to do this',
        technicalMessage: 'Access denied',
        severity: 'medium'
      }
    }

    // Not found errors
    if (error.message.includes('404') || error.message.includes('not found')) {
      return {
        userMessage: 'The requested content wasn\'t found',
        technicalMessage: 'Resource not found',
        severity: 'low'
      }
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('internal server')) {
      return {
        userMessage: 'Something went wrong on our end',
        technicalMessage: 'Server error occurred',
        action: {
          label: 'Try Again',
          onClick: () => window.location.reload()
        },
        severity: 'high'
      }
    }

    // Steam API errors
    if (error.message.includes('steam') || error.message.includes('api')) {
      return {
        userMessage: 'Steam services are temporarily unavailable',
        technicalMessage: 'Steam API error',
        action: {
          label: 'Try Later',
          onClick: () => {
            // Could implement retry logic here
            toast.info('Steam services will be available soon')
          }
        },
        severity: 'medium'
      }
    }

    // Game library errors
    if (context?.includes('library') || context?.includes('game')) {
      return {
        userMessage: 'Unable to load your game library',
        technicalMessage: 'Library operation failed',
        action: {
          label: 'Refresh Library',
          onClick: () => {
            // Trigger library refresh
            window.location.reload()
          }
        },
        severity: 'medium'
      }
    }

    // Generic error
    return {
      userMessage: 'An unexpected error occurred',
      technicalMessage: error.message,
      action: {
        label: 'Try Again',
        onClick: () => window.location.reload()
      },
      severity: 'medium'
    }
  }

  static handleError(error: Error, context?: string) {
    const errorContext = this.getErrorMessage(error, context)
    
    // Show appropriate toast based on severity
    switch (errorContext.severity) {
      case 'high':
        toast.error(errorContext.userMessage, errorContext.technicalMessage)
        break
      case 'medium':
        toast.warning(errorContext.userMessage, errorContext.technicalMessage)
        break
      case 'low':
        toast.info(errorContext.userMessage, errorContext.technicalMessage)
        break
    }

    // Log technical details for debugging
    console.group('🚨 User-Friendly Error Handler')
    console.error('Original Error:', error)
    console.info('Context:', context)
    console.info('User Message:', errorContext.userMessage)
    console.info('Technical Message:', errorContext.technicalMessage)
    console.info('Severity:', errorContext.severity)
    console.groupEnd()

    return errorContext
  }

  static handleAsyncError = async (
    asyncOperation: () => Promise<any>,
    context?: string,
    options?: {
      showToast?: boolean
      customHandler?: (error: Error) => void
    }
  ) => {
    try {
      return await asyncOperation()
    } catch (error) {
      const errorObj = error as Error
      
      if (options?.customHandler) {
        options.customHandler(errorObj)
      } else if (options?.showToast !== false) {
        this.handleError(errorObj, context)
      }
      
      throw errorObj
    }
  }

  static createRetryableOperation = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context?: string
  ): Promise<T> => {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          // Final attempt failed, show error
          this.handleError(lastError, `${context} (attempt ${attempt}/${maxRetries})`)
          throw lastError
        }
        
        // Show retry message
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        toast.warning(
          'Temporary issue detected',
          `Retrying in ${delay / 1000}s... (attempt ${attempt}/${maxRetries})`
        )
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }
}

// Convenience functions for common operations
export const handleGameLibraryError = (error: Error) => {
  UserFriendlyErrorHandler.handleError(error, 'game library')
}

export const handleSteamError = (error: Error) => {
  UserFriendlyErrorHandler.handleError(error, 'steam integration')
}

export const handleAuthError = (error: Error) => {
  UserFriendlyErrorHandler.handleError(error, 'authentication')
}

export const handleAsyncError = (
  error: Error,
  context?: string,
  options?: { showToast?: boolean; customHandler?: (error: Error) => void }
) => {
  UserFriendlyErrorHandler.handleError(error, context)
}

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    return UserFriendlyErrorHandler.handleError(error, context)
  }

  const handleAsyncError = async (
    asyncOperation: () => Promise<any>,
    context?: string,
    options?: { showToast?: boolean; customHandler?: (error: Error) => void }
  ) => {
    return UserFriendlyErrorHandler.handleAsyncError(asyncOperation, context, options)
  }

  const createRetryableOperation = async <T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    context?: string
  ) => {
    return UserFriendlyErrorHandler.createRetryableOperation(operation, maxRetries, context)
  }

  return {
    handleError,
    handleAsyncError,
    createRetryableOperation
  }
}

import { useState, useCallback, useRef } from 'react'

export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  onRetry?: (attempt: number, error: Error) => void
  shouldRetry?: (error: Error) => boolean
}

export interface RetryState {
  attempt: number
  isRetrying: boolean
  lastError?: Error
}

export const useRetry = <T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  options: RetryOptions = {}
) => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
    shouldRetry = (error: Error) => {
      // Retry on network errors and 5xx server errors
      return (
        error.name === 'NetworkError' ||
        error.name === 'TypeError' ||
        (error.message.includes('status') && parseInt(error.message.match(/\d+/)?.[0] || '0') >= 500)
      )
    }
  } = options

  const [retryState, setRetryState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false
  })

  const timeoutRef = useRef<NodeJS.Timeout>()

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = baseDelay * Math.pow(backoffFactor, attempt - 1)
    return Math.min(delay, maxDelay)
  }, [baseDelay, backoffFactor, maxDelay])

  const executeWithRetry = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        setRetryState({ attempt: 0, isRetrying: false })
        
        return await asyncFunction(...args)
      } catch (error) {
        const err = error as Error
        
        // Check if we should retry
        if (!shouldRetry(err) || retryState.attempt >= maxAttempts) {
          setRetryState(prev => ({
            ...prev,
            isRetrying: false,
            lastError: err
          }))
          throw err
        }

        // Calculate delay and retry
        const delay = calculateDelay(retryState.attempt + 1)
        const nextAttempt = retryState.attempt + 1

        setRetryState(prev => ({
          ...prev,
          attempt: nextAttempt,
          isRetrying: true,
          lastError: err
        }))

        // Call retry callback
        onRetry?.(nextAttempt, err)

        // Wait before retrying
        await new Promise(resolve => {
          timeoutRef.current = setTimeout(resolve, delay)
        })

        // Recursive retry
        return executeWithRetry(...args)
      }
    },
    [asyncFunction, shouldRetry, maxAttempts, calculateDelay, onRetry, retryState.attempt]
  )

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setRetryState({ attempt: 0, isRetrying: false })
  }, [])

  return {
    executeWithRetry,
    reset,
    retryState
  }
}

// Utility function for simple retry without React hook
export const retryAsync = async <T>(
  asyncFunction: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
    shouldRetry = (error: Error) => {
      return (
        error.name === 'NetworkError' ||
        error.name === 'TypeError' ||
        (error.message.includes('status') && parseInt(error.message.match(/\d+/)?.[0] || '0') >= 500)
      )
    }
  } = options

  let attempt = 0
  let lastError: Error | undefined

  while (attempt < maxAttempts) {
    try {
      return await asyncFunction()
    } catch (error) {
      lastError = error as Error
      attempt++

      if (!shouldRetry(lastError) || attempt >= maxAttempts) {
        throw lastError
      }

      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay)
      onRetry?.(attempt, lastError)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

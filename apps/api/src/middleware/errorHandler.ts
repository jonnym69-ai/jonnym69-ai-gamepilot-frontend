import { Request, Response, NextFunction } from 'express'
import { logError, logSecurityEvent } from '../logging/errorLogger'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
  isOperational?: boolean
}

export class CustomError extends Error implements ApiError {
  public statusCode: number
  public code: string
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, public details?: any[]) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string) {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR')
    if (originalError && originalError.stack) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`
    }
  }
}

// Error response formatter
const formatErrorResponse = (error: ApiError, req: Request): any => {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  const response: any = {
    error: error.code || 'INTERNAL_ERROR',
    message: error.message,
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId || 'unknown'
  }

  // Add validation details if available
  if (error instanceof ValidationError && error.details) {
    response.details = error.details
  }

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    response.stack = error.stack
  }

  // Add request context in development
  if (isDevelopment) {
    response.context = {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    }
  }

  return response
}

// Main error handler middleware
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logError(error.message, error, req, {
    errorType: error.constructor.name,
    statusCode: error.statusCode?.toString() || 'unknown'
  })

  // Log security events for certain error types
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    logSecurityEvent(`Security error: ${error.message}`, req, 'medium', {
      errorType: error.constructor.name
    })
  }

  // Handle specific error types
  let statusCode = error.statusCode || 500
  let errorCode = error.code || 'INTERNAL_ERROR'

  if (error instanceof ValidationError) {
    statusCode = 400
    errorCode = 'VALIDATION_ERROR'
  } else if (error instanceof AuthenticationError) {
    statusCode = 401
    errorCode = 'AUTHENTICATION_ERROR'
  } else if (error instanceof AuthorizationError) {
    statusCode = 403
    errorCode = 'AUTHORIZATION_ERROR'
  } else if (error instanceof NotFoundError) {
    statusCode = 404
    errorCode = 'NOT_FOUND'
  } else if (error instanceof ConflictError) {
    statusCode = 409
    errorCode = 'CONFLICT'
  } else if (error instanceof RateLimitError) {
    statusCode = 429
    errorCode = 'RATE_LIMIT_EXCEEDED'
  } else if (error instanceof DatabaseError) {
    statusCode = 500
    errorCode = 'DATABASE_ERROR'
  } else if (error.name === 'ValidationError') {
    // Handle Zod validation errors
    statusCode = 400
    errorCode = 'VALIDATION_ERROR'
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    errorCode = 'INVALID_TOKEN'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    errorCode = 'TOKEN_EXPIRED'
  }

  // Send error response
  const errorResponse = formatErrorResponse(error, req)
  res.status(statusCode).json(errorResponse)
}

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.url} not found`)
  next(error)
}

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  ;(req as any).requestId = requestId
  res.setHeader('X-Request-ID', requestId)
  
  next()
}

// Development error handler (for better debugging)
export const developmentErrorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Development Error Details:', {
      message: error.message,
      stack: error.stack || 'No stack available',
      statusCode: error.statusCode,
      code: error.code,
      isOperational: error.isOperational,
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
      }
    })
  }
  
  next(error)
}

// Production error handler (minimal information)
export const productionErrorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Only log operational errors in production
  if (error.isOperational) {
    logError(error.message, error, req)
  } else {
    // Log programming errors with higher severity
    logError(`Non-operational error: ${error.message}`, error, req, {
      nonOperational: 'true',
      stack: error.stack || 'No stack available'
    })
  }
  
  next(error)
}

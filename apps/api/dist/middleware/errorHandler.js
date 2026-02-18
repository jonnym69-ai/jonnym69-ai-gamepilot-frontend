"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionErrorHandler = exports.developmentErrorHandler = exports.requestIdMiddleware = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.DatabaseError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.CustomError = void 0;
const errorLogger_1 = require("../logging/errorLogger");
class CustomError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
class ValidationError extends CustomError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends CustomError {
    constructor(message) {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends CustomError {
    constructor(message) {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends CustomError {
    constructor(message) {
        super(message, 404, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends CustomError {
    constructor(message) {
        super(message, 409, 'CONFLICT');
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends CustomError {
    constructor(message) {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}
exports.RateLimitError = RateLimitError;
class DatabaseError extends CustomError {
    constructor(message, originalError) {
        super(message, 500, 'DATABASE_ERROR');
        if (originalError && originalError.stack) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }
}
exports.DatabaseError = DatabaseError;
// Error response formatter
const formatErrorResponse = (error, req) => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const response = {
        error: error.code || 'INTERNAL_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.requestId || 'unknown'
    };
    // Add validation details if available
    if (error instanceof ValidationError && error.details) {
        response.details = error.details;
    }
    // Add stack trace in development
    if (isDevelopment && error.stack) {
        response.stack = error.stack;
    }
    // Add request context in development
    if (isDevelopment) {
        response.context = {
            method: req.method,
            url: req.url,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };
    }
    return response;
};
// Main error handler middleware
const errorHandler = (error, req, res, next) => {
    // Log the error
    (0, errorLogger_1.logError)(error.message, error, req, {
        errorType: error.constructor.name,
        statusCode: error.statusCode?.toString() || 'unknown'
    });
    // Log security events for certain error types
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        (0, errorLogger_1.logSecurityEvent)(`Security error: ${error.message}`, req, 'medium', {
            errorType: error.constructor.name
        });
    }
    // Handle specific error types
    let statusCode = error.statusCode || 500;
    let errorCode = error.code || 'INTERNAL_ERROR';
    if (error instanceof ValidationError) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
    }
    else if (error instanceof AuthenticationError) {
        statusCode = 401;
        errorCode = 'AUTHENTICATION_ERROR';
    }
    else if (error instanceof AuthorizationError) {
        statusCode = 403;
        errorCode = 'AUTHORIZATION_ERROR';
    }
    else if (error instanceof NotFoundError) {
        statusCode = 404;
        errorCode = 'NOT_FOUND';
    }
    else if (error instanceof ConflictError) {
        statusCode = 409;
        errorCode = 'CONFLICT';
    }
    else if (error instanceof RateLimitError) {
        statusCode = 429;
        errorCode = 'RATE_LIMIT_EXCEEDED';
    }
    else if (error instanceof DatabaseError) {
        statusCode = 500;
        errorCode = 'DATABASE_ERROR';
    }
    else if (error.name === 'ValidationError') {
        // Handle Zod validation errors
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorCode = 'INVALID_TOKEN';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        errorCode = 'TOKEN_EXPIRED';
    }
    // Send error response
    const errorResponse = formatErrorResponse(error, req);
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
// Async error wrapper for route handlers
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// 404 handler
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.method} ${req.url} not found`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
// Request ID middleware
const requestIdMiddleware = (req, res, next) => {
    const requestId = req.headers['x-request-id'] ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
};
exports.requestIdMiddleware = requestIdMiddleware;
// Development error handler (for better debugging)
const developmentErrorHandler = (error, req, res, next) => {
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
        });
    }
    next(error);
};
exports.developmentErrorHandler = developmentErrorHandler;
// Production error handler (minimal information)
const productionErrorHandler = (error, req, res, next) => {
    // Only log operational errors in production
    if (error.isOperational) {
        (0, errorLogger_1.logError)(error.message, error, req);
    }
    else {
        // Log programming errors with higher severity
        (0, errorLogger_1.logError)(`Non-operational error: ${error.message}`, error, req, {
            nonOperational: 'true',
            stack: error.stack || 'No stack available'
        });
    }
    next(error);
};
exports.productionErrorHandler = productionErrorHandler;
//# sourceMappingURL=errorHandler.js.map
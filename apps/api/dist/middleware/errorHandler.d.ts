import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
}
export declare class CustomError extends Error implements ApiError {
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string, isOperational?: boolean);
}
export declare class ValidationError extends CustomError {
    details?: any[] | undefined;
    constructor(message: string, details?: any[] | undefined);
}
export declare class AuthenticationError extends CustomError {
    constructor(message: string);
}
export declare class AuthorizationError extends CustomError {
    constructor(message: string);
}
export declare class NotFoundError extends CustomError {
    constructor(message: string);
}
export declare class ConflictError extends CustomError {
    constructor(message: string);
}
export declare class RateLimitError extends CustomError {
    constructor(message: string);
}
export declare class DatabaseError extends CustomError {
    constructor(message: string, originalError?: Error);
}
export declare const errorHandler: (error: ApiError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestIdMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const developmentErrorHandler: (error: ApiError, req: Request, res: Response, next: NextFunction) => void;
export declare const productionErrorHandler: (error: ApiError, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map
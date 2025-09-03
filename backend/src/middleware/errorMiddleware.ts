import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { ErrorResponse, LogContext } from '../types';

/**
 * Custom AppError class that implements our AppError interface
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
  
  const logContext: LogContext = {
    requestId: req.headers['x-request-id'] as string,
    ip: req.ip || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    method: req.method,
    url: req.originalUrl
  };
  
  winston.warn('Route not found', {
    ...logContext,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  });
  
  next(error);
};

/**
 * Global error handler
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  try {
    // Convert regular Error to AppError if needed
    const appError = err instanceof AppError 
      ? err 
      : new AppError(err.message || 'Internal Server Error', 500, 'INTERNAL_ERROR', false);

    const statusCode = appError.statusCode;
    const message = appError.message;
    const code = appError.code;
    
    const logContext: LogContext = {
      requestId: req.headers['x-request-id'] as string,
      userId: (req as any).user?.userId,
      sessionId: (req as any).session?.id,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      url: req.originalUrl
    };
    
    // Log error with context
    const errorLog = {
      timestamp: appError.timestamp.toISOString(),
      error: {
        message,
        code,
        statusCode,
        stack: process.env['NODE_ENV'] === 'development' ? err.stack : undefined,
        isOperational: appError.isOperational
      },
      request: logContext,
      headers: sanitizeHeaders(req.headers)
    };
    
    // Log error based on severity
    if (statusCode >= 500) {
      winston.error('Server error occurred', errorLog);
    } else if (statusCode >= 400) {
      winston.warn('Client error occurred', errorLog);
    } else {
      winston.info('Error occurred', errorLog);
    }
    
    // Prepare error response
    const errorStack = process.env['NODE_ENV'] === 'development' ? err.stack : undefined;
    const errorResponse: ErrorResponse = {
      success: false,
      message,
      error: errorStack || code,
      timestamp: new Date().toISOString()
    };
    
    // Add additional error details for development
    if (process.env['NODE_ENV'] === 'development') {
      errorResponse.details = {
        code,
        statusCode,
        isOperational: appError.isOperational,
        request: {
          method: req.method,
          url: req.originalUrl,
          ip: req.ip || 'unknown'
        }
      };
    }
    
    // Send error response
    res.status(statusCode).json(errorResponse);
    
  } catch (handlerError) {
    // If error handler itself fails, log and send generic error
    winston.error('Error handler failed', {
      originalError: err,
      handlerError: handlerError
    });
    
    const fallbackResponse: ErrorResponse = {
      success: false,
      message: 'Internal Server Error',
      error: 'Error handler failed',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(fallbackResponse);
  }
};

/**
 * Utility function to sanitize headers
 */
const sanitizeHeaders = (headers: Record<string, unknown>): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  
  Object.keys(headers).forEach(key => {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = String(headers[key]);
    }
  });
  
  return sanitized;
};

/**
 * Async error wrapper
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error factory functions
export const createNotFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

export const createUnauthorizedError = (message: string = 'Unauthorized'): AppError => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

export const createForbiddenError = (message: string = 'Forbidden'): AppError => {
  return new AppError(message, 403, 'FORBIDDEN');
};

export const createBadRequestError = (message: string = 'Bad Request'): AppError => {
  return new AppError(message, 400, 'BAD_REQUEST');
};

export const createConflictError = (message: string = 'Conflict'): AppError => {
  return new AppError(message, 409, 'CONFLICT');
};

export const createServiceUnavailableError = (message: string = 'Service Unavailable'): AppError => {
  return new AppError(message, 503, 'SERVICE_UNAVAILABLE');
};

export const createValidationError = (message: string, field?: string): AppError => {
  const error = new AppError(message, 422, 'VALIDATION_ERROR');
  (error as any).field = field;
  return error;
};

const winston = require('winston');

// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================

// 404 Not Found handler
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  
  winston.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  try {
    // Set default values
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';
    
    // Log error with context
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: message,
        code: code,
        statusCode: statusCode,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.user_id || null,
        sessionId: req.session?.id || null
      },
      headers: sanitizeHeaders(req.headers)
    };
    
    // Log based on error severity
    if (statusCode >= 500) {
      winston.error('Server error occurred', errorLog);
    } else if (statusCode >= 400) {
      winston.warn('Client error occurred', errorLog);
    } else {
      winston.info('Error occurred', errorLog);
    }
    
    // Don't expose internal errors to client in production
    const clientMessage = statusCode >= 500 && process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : message;
    
    // Send error response
    res.status(statusCode).json({
      success: false,
      message: clientMessage,
      code: code,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: errorLog
      })
    });
    
  } catch (errorHandlerError) {
    // Fallback error response if error handler itself fails
    winston.error('Error handler failed:', errorHandlerError);
    
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      code: 'ERROR_HANDLER_FAILED'
    });
  }
};

// =====================================================
// ASYNC ERROR WRAPPER
// =====================================================

// Wrapper for async route handlers to catch errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// =====================================================
// VALIDATION ERROR HANDLER
// =====================================================

// Handle validation errors from express-validator
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.validationErrors = errors.array();
    
    winston.warn('Validation error', {
      url: req.originalUrl,
      method: req.method,
      errors: errors.array()
    });
    
    return next(error);
  }
  
  next();
};

// =====================================================
// DATABASE ERROR HANDLER
// =====================================================

// Handle database-specific errors
const handleDatabaseErrors = (err, req, res, next) => {
  // PostgreSQL specific error codes
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        err.statusCode = 409;
        err.code = 'DUPLICATE_ENTRY';
        err.message = 'Resource already exists';
        break;
        
      case '23503': // foreign_key_violation
        err.statusCode = 400;
        err.code = 'FOREIGN_KEY_VIOLATION';
        err.message = 'Referenced resource does not exist';
        break;
        
      case '23502': // not_null_violation
        err.statusCode = 400;
        err.code = 'MISSING_REQUIRED_FIELD';
        err.message = 'Required field is missing';
        break;
        
      case '42P01': // undefined_table
        err.statusCode = 500;
        err.code = 'DATABASE_ERROR';
        err.message = 'Database configuration error';
        break;
        
      case '28P01': // invalid_password
        err.statusCode = 500;
        err.code = 'DATABASE_AUTH_ERROR';
        err.message = 'Database authentication failed';
        break;
        
      case '3D000': // invalid_catalog_name
        err.statusCode = 500;
        err.code = 'DATABASE_ERROR';
        err.message = 'Database not found';
        break;
        
      case '08000': // connection_exception
        err.statusCode = 503;
        err.code = 'DATABASE_UNAVAILABLE';
        err.message = 'Database temporarily unavailable';
        break;
        
      case '57014': // query_canceled
        err.statusCode = 408;
        err.code = 'QUERY_TIMEOUT';
        err.message = 'Database query timed out';
        break;
        
      default:
        // Handle other database errors
        if (err.code.startsWith('23') || err.code.startsWith('42')) {
          err.statusCode = 400;
          err.code = 'DATABASE_CONSTRAINT_ERROR';
        } else if (err.code.startsWith('08')) {
          err.statusCode = 503;
          err.code = 'DATABASE_CONNECTION_ERROR';
        } else {
          err.statusCode = 500;
          err.code = 'DATABASE_ERROR';
        }
    }
  }
  
  next(err);
};

// =====================================================
// JWT ERROR HANDLER
// =====================================================

// Handle JWT-specific errors
const handleJWTErrors = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.code = 'INVALID_TOKEN';
    err.message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.code = 'TOKEN_EXPIRED';
    err.message = 'Token has expired';
  } else if (err.name === 'NotBeforeError') {
    err.statusCode = 401;
    err.code = 'TOKEN_NOT_ACTIVE';
    err.message = 'Token is not yet active';
  }
  
  next(err);
};

// =====================================================
// RATE LIMIT ERROR HANDLER
// =====================================================

// Handle rate limiting errors
const handleRateLimitErrors = (err, req, res, next) => {
  if (err.statusCode === 429) {
    err.code = 'RATE_LIMIT_EXCEEDED';
    err.message = 'Too many requests. Please try again later.';
    
    // Add retry-after header
    res.set('Retry-After', '900'); // 15 minutes
  }
  
  next(err);
};

// =====================================================
// FILE UPLOAD ERROR HANDLER
// =====================================================

// Handle file upload errors
const handleFileUploadErrors = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    err.statusCode = 413;
    err.code = 'FILE_TOO_LARGE';
    err.message = 'File size exceeds limit';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    err.statusCode = 413;
    err.code = 'TOO_MANY_FILES';
    err.message = 'Too many files uploaded';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    err.statusCode = 400;
    err.code = 'UNEXPECTED_FILE';
    err.message = 'Unexpected file field';
  }
  
  next(err);
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Sanitize headers for logging (remove sensitive information)
const sanitizeHeaders = (headers) => {
  const sanitized = { ...headers };
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'x-csrf-token'
  ];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// Create custom error classes
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors) {
    super(message, 400, 'VALIDATION_ERROR');
    this.validationErrors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// =====================================================
// ERROR MONITORING
// =====================================================

// Track error statistics
const errorStats = {
  total: 0,
  byCode: {},
  byStatus: {},
  recent: []
};

const trackError = (error) => {
  errorStats.total++;
  
  // Track by error code
  const code = error.code || 'UNKNOWN';
  errorStats.byCode[code] = (errorStats.byCode[code] || 0) + 1;
  
  // Track by status code
  const status = error.statusCode || 500;
  errorStats.byStatus[status] = (errorStats.byStatus[status] || 0) + 1;
  
  // Track recent errors (last 100)
  errorStats.recent.unshift({
    timestamp: new Date().toISOString(),
    code: code,
    status: status,
    message: error.message
  });
  
  if (errorStats.recent.length > 100) {
    errorStats.recent.pop();
  }
};

// Get error statistics
const getErrorStats = () => {
  return {
    ...errorStats,
    recent: errorStats.recent.slice(0, 10) // Return only last 10
  };
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  handleValidationErrors,
  handleDatabaseErrors,
  handleJWTErrors,
  handleRateLimitErrors,
  handleFileUploadErrors,
  trackError,
  getErrorStats,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError
}; 
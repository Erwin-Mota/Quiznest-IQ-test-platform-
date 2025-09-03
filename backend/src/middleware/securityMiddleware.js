const winston = require('winston');
const { getCache, setCache } = require('../config/redis');

// =====================================================
// SECURITY MIDDLEWARE
// =====================================================

const securityMiddleware = (req, res, next) => {
  try {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Log security events
    logSecurityEvent(req, 'request_received');
    
    // Basic input sanitization
    sanitizeInput(req);
    
    // Check for suspicious patterns
    if (detectSuspiciousActivity(req)) {
      logSecurityEvent(req, 'suspicious_activity_detected');
      return res.status(400).json({
        success: false,
        message: 'Request blocked due to suspicious activity',
        code: 'SUSPICIOUS_ACTIVITY'
      });
    }
    
    next();
    
  } catch (error) {
    winston.error('Security middleware error:', error);
    next();
  }
};

// =====================================================
// INPUT SANITIZATION
// =====================================================

const sanitizeInput = (req) => {
  try {
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeString(req.query[key]);
        }
      });
    }
    
    // Sanitize body parameters
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      });
    }
    
    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeString(req.params[key]);
        }
      });
    }
    
  } catch (error) {
    winston.error('Input sanitization error:', error);
  }
};

// Sanitize individual strings
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove null bytes
  str = str.replace(/\0/g, '');
  
  // Remove control characters (except newlines and tabs)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Normalize whitespace
  str = str.replace(/\s+/g, ' ').trim();
  
  // Limit length
  if (str.length > 10000) {
    str = str.substring(0, 10000);
  }
  
  return str;
};

// =====================================================
// SUSPICIOUS ACTIVITY DETECTION
// =====================================================

const detectSuspiciousActivity = (req) => {
  try {
    const suspiciousPatterns = [
      // SQL injection attempts
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)\b)/i,
      
      // XSS attempts
      /<script|javascript:|vbscript:|onload|onerror|onclick|onmouseover|onfocus|onblur/i,
      
      // Path traversal attempts
      /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i,
      
      // Command injection attempts
      /(\b(cat|ls|pwd|whoami|id|uname|wget|curl|nc|netcat|bash|sh|cmd|powershell)\b)/i,
      
      // NoSQL injection attempts
      /(\$where|\$ne|\$gt|\$lt|\$regex|\$in|\$nin)/i,
      
      // LDAP injection attempts
      /(\*|\(|\)|\&|\||!)/i,
      
      // XML injection attempts
      /<!\[CDATA\[|<!DOCTYPE|<!ENTITY|<!ELEMENT|<!ATTLIST/i,
      
      // Template injection attempts
      /(\{\{.*\}\}|\{%.*%\}|\{%.*%\})/i
    ];
    
    const requestString = JSON.stringify({
      url: req.url,
      method: req.method,
      query: req.query,
      body: req.body,
      params: req.params,
      headers: req.headers
    }).toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestString)) {
        winston.warn(`Suspicious pattern detected: ${pattern.source}`, {
          ip: req.ip,
          url: req.url,
          userAgent: req.get('User-Agent')
        });
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    winston.error('Suspicious activity detection error:', error);
    return false;
  }
};

// =====================================================
// RATE LIMITING ENHANCEMENT
// =====================================================

const enhancedRateLimit = async (req, res, next) => {
  try {
    const clientIP = req.ip;
    const endpoint = req.path;
    const userAgent = req.get('User-Agent');
    
    // Check if IP is already blocked
    const blockedKey = `blocked:${clientIP}`;
    const isBlocked = await getCache(blockedKey);
    
    if (isBlocked) {
      logSecurityEvent(req, 'blocked_ip_attempt');
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 3600 // 1 hour
      });
    }
    
    // Check rate limit
    const rateLimitKey = `ratelimit:${clientIP}:${endpoint}`;
    const currentCount = await getCache(rateLimitKey) || 0;
    
    if (currentCount > 100) { // 100 requests per 15 minutes
      // Block IP for 1 hour
      await setCache(blockedKey, true, 3600);
      
      logSecurityEvent(req, 'ip_blocked', {
        reason: 'rate_limit_exceeded',
        count: currentCount
      });
      
      return res.status(429).json({
        success: false,
        message: 'Too many requests. IP blocked for 1 hour.',
        code: 'IP_BLOCKED',
        retryAfter: 3600
      });
    }
    
    // Increment counter
    await setCache(rateLimitKey, currentCount + 1, 900); // 15 minutes
    
    next();
    
  } catch (error) {
    winston.error('Enhanced rate limiting error:', error);
    next();
  }
};

// =====================================================
// REQUEST VALIDATION
// =====================================================

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body);
      
      if (error) {
        logSecurityEvent(req, 'validation_failed', {
          errors: error.details.map(detail => detail.message)
        });
        
        return res.status(400).json({
          success: false,
          message: 'Request validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }
      
      // Replace request body with validated data
      req.body = value;
      next();
      
    } catch (error) {
      winston.error('Request validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

// =====================================================
// CONTENT TYPE VALIDATION
// =====================================================

const validateContentType = (allowedTypes) => {
  return (req, res, next) => {
    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header is required',
        code: 'CONTENT_TYPE_MISSING'
      });
    }
    
    const isValidType = allowedTypes.some(type => 
      contentType.includes(type)
    );
    
    if (!isValidType) {
      logSecurityEvent(req, 'invalid_content_type', {
        received: contentType,
        allowed: allowedTypes
      });
      
      return res.status(415).json({
        success: false,
        message: 'Unsupported content type',
        code: 'UNSUPPORTED_CONTENT_TYPE',
        allowed: allowedTypes
      });
    }
    
    next();
  };
};

// =====================================================
// FILE UPLOAD SECURITY
// =====================================================

const validateFileUpload = (options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    maxFiles = 1
  } = options;
  
  return (req, res, next) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
          code: 'NO_FILES'
        });
      }
      
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files);
      
      if (files.length > maxFiles) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxFiles} files allowed`,
          code: 'TOO_MANY_FILES'
        });
      }
      
      for (const file of files) {
        // Check file size
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
            code: 'FILE_TOO_LARGE'
          });
        }
        
        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: 'File type not allowed',
            code: 'INVALID_FILE_TYPE',
            allowed: allowedTypes
          });
        }
        
        // Check for malicious file extensions
        const maliciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (maliciousExtensions.includes(fileExtension)) {
          logSecurityEvent(req, 'malicious_file_attempt', {
            filename: file.name,
            extension: fileExtension
          });
          
          return res.status(400).json({
            success: false,
            message: 'File type not allowed for security reasons',
            code: 'MALICIOUS_FILE'
          });
        }
      }
      
      next();
      
    } catch (error) {
      winston.error('File upload validation error:', error);
      res.status(500).json({
        success: false,
        message: 'File validation error',
        code: 'FILE_VALIDATION_ERROR'
      });
    }
  };
};

// =====================================================
// SECURITY LOGGING
// =====================================================

const logSecurityEvent = (req, eventType, additionalData = {}) => {
  try {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      user_id: req.user?.user_id || null,
      session_id: req.session?.id || null,
      ...additionalData
    };
    
    winston.info('Security event logged', securityLog);
    
    // Store in Redis for monitoring
    const logKey = `security_log:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    setCache(logKey, securityLog, 86400); // Keep for 24 hours
    
  } catch (error) {
    winston.error('Security logging error:', error);
  }
};

// =====================================================
// REQUEST SIZE LIMITING
// =====================================================

const limitRequestSize = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      logSecurityEvent(req, 'request_size_exceeded', {
        content_length: contentLength,
        max_size: maxSizeBytes
      });
      
      return res.status(413).json({
        success: false,
        message: 'Request entity too large',
        code: 'REQUEST_TOO_LARGE',
        maxSize: maxSize
      });
    }
    
    next();
  };
};

// Parse size string (e.g., "10mb" -> 10485760)
const parseSize = (sizeStr) => {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  
  if (!match) {
    return 10 * 1024 * 1024; // Default to 10MB
  }
  
  const [, size, unit] = match;
  return Math.floor(parseFloat(size) * units[unit]);
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  securityMiddleware,
  enhancedRateLimit,
  validateRequest,
  validateContentType,
  validateFileUpload,
  limitRequestSize,
  sanitizeInput,
  detectSuspiciousActivity,
  logSecurityEvent
}; 
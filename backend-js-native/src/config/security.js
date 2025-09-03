import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { config } from './index.js'

// =====================================================
// CRYPTOGRAPHIC UTILITIES
// =====================================================

export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex')
}

export const generateSecureId = () => {
  return crypto.randomUUID()
}

export const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex')
}

// =====================================================
// PASSWORD HASHING
// =====================================================

export const hashPassword = async (password) => {
  try {
    // Use Argon2 for password hashing (more secure than bcrypt)
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
      hashLength: 32
    })
  } catch (error) {
    // Fallback to bcrypt if Argon2 fails
    console.warn('Argon2 failed, falling back to bcrypt:', error.message)
    return await bcrypt.hash(password, config.security.bcryptRounds)
  }
}

export const verifyPassword = async (password, hash) => {
  try {
    // Try Argon2 first
    return await argon2.verify(hash, password)
  } catch (error) {
    // Fallback to bcrypt
    return await bcrypt.compare(password, hash)
  }
}

// =====================================================
// JWT TOKEN MANAGEMENT
// =====================================================

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    algorithm: config.jwt.algorithm
  })
}

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    algorithm: config.jwt.algorithm
  })
}

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      algorithms: [config.jwt.algorithm]
    })
  } catch (error) {
    throw new Error(`Invalid access token: ${error.message}`)
  }
}

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      algorithms: [config.jwt.algorithm]
    })
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error.message}`)
  }
}

// =====================================================
// INPUT SANITIZATION
// =====================================================

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 10000) // Limit length
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// =====================================================
// SECURITY HEADERS
// =====================================================

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
}

// =====================================================
// RATE LIMITING CONFIGURATION
// =====================================================

export const rateLimitConfig = {
  global: {
    windowMs: config.security.rateLimit.windowMs,
    max: config.security.rateLimit.max,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (request) => {
      // Skip rate limiting for health checks
      return request.url === '/health'
    }
  },
  
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
      success: false,
      message: 'Too many password reset attempts, please try again later',
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
    }
  },
  
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: {
      success: false,
      message: 'Too many registration attempts, please try again later',
      code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
    }
  }
}

// =====================================================
// SECURITY MIDDLEWARE SETUP
// =====================================================

export const setupSecurity = async (fastify) => {
  // Add security headers to all responses
  fastify.addHook('onSend', async (request, reply, payload) => {
    Object.entries(securityHeaders).forEach(([key, value]) => {
      reply.header(key, value)
    })
  })
  
  // Add request ID to all requests
  fastify.addHook('onRequest', async (request, reply) => {
    request.id = request.headers['x-request-id'] || generateSecureId()
    reply.header('X-Request-ID', request.id)
  })
  
  // Log security events
  fastify.addHook('onRequest', async (request, reply) => {
    const { log } = request
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)\b)/i,
      /<script|javascript:|vbscript:|onload|onerror|onclick|onmouseover|onfocus|onblur/i,
      /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i,
      /(\b(cat|ls|pwd|whoami|id|uname|wget|curl|nc|netcat|bash|sh|cmd|powershell)\b)/i,
      /(\$where|\$ne|\$gt|\$lt|\$regex|\$in|\$nin)/i,
      /(\*|\(|\)|\&|\||!)/i,
      /<!\[CDATA\[|<!DOCTYPE|<!ENTITY|<!ELEMENT|<!ATTLIST/i,
      /(\{\{.*\}\}|\{%.*%\}|\{%.*%\})/i
    ]
    
    const requestString = JSON.stringify({
      url: request.url,
      method: request.method,
      query: request.query,
      body: request.body,
      params: request.params,
      headers: request.headers
    }).toLowerCase()
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestString)) {
        log.warn({
          pattern: pattern.source,
          ip: request.ip,
          url: request.url,
          userAgent: request.headers['user-agent'],
          requestId: request.id
        }, 'Suspicious pattern detected')
        
        reply.status(400).send({
          success: false,
          message: 'Request blocked due to suspicious activity',
          code: 'SUSPICIOUS_ACTIVITY'
        })
        return
      }
    }
  })
}

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

export const validationSchemas = {
  email: {
    type: 'string',
    format: 'email',
    minLength: 5,
    maxLength: 254,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  },
  
  password: {
    type: 'string',
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
  },
  
  name: {
    type: 'string',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z\\s\\-\'\.]+$'
  },
  
  uuid: {
    type: 'string',
    format: 'uuid'
  },
  
  positiveInteger: {
    type: 'integer',
    minimum: 1
  },
  
  nonNegativeInteger: {
    type: 'integer',
    minimum: 0
  }
}

export default {
  generateSecureToken,
  generateSecureId,
  generateSalt,
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sanitizeInput,
  securityHeaders,
  rateLimitConfig,
  setupSecurity,
  validationSchemas
}

import Fastify from 'fastify'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from './config/index.js'
import { setupSecurity } from './config/security.js'
import { setupDatabase } from './config/database.js'
import { setupRedis } from './config/redis.js'
import { setupLogging } from './config/logging.js'
import { setupMonitoring } from './config/monitoring.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// =====================================================
// FASTIFY SERVER CONFIGURATION
// =====================================================

const fastify = Fastify({
  logger: setupLogging(),
  trustProxy: true,
  bodyLimit: 10485760, // 10MB
  maxParamLength: 200,
  caseSensitive: false,
  ignoreTrailingSlash: true,
  disableRequestLogging: false,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  genReqId: () => crypto.randomUUID(),
  
  // Security headers
  http2: false,
  https: config.server.https,
  
  // Performance
  keepAliveTimeout: 5000,
  headersTimeout: 4000,
  maxRequestsPerSocket: 1000,
  
  // Schema validation
  schemaErrorFormatter: (errors, dataVar) => {
    return {
      success: false,
      message: 'Validation failed',
      errors: errors.map(error => ({
        field: error.instancePath || error.schemaPath,
        message: error.message,
        value: error.data
      })),
      code: 'VALIDATION_ERROR'
    }
  }
})

// =====================================================
// SECURITY SETUP
// =====================================================

await setupSecurity(fastify)

// =====================================================
// PLUGIN REGISTRATION
// =====================================================

// Core plugins
await fastify.register(import('@fastify/cors'), {
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID']
})

await fastify.register(import('@fastify/helmet'), {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
})

await fastify.register(import('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '15 minutes',
  errorResponseBuilder: (request, context) => ({
    success: false,
    message: 'Rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.round(context.ttl / 1000)
  })
})

await fastify.register(import('@fastify/redis'), {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  family: 4,
  keepAlive: 30000,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false
})

await fastify.register(import('@fastify/session'), {
  secret: config.session.secret,
  cookie: {
    secure: config.server.https,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict',
    path: '/'
  },
  store: {
    async get (sessionId) {
      return await fastify.redis.get(`session:${sessionId}`)
    },
    async set (sessionId, session) {
      await fastify.redis.setex(`session:${sessionId}`, 86400, JSON.stringify(session))
    },
    async destroy (sessionId) {
      await fastify.redis.del(`session:${sessionId}`)
    }
  }
})

await fastify.register(import('@fastify/websocket'), {
  options: {
    maxPayload: 1048576, // 1MB
    perMessageDeflate: {
      threshold: 1024,
      concurrencyLimit: 10,
      memLevel: 7
    }
  }
})

await fastify.register(import('@fastify/swagger'), {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'IQ Test Platform API',
      description: 'Enterprise-grade IQ testing platform with advanced security',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@iqtest.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http${config.server.https ? 's' : ''}://localhost:${config.server.port}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session'
        }
      }
    }
  }
})

await fastify.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      // Add authentication for docs in production
      if (config.server.environment === 'production') {
        // Implement basic auth or redirect to login
      }
      next()
    }
  }
})

// =====================================================
// CUSTOM PLUGINS
// =====================================================

await fastify.register(import('./plugins/validation.js'))
await fastify.register(import('./plugins/authentication.js'))
await fastify.register(import('./plugins/authorization.js'))
await fastify.register(import('./plugins/rate-limiting.js'))
await fastify.register(import('./plugins/audit-logging.js'))
await fastify.register(import('./plugins/error-handling.js'))

// =====================================================
// ROUTES
// =====================================================

await fastify.register(import('./routes/health.js'), { prefix: '/health' })
await fastify.register(import('./routes/auth.js'), { prefix: '/api/v1/auth' })
await fastify.register(import('./routes/users.js'), { prefix: '/api/v1/users' })
await fastify.register(import('./routes/tests.js'), { prefix: '/api/v1/tests' })
await fastify.register(import('./routes/questions.js'), { prefix: '/api/v1/questions' })
await fastify.register(import('./routes/results.js'), { prefix: '/api/v1/results' })
await fastify.register(import('./routes/admin.js'), { prefix: '/api/v1/admin' })
await fastify.register(import('./routes/websocket.js'), { prefix: '/ws' })

// =====================================================
// ERROR HANDLING
// =====================================================

fastify.setErrorHandler(async (error, request, reply) => {
  const { log } = request
  
  // Log error with context
  log.error({
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    },
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      query: request.query,
      params: request.params
    },
    user: request.user || null,
    timestamp: new Date().toISOString()
  }, 'Request error occurred')
  
  // Don't expose internal errors in production
  const isDevelopment = config.server.environment === 'development'
  
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    requestId: request.id
  }
  
  if (isDevelopment && error.stack) {
    response.stack = error.stack
  }
  
  reply.status(error.statusCode || 500).send(response)
})

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

const gracefulShutdown = async (signal) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`)
  
  try {
    await fastify.close()
    await setupDatabase.close()
    await setupRedis.close()
    fastify.log.info('Server closed successfully')
    process.exit(0)
  } catch (error) {
    fastify.log.error('Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// =====================================================
// START SERVER
// =====================================================

const start = async () => {
  try {
    // Initialize database and Redis connections
    await setupDatabase()
    await setupRedis()
    
    // Start server
    const address = await fastify.listen({
      port: config.server.port,
      host: config.server.host
    })
    
    fastify.log.info({
      address,
      environment: config.server.environment,
      version: process.env.npm_package_version || '1.0.0'
    }, 'Server started successfully')
    
    // Setup monitoring
    await setupMonitoring(fastify)
    
  } catch (error) {
    fastify.log.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()

export default fastify

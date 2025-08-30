const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const hpp = require('hpp');
const xss = require('xss-clean');
const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
require('dotenv').config();

// Import middleware and routes
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { securityMiddleware } = require('./middleware/securityMiddleware');
const { databaseConnection } = require('./config/database');
const { redisConnection } = require('./config/redis');

// Import route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const testRoutes = require('./routes/tests');
const resultRoutes = require('./routes/results');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// LOGGING CONFIGURATION
// =====================================================

// Configure Winston logger
const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'iq-test-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport for development
if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// =====================================================
// SECURITY MIDDLEWARE
// =====================================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/health') || req.path.startsWith('/metrics')
});

// Speed limiting for suspicious behavior
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  skip: (req) => req.path.startsWith('/health') || req.path.startsWith('/metrics')
});

// Apply rate limiters
app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// Additional security middleware
app.use(hpp()); // Protect against HTTP Parameter Pollution attacks
app.use(xss()); // Sanitize user input
// app.use(securityMiddleware); // Custom security middleware (disabled for development)

// =====================================================
// PERFORMANCE MIDDLEWARE
// =====================================================

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000
}));

// =====================================================
// LOGGING MIDDLEWARE
// =====================================================

// Morgan HTTP request logger
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// =====================================================
// HEALTH CHECK ENDPOINTS
// =====================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  res.status(200).json({
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100
    },
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    pid: process.pid
  });
});

// =====================================================
// API ROUTES
// =====================================================

// API versioning
const API_VERSION = '/api/v1';

// Authentication routes
app.use(`${API_VERSION}/auth`, authRoutes);

// User management routes
app.use(`${API_VERSION}/users`, userRoutes);

// Question bank routes
app.use(`${API_VERSION}/questions`, questionRoutes);

// Test management routes
app.use(`${API_VERSION}/tests`, testRoutes);

// Results and analytics routes
app.use(`${API_VERSION}/results`, resultRoutes);

// Payment processing routes
app.use(`${API_VERSION}/payments`, paymentRoutes);

// Admin routes (protected)
app.use(`${API_VERSION}/admin`, adminRoutes);

// =====================================================
// STATIC FILES (for production)
// =====================================================

if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  if (global.server) {
    global.server.close(async () => {
      logger.info('HTTP server closed.');
      
      // Close database connections
      if (databaseConnection) {
        databaseConnection.end();
        logger.info('Database connections closed.');
      }
      
      // Close Redis connections
      try {
        const { redisClient } = require('./config/redis');
        if (redisClient) {
          await redisClient.quit();
          logger.info('Redis connections closed.');
        }
      } catch (redisError) {
        logger.warn('Failed to close Redis connections:', redisError.message);
      }
      
      process.exit(0);
    });
    
    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// =====================================================
// SERVER STARTUP
// =====================================================

const startServer = async () => {
  try {
    // Try to initialize database connection
    try {
      await databaseConnection();
      logger.info('Database connection established');
    } catch (dbError) {
      logger.warn('Database connection failed, running in limited mode:', dbError.message);
      logger.info('Server will start without database features');
    }
    
    // Try to initialize Redis connection
    try {
      const redisResult = await redisConnection();
      if (redisResult) {
        logger.info('Redis connection established');
      } else {
        logger.warn('Redis connection failed, running in limited mode');
        logger.info('Server will start without caching features');
      }
    } catch (redisError) {
      logger.warn('Redis connection failed, running in limited mode:', redisError.message);
      logger.info('Server will start without caching features');
    }
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 IQ Test Backend Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`📈 Metrics: http://localhost:${PORT}/metrics`);
      logger.info(`🔒 API Status: http://localhost:${PORT}${API_VERSION}/status`);
      logger.info(`👥 Users API: http://localhost:${PORT}${API_VERSION}/users`);
      logger.info(`❓ Questions API: http://localhost:${PORT}${API_VERSION}/questions`);
      logger.info(`🧪 Tests API: http://localhost:${PORT}${API_VERSION}/tests`);
      logger.info(`📊 Results API: http://localhost:${PORT}${API_VERSION}/results`);
      logger.info(`💳 Payments API: http://localhost:${PORT}${API_VERSION}/payments`);
      logger.info(`👨‍💼 Admin API: http://localhost:${PORT}${API_VERSION}/admin`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });
    
    // Make server available for graceful shutdown
    global.server = server;
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app; 
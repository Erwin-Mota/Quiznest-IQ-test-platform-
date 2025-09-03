const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// BASIC MIDDLEWARE
// =====================================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan HTTP request logger
app.use(morgan('combined'));

// =====================================================
// HEALTH CHECK ENDPOINTS
// =====================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: '1.0.0',
    message: 'IQ Test Backend is running!'
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
// BASIC API ENDPOINTS
// =====================================================

app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'IQ Test Platform API v1',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api/v1'
    },
    status: 'running'
  });
});

app.get('/api/v1/status', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is operational',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    features: [
      'Express.js server',
      'Security middleware',
      'CORS enabled',
      'Compression enabled',
      'Request logging'
    ]
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    availableRoutes: [
      '/health',
      '/metrics',
      '/api/v1',
      '/api/v1/status'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// =====================================================
// SERVER STARTUP
// =====================================================

const startServer = async () => {
  try {
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('🚀 IQ Test Backend Server running on port', PORT);
      console.log('🌍 Environment:', NODE_ENV);
      console.log('📊 Health check: http://localhost:' + PORT + '/health');
      console.log('📈 Metrics: http://localhost:' + PORT + '/metrics');
      console.log('🔒 API Status: http://localhost:' + PORT + '/api/v1/status');
      console.log('');
      console.log('✅ Backend is ready for development!');
      console.log('📝 Note: This is a simplified version for testing');
      console.log('🔧 Full features require PostgreSQL and Redis setup');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app; 
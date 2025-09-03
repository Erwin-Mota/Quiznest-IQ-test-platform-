// =====================================================
// Test Setup Configuration
// =====================================================

const { Model } = require('objection');
const Knex = require('knex');

// Test database configuration
const testDbConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'iq_test_platform_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  pool: {
    min: 1,
    max: 5
  },
  migrations: {
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

// Create test database connection
const knex = Knex(testDbConfig);

// Bind Objection models to test database
Model.knex(knex);

// Global test setup
beforeAll(async () => {
  // Run migrations
  await knex.migrate.latest();
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
  process.env.SESSION_SECRET = 'test-session-secret-key-for-testing-only';
  process.env.BCRYPT_ROUNDS = '4'; // Faster for tests
});

// Global test teardown
afterAll(async () => {
  // Rollback migrations
  await knex.migrate.rollback();
  
  // Close database connection
  await knex.destroy();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data
  await knex('audit_logs').del();
  await knex('test_results').del();
  await knex('test_sessions').del();
  await knex('users').del();
});

// Global test utilities
global.testUtils = {
  // Create test user
  async createTestUser(userData = {}) {
    const defaultUserData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'User',
      account_status: 'active',
      email_verified: true,
      ...userData
    };
    
    const { User } = require('../src/models/User.js');
    return await User.query().insert(defaultUserData);
  },
  
  // Create test session
  async createTestSession(sessionData = {}) {
    const defaultSessionData = {
      user_id: 1,
      test_type: 'standard',
      status: 'in_progress',
      time_limit: 30,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      ...sessionData
    };
    
    const { TestSession } = require('../src/models/TestSession.js');
    return await TestSession.query().insert(defaultSessionData);
  },
  
  // Generate JWT token
  generateTestToken(payload = {}) {
    const jwt = require('jsonwebtoken');
    const defaultPayload = {
      user_id: 1,
      email: 'test@example.com',
      role: 'user',
      ...payload
    };
    
    return jwt.sign(defaultPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  },
  
  // Wait for async operations
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Mock external services
jest.mock('../src/services/emailService.js', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/services/storageService.js', () => ({
  uploadFile: jest.fn().mockResolvedValue({ url: 'https://example.com/file.jpg' }),
  deleteFile: jest.fn().mockResolvedValue(true),
  getFileUrl: jest.fn().mockResolvedValue('https://example.com/file.jpg')
}));

jest.mock('../src/services/redisService.js', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  exists: jest.fn().mockResolvedValue(false),
  expire: jest.fn().mockResolvedValue(true),
  incr: jest.fn().mockResolvedValue(1),
  decr: jest.fn().mockResolvedValue(0)
}));

// Suppress console logs in tests (except errors)
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

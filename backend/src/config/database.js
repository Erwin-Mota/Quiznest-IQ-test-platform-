const { Pool } = require('pg');
const winston = require('winston');

// =====================================================
// DATABASE CONFIGURATION
// =====================================================

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'iq_test_platform',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  port: process.env.DB_PORT || 5432,
  
  // Connection pooling configuration
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20, // Maximum number of clients in the pool
  min: parseInt(process.env.DB_MIN_CONNECTIONS) || 2,  // Minimum number of clients in the pool
  idle: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000, // How long a client is allowed to remain idle before being closed
  acquire: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 30000, // Maximum time to acquire a client from the pool
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: process.env.DB_SSL_CA,
    key: process.env.DB_SSL_KEY,
    cert: process.env.DB_SSL_CERT
  } : false,
  
  // Statement timeout (prevent long-running queries)
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000, // 30 seconds
  
  // Query timeout
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 60000, // 60 seconds
  
  // Connection timeout
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000, // 10 seconds
  
  // Idle timeout
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000, // 10 seconds
  
  // Allow exit on idle
  allowExitOnIdle: true,
  
  // Application name for monitoring
  application_name: 'iq-test-backend',
  
  // Connection parameters
  options: `-c timezone=utc -c application_name=iq-test-backend`
};

// =====================================================
// CREATE CONNECTION POOL
// =====================================================

const pool = new Pool(dbConfig);

// =====================================================
// POOL EVENT HANDLERS
// =====================================================

// Handle pool errors
pool.on('error', (err, client) => {
  winston.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Handle pool connection
pool.on('connect', (client) => {
  winston.debug('New client connected to database');
  
  // Set session-level parameters for security
  client.query('SET SESSION statement_timeout = $1', [dbConfig.statement_timeout]);
  client.query('SET SESSION lock_timeout = $1', [5000]); // 5 seconds
  client.query('SET SESSION idle_in_transaction_session_timeout = $1', [30000]); // 30 seconds
});

// Handle pool acquire
pool.on('acquire', (client) => {
  winston.debug('Client acquired from pool');
});

// Handle pool release
pool.on('release', (client) => {
  winston.debug('Client released back to pool');
});

// =====================================================
// DATABASE CONNECTION FUNCTION
// =====================================================

const databaseConnection = async () => {
  try {
    // Test the connection
    const client = await pool.connect();
    
    // Test basic functionality
    await client.query('SELECT NOW()');
    
    // Check database version
    const versionResult = await client.query('SELECT version()');
    winston.info('Database connected successfully');
    winston.info(`PostgreSQL version: ${versionResult.rows[0].version}`);
    
    // Check if required extensions exist
    const extensionsResult = await client.query(`
      SELECT extname FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements')
    `);
    
    const requiredExtensions = ['uuid-ossp', 'pgcrypto', 'pg_stat_statements'];
    const installedExtensions = extensionsResult.rows.map(row => row.extname);
    
    const missingExtensions = requiredExtensions.filter(ext => !installedExtensions.includes(ext));
    
    if (missingExtensions.length > 0) {
      winston.warn(`Missing required extensions: ${missingExtensions.join(', ')}`);
      winston.warn('Please install these extensions for full functionality');
    } else {
      winston.info('All required extensions are installed');
    }
    
    // Check database size
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
    `);
    winston.info(`Database size: ${sizeResult.rows[0].db_size}`);
    
    // Check active connections
    const connectionsResult = await client.query(`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);
    winston.info(`Active connections: ${connectionsResult.rows[0].active_connections}`);
    
    client.release();
    
    return true;
    
  } catch (error) {
    winston.error('Database connection failed:', error);
    throw error;
  }
};

// =====================================================
// DATABASE UTILITY FUNCTIONS
// =====================================================

// Execute a query with error handling
const executeQuery = async (query, params = []) => {
  const client = await pool.connect();
  
  try {
    const start = Date.now();
    const result = await client.query(query, params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 1000) { // Log queries taking more than 1 second
      winston.warn(`Slow query detected (${duration}ms): ${query.substring(0, 100)}...`);
    }
    
    return result;
    
  } catch (error) {
    winston.error('Query execution failed:', {
      query: query.substring(0, 200),
      params: params,
      error: error.message,
      stack: error.stack
    });
    throw error;
    
  } finally {
    client.release();
  }
};

// Execute a transaction
const executeTransaction = async (queries) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const result = await client.query(query, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
    
  } catch (error) {
    await client.query('ROLLBACK');
    winston.error('Transaction failed:', error);
    throw error;
    
  } finally {
    client.release();
  }
};

// Check database health
const checkDatabaseHealth = async () => {
  try {
    const result = await executeQuery('SELECT 1 as health_check');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      response_time: Date.now()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    const stats = await executeQuery(`
      SELECT 
        (SELECT count(*) FROM users) as total_users,
        (SELECT count(*) FROM questions) as total_questions,
        (SELECT count(*) FROM test_results) as total_results,
        (SELECT count(*) FROM payments WHERE payment_status = 'completed') as total_payments,
        (SELECT pg_size_pretty(pg_database_size(current_database()))) as database_size,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections
    `);
    
    return stats.rows[0];
    
  } catch (error) {
    winston.error('Failed to get database stats:', error);
    throw error;
  }
};

// =====================================================
// CONNECTION POOL MANAGEMENT
// =====================================================

// Gracefully close the pool
const closePool = async () => {
  try {
    await pool.end();
    winston.info('Database connection pool closed');
  } catch (error) {
    winston.error('Error closing database pool:', error);
  }
};

// Get pool status
const getPoolStatus = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  pool,
  databaseConnection,
  executeQuery,
  executeTransaction,
  checkDatabaseHealth,
  getDatabaseStats,
  closePool,
  getPoolStatus
}; 
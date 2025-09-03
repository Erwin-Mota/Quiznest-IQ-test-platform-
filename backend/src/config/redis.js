const redis = require('redis');
const winston = require('winston');

// =====================================================
// REDIS CONFIGURATION
// =====================================================

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: parseInt(process.env.REDIS_DB) || 0,
  
  // Connection options
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      winston.error('Redis server refused connection');
      return new Error('Redis server refused connection');
    }
    
    if (options.total_retry_time > 1000 * 60 * 60) {
      winston.error('Redis retry time exhausted');
      return new Error('Redis retry time exhausted');
    }
    
    if (options.attempt > 10) {
      winston.error('Redis max retry attempts reached');
      return new Error('Redis max retry attempts reached');
    }
    
    // Reconnect after 5 seconds
    return Math.min(options.attempt * 100, 3000);
  },
  
  // Security options
  enable_offline_queue: false,
  max_attempts: 3,
  
  // Performance options
  connect_timeout: 10000,
  command_timeout: 5000,
  
  // TLS/SSL for production
  tls: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: process.env.REDIS_SSL_CA,
    key: process.env.REDIS_SSL_KEY,
    cert: process.env.REDIS_SSL_CERT
  } : undefined
};

// =====================================================
// CREATE REDIS CLIENT
// =====================================================

let redisClient = null;

// =====================================================
// REDIS CONNECTION FUNCTION
// =====================================================

const redisConnection = async () => {
  try {
    // Create Redis client
    redisClient = redis.createClient(redisConfig);
    
    // Handle connection events
    redisClient.on('connect', () => {
      winston.info('Redis client connected');
    });
    
    redisClient.on('ready', () => {
      winston.info('Redis client ready');
    });
    
    redisClient.on('error', (err) => {
      winston.error('Redis client error:', err);
    });
    
    redisClient.on('end', () => {
      winston.warn('Redis client connection ended');
    });
    
    redisClient.on('reconnecting', () => {
      winston.info('Redis client reconnecting...');
    });
    
    // Connect to Redis with timeout
    const connectionPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 10000);
    });
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    // Test connection
    await redisClient.ping();
    winston.info('Redis connection established successfully');
    
    // Set default configuration (only if config command is available)
    try {
      await redisClient.config('SET', 'maxmemory-policy', 'allkeys-lru');
      await redisClient.config('SET', 'maxmemory', '256mb');
      winston.info('Redis configuration applied');
    } catch (configError) {
      winston.warn('Redis config command not available, skipping configuration:', configError.message);
    }
    
    return true;
    
  } catch (error) {
    winston.error('Redis connection failed:', error);
    
    // Clean up failed client
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch (quitError) {
        winston.warn('Failed to quit Redis client:', quitError);
      }
      redisClient = null;
    }
    
    // Return null instead of throwing to allow graceful fallback
    return null;
  }
};

// =====================================================
// CACHE UTILITY FUNCTIONS
// =====================================================

// Set cache with expiration
const setCache = async (key, value, expiration = 3600) => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.setEx(key, expiration, serializedValue);
    
    winston.debug(`Cache set: ${key} (expires in ${expiration}s)`);
    return true;
    
  } catch (error) {
    winston.error('Failed to set cache:', error);
    return false;
  }
};

// Get cache value
const getCache = async (key) => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    const value = await redisClient.get(key);
    
    if (value === null) {
      winston.debug(`Cache miss: ${key}`);
      return null;
    }
    
    winston.debug(`Cache hit: ${key}`);
    
    // Try to parse JSON, return as string if parsing fails
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
    
  } catch (error) {
    winston.error('Failed to get cache:', error);
    return null;
  }
};

// Delete cache key
const deleteCache = async (key) => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    const result = await redisClient.del(key);
    winston.debug(`Cache deleted: ${key} (${result} keys removed)`);
    return result > 0;
    
  } catch (error) {
    winston.error('Failed to delete cache:', error);
    return false;
  }
};

// Clear all cache
const clearCache = async () => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    await redisClient.flushDb();
    winston.info('All cache cleared');
    return true;
    
  } catch (error) {
    winston.error('Failed to clear cache:', error);
    return false;
  }
};

// Get cache statistics
const getCacheStats = async () => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    const info = await redisClient.info();
    const keyspace = await redisClient.info('keyspace');
    
    // Parse Redis info
    const lines = info.split('\r\n');
    const stats = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    });
    
    return {
      connected_clients: parseInt(stats.connected_clients) || 0,
      used_memory_human: stats.used_memory_human || '0B',
      total_commands_processed: parseInt(stats.total_commands_processed) || 0,
      keyspace_hits: parseInt(stats.keyspace_hits) || 0,
      keyspace_misses: parseInt(stats.keyspace_misses) || 0,
      hit_rate: stats.keyspace_hits && stats.keyspace_misses ? 
        Math.round((parseInt(stats.keyspace_hits) / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses))) * 100) : 0
    };
    
  } catch (error) {
    winston.error('Failed to get cache stats:', error);
    return null;
  }
};

// =====================================================
// SESSION MANAGEMENT FUNCTIONS
// =====================================================

// Store user session
const storeSession = async (sessionId, sessionData, expiration = 86400) => {
  try {
    const key = `session:${sessionId}`;
    return await setCache(key, sessionData, expiration);
  } catch (error) {
    winston.error('Failed to store session:', error);
    return false;
  }
};

// Get user session
const getSession = async (sessionId) => {
  try {
    const key = `session:${sessionId}`;
    return await getCache(key);
  } catch (error) {
    winston.error('Failed to get session:', error);
    return null;
  }
};

// Delete user session
const deleteSession = async (sessionId) => {
  try {
    const key = `session:${sessionId}`;
    return await deleteCache(key);
  } catch (error) {
    winston.error('Failed to delete session:', error);
    return false;
  }
};

// =====================================================
// RATE LIMITING FUNCTIONS
// =====================================================

// Check rate limit for IP and endpoint
const checkRateLimit = async (ip, endpoint, maxRequests = 100, windowMs = 900000) => {
  try {
    const key = `ratelimit:${ip}:${endpoint}`;
    const current = await redisClient.get(key);
    
    if (current === null) {
      // First request
      await redisClient.setEx(key, Math.ceil(windowMs / 1000), '1');
      return { allowed: true, remaining: maxRequests - 1, resetTime: Date.now() + windowMs };
    }
    
    const requestCount = parseInt(current);
    
    if (requestCount >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: Date.now() + windowMs };
    }
    
    // Increment counter
    await redisClient.incr(key);
    return { allowed: true, remaining: maxRequests - requestCount - 1, resetTime: Date.now() + windowMs };
    
  } catch (error) {
    winston.error('Rate limit check failed:', error);
    // Allow request if rate limiting fails
    return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs };
  }
};

// =====================================================
// PUBLISH/SUBSCRIBE FUNCTIONS
// =====================================================

// Publish message to channel
const publishMessage = async (channel, message) => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    const result = await redisClient.publish(channel, JSON.stringify(message));
    winston.debug(`Message published to ${channel}: ${result} subscribers`);
    return result;
    
  } catch (error) {
    winston.error('Failed to publish message:', error);
    return 0;
  }
};

// Subscribe to channel
const subscribeToChannel = async (channel, callback) => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(channel, (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        callback(parsedMessage);
      } catch {
        callback(message);
      }
    });
    
    winston.info(`Subscribed to channel: ${channel}`);
    return subscriber;
    
  } catch (error) {
    winston.error('Failed to subscribe to channel:', error);
    return null;
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Check if Redis is connected
const isConnected = () => {
  return redisClient && redisClient.isReady;
};

// Get Redis client
const getClient = () => {
  return redisClient;
};

// Close Redis connection
const closeConnection = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      winston.info('Redis connection closed');
    }
  } catch (error) {
    winston.error('Error closing Redis connection:', error);
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  redisConnection,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  getCacheStats,
  storeSession,
  getSession,
  deleteSession,
  checkRateLimit,
  publishMessage,
  subscribeToChannel,
  isConnected,
  getClient,
  closeConnection
}; 
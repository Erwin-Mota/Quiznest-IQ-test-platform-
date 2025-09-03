import Knex from 'knex'
import { Model } from 'objection'
import { config } from './index.js'

// =====================================================
// KNEX CONFIGURATION
// =====================================================

const knexConfig = {
  client: 'postgresql',
  connection: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.username,
    password: config.database.password,
    ssl: config.database.ssl
  },
  pool: config.database.pool,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  },
  debug: config.server.environment === 'development'
}

// =====================================================
// CREATE KNEX INSTANCE
// =====================================================

const knex = Knex(knexConfig)

// =====================================================
// BIND OBJECTION TO KNEX
// =====================================================

Model.knex(knex)

// =====================================================
// DATABASE CONNECTION SETUP
// =====================================================

export const setupDatabase = async () => {
  try {
    // Test connection
    await knex.raw('SELECT 1')
    console.log('✅ Database connected successfully')
    
    // Check required extensions
    const extensions = await knex.raw(`
      SELECT extname FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements', 'btree_gin')
    `)
    
    const requiredExtensions = ['uuid-ossp', 'pgcrypto', 'pg_stat_statements', 'btree_gin']
    const installedExtensions = extensions.rows.map(row => row.extname)
    const missingExtensions = requiredExtensions.filter(ext => !installedExtensions.includes(ext))
    
    if (missingExtensions.length > 0) {
      console.warn(`⚠️  Missing extensions: ${missingExtensions.join(', ')}`)
      console.warn('Please install these extensions for full functionality')
    } else {
      console.log('✅ All required extensions are installed')
    }
    
    // Run migrations
    await knex.migrate.latest()
    console.log('✅ Database migrations completed')
    
    return knex
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

// =====================================================
// DATABASE UTILITIES
// =====================================================

export const executeQuery = async (query, params = []) => {
  const start = Date.now()
  
  try {
    const result = await knex.raw(query, params)
    const duration = Date.now() - start
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`🐌 Slow query (${duration}ms): ${query.substring(0, 100)}...`)
    }
    
    return result
  } catch (error) {
    console.error('❌ Query execution failed:', {
      query: query.substring(0, 200),
      params,
      error: error.message
    })
    throw error
  }
}

export const executeTransaction = async (callback) => {
  const trx = await knex.transaction()
  
  try {
    const result = await callback(trx)
    await trx.commit()
    return result
  } catch (error) {
    await trx.rollback()
    throw error
  }
}

// =====================================================
// CONNECTION POOL MONITORING
// =====================================================

export const getConnectionStats = async () => {
  try {
    const stats = await knex.raw(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `)
    
    return stats.rows[0]
  } catch (error) {
    console.error('Failed to get connection stats:', error)
    return null
  }
}

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

export const closeDatabase = async () => {
  try {
    await knex.destroy()
    console.log('✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error closing database connection:', error)
  }
}

// =====================================================
// EXPORTS
// =====================================================

export { knex, Model }
export default knex

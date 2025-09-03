import { Model } from 'objection'
import bcrypt from 'bcryptjs'
import { hashPassword, verifyPassword } from '../config/security.js'

// =====================================================
// USER MODEL
// =====================================================

export class User extends Model {
  static tableName = 'users'
  
  static jsonSchema = {
    type: 'object',
    required: ['email', 'password_hash', 'first_name', 'last_name'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { 
        type: 'string', 
        format: 'email',
        minLength: 5,
        maxLength: 254
      },
      password_hash: { type: 'string', minLength: 1 },
      first_name: { 
        type: 'string', 
        minLength: 1, 
        maxLength: 100,
        pattern: '^[a-zA-Z\\s\\-\'\.]+$'
      },
      last_name: { 
        type: 'string', 
        minLength: 1, 
        maxLength: 100,
        pattern: '^[a-zA-Z\\s\\-\'\.]+$'
      },
      role: { 
        type: 'string', 
        enum: ['user', 'admin', 'super_admin'],
        default: 'user'
      },
      account_status: { 
        type: 'string', 
        enum: ['active', 'inactive', 'suspended', 'pending_verification'],
        default: 'pending_verification'
      },
      email_verified: { type: 'boolean', default: false },
      email_verification_token: { type: 'string' },
      password_reset_token: { type: 'string' },
      password_reset_expires: { type: 'string', format: 'date-time' },
      login_attempts: { type: 'integer', minimum: 0, default: 0 },
      locked_until: { type: 'string', format: 'date-time' },
      last_login: { type: 'string', format: 'date-time' },
      two_factor_enabled: { type: 'boolean', default: false },
      two_factor_secret: { type: 'string' },
      preferences: { type: 'object' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
      deleted_at: { type: 'string', format: 'date-time' }
    }
  }
  
  static relationMappings = {
    testSessions: {
      relation: Model.HasManyRelation,
      modelClass: () => require('./TestSession.js').TestSession,
      join: {
        from: 'users.id',
        to: 'test_sessions.user_id'
      }
    },
    
    testResults: {
      relation: Model.HasManyRelation,
      modelClass: () => require('./TestResult.js').TestResult,
      join: {
        from: 'users.id',
        to: 'test_results.user_id'
      }
    }
  }
  
  // =====================================================
  // INSTANCE METHODS
  // =====================================================
  
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    
    // Hash password if provided
    if (this.password) {
      this.password_hash = await hashPassword(this.password)
      delete this.password
    }
    
    // Set timestamps
    this.created_at = new Date().toISOString()
    this.updated_at = new Date().toISOString()
    
    // Generate email verification token
    if (!this.email_verification_token) {
      this.email_verification_token = require('crypto').randomBytes(32).toString('hex')
    }
  }
  
  async $beforeUpdate(queryContext) {
    await super.$beforeUpdate(queryContext)
    
    // Hash password if provided
    if (this.password) {
      this.password_hash = await hashPassword(this.password)
      delete this.password
    }
    
    // Update timestamp
    this.updated_at = new Date().toISOString()
  }
  
  // =====================================================
  // PASSWORD METHODS
  // =====================================================
  
  async verifyPassword(password) {
    return await verifyPassword(password, this.password_hash)
  }
  
  async setPassword(password) {
    this.password_hash = await hashPassword(password)
  }
  
  // =====================================================
  // ACCOUNT STATUS METHODS
  // =====================================================
  
  isActive() {
    return this.account_status === 'active'
  }
  
  isLocked() {
    return this.locked_until && new Date() < new Date(this.locked_until)
  }
  
  isEmailVerified() {
    return this.email_verified
  }
  
  // =====================================================
  // SECURITY METHODS
  // =====================================================
  
  async incrementLoginAttempts() {
    const attempts = this.login_attempts + 1
    const lockUntil = attempts >= 5 ? new Date(Date.now() + 2 * 60 * 60 * 1000) : null // Lock for 2 hours
    
    await this.$query().patch({
      login_attempts: attempts,
      locked_until: lockUntil
    })
    
    this.login_attempts = attempts
    this.locked_until = lockUntil
  }
  
  async resetLoginAttempts() {
    await this.$query().patch({
      login_attempts: 0,
      locked_until: null,
      last_login: new Date().toISOString()
    })
    
    this.login_attempts = 0
    this.locked_until = null
    this.last_login = new Date().toISOString()
  }
  
  // =====================================================
  // STATIC METHODS
  // =====================================================
  
  static async findByEmail(email) {
    return await this.query()
      .where('email', email.toLowerCase())
      .whereNull('deleted_at')
      .first()
  }
  
  static async findActiveByEmail(email) {
    return await this.query()
      .where('email', email.toLowerCase())
      .where('account_status', 'active')
      .whereNull('deleted_at')
      .first()
  }
  
  static async findByVerificationToken(token) {
    return await this.query()
      .where('email_verification_token', token)
      .whereNull('deleted_at')
      .first()
  }
  
  static async findByPasswordResetToken(token) {
    return await this.query()
      .where('password_reset_token', token)
      .where('password_reset_expires', '>', new Date().toISOString())
      .whereNull('deleted_at')
      .first()
  }
  
  static async getStats() {
    const stats = await this.query()
      .select(
        this.raw('COUNT(*) as total_users'),
        this.raw('COUNT(*) FILTER (WHERE account_status = \'active\') as active_users'),
        this.raw('COUNT(*) FILTER (WHERE email_verified = true) as verified_users'),
        this.raw('COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL \'30 days\') as new_users_30d'),
        this.raw('COUNT(*) FILTER (WHERE last_login >= NOW() - INTERVAL \'7 days\') as active_users_7d')
      )
      .whereNull('deleted_at')
      .first()
    
    return stats
  }
  
  // =====================================================
  // JSON SERIALIZATION
  // =====================================================
  
  $formatJson(json) {
    // Remove sensitive fields
    delete json.password_hash
    delete json.password_reset_token
    delete json.two_factor_secret
    delete json.email_verification_token
    
    return json
  }
}

export default User

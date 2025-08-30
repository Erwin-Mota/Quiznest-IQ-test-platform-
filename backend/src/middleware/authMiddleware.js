const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');
const { getSession, deleteSession } = require('../config/redis');
const winston = require('winston');

// =====================================================
// JWT CONFIGURATION
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// =====================================================
// TOKEN GENERATION FUNCTIONS
// =====================================================

// Generate access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'iq-test-platform',
    audience: 'iq-test-users',
    subject: payload.user_id
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'iq-test-platform',
    audience: 'iq-test-users',
    subject: payload.user_id
  });
};

// Generate both tokens
const generateTokens = (user) => {
  const payload = {
    user_id: user.user_id,
    email: user.email,
    role: user.role || 'user'
  };
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: JWT_EXPIRES_IN
  };
};

// =====================================================
// TOKEN VALIDATION FUNCTIONS
// =====================================================

// Verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'iq-test-platform',
      audience: 'iq-test-users'
    });
    return { valid: true, payload: decoded };
  } catch (error) {
    winston.warn('Access token verification failed:', error.message);
    return { valid: false, error: error.message };
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'iq-test-platform',
      audience: 'iq-test-users'
    });
    return { valid: true, payload: decoded };
  } catch (error) {
    winston.warn('Refresh token verification failed:', error.message);
    return { valid: false, error: error.message };
  }
};

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }
    
    // Verify token
    const { valid, payload, error } = verifyAccessToken(token);
    
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'TOKEN_INVALID',
        error: error
      });
    }
    
    // Check if user exists and is active
    const userQuery = `
      SELECT user_id, email, first_name, last_name, account_status, role
      FROM users 
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    
    const userResult = await executeQuery(userQuery, [payload.user_id]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const user = userResult.rows[0];
    
    // Check account status
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
        code: 'ACCOUNT_INACTIVE',
        status: user.account_status
      });
    }
    
    // Add user info to request
    req.user = user;
    req.token = payload;
    
    // Log successful authentication
    winston.info(`User authenticated: ${user.email} (${user.user_id})`);
    
    next();
    
  } catch (error) {
    winston.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return next(); // Continue without authentication
    }
    
    const { valid, payload, error } = verifyAccessToken(token);
    
    if (valid) {
      // Check if user exists and is active
      const userQuery = `
        SELECT user_id, email, first_name, last_name, account_status, role
        FROM users 
        WHERE user_id = $1 AND deleted_at IS NULL
      `;
      
      const userResult = await executeQuery(userQuery, [payload.user_id]);
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        
        if (user.account_status === 'active') {
          req.user = user;
          req.token = payload;
        }
      }
    }
    
    next();
    
  } catch (error) {
    winston.error('Optional authentication middleware error:', error);
    next(); // Continue even if authentication fails
  }
};

// =====================================================
// ROLE-BASED ACCESS CONTROL
// =====================================================

// Check if user has required role
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const userRole = req.user.role || 'user';
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!roles.includes(userRole)) {
      winston.warn(`Access denied: User ${req.user.email} (${userRole}) attempted to access ${req.path}`);
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: userRole
      });
    }
    
    next();
  };
};

// Admin only middleware
const requireAdmin = requireRole(['admin', 'super_admin']);

// Super admin only middleware
const requireSuperAdmin = requireRole(['super_admin']);

// =====================================================
// REFRESH TOKEN MIDDLEWARE
// =====================================================

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }
    
    // Verify refresh token
    const { valid, payload, error } = verifyRefreshToken(token);
    
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_INVALID',
        error: error
      });
    }
    
    // Check if user exists and is active
    const userQuery = `
      SELECT user_id, email, first_name, last_name, account_status, role
      FROM users 
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    
    const userResult = await executeQuery(userQuery, [payload.user_id]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const user = userResult.rows[0];
    
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
        code: 'ACCOUNT_INACTIVE'
      });
    }
    
    // Generate new tokens
    const newTokens = generateTokens(user);
    
    // Store refresh token hash in database
    const refreshTokenHash = await bcrypt.hash(newTokens.refreshToken, 12);
    
    const sessionQuery = `
      INSERT INTO user_sessions (user_id, refresh_token_hash, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        refresh_token_hash = EXCLUDED.refresh_token_hash,
        expires_at = EXCLUDED.expires_at,
        last_used = NOW()
    `;
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await executeQuery(sessionQuery, [
      user.user_id,
      refreshTokenHash,
      expiresAt,
      req.ip,
      req.get('User-Agent')
    ]);
    
    winston.info(`Token refreshed for user: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresIn: newTokens.expiresIn,
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    winston.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      code: 'REFRESH_ERROR'
    });
  }
};

// =====================================================
// LOGOUT MIDDLEWARE
// =====================================================

// Logout user (invalidate tokens)
const logout = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Delete session from database
    const deleteSessionQuery = `
      DELETE FROM user_sessions 
      WHERE user_id = $1
    `;
    
    await executeQuery(deleteSessionQuery, [req.user.user_id]);
    
    // Clear Redis session if exists
    await deleteSession(req.user.user_id);
    
    winston.info(`User logged out: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    winston.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
};

// =====================================================
// PASSWORD UTILITIES
// =====================================================

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Validate password strength
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    strength: calculatePasswordStrength(password)
  };
};

// Calculate password strength (0-100)
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length contribution
  score += Math.min(password.length * 4, 25);
  
  // Character variety contribution
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
  
  // Bonus for length
  if (password.length > 12) score += 10;
  if (password.length > 16) score += 10;
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 15; // Common sequences
  
  return Math.max(0, Math.min(100, score));
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // Token generation
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  
  // Token validation
  verifyAccessToken,
  verifyRefreshToken,
  
  // Middleware
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  
  // Authentication functions
  refreshToken,
  logout,
  
  // Password utilities
  hashPassword,
  comparePassword,
  validatePassword,
  calculatePasswordStrength
}; 
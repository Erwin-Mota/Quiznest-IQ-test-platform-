const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { 
  generateTokens, 
  hashPassword, 
  comparePassword, 
  validatePassword,
  authenticateToken 
} = require('../middleware/authMiddleware');
const { setCache, getCache } = require('../config/redis');
const winston = require('winston');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// =====================================================
// VALIDATION MIDDLEWARE
// =====================================================

// Registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .custom(async (email) => {
      const query = 'SELECT user_id FROM users WHERE email = $1 AND deleted_at IS NULL';
      const result = await executeQuery(query, [email]);
      if (result.rows.length > 0) {
        throw new Error('Email already registered');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const age = Math.floor((Date.now() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 13) {
        throw new Error('You must be at least 13 years old to register');
      }
      return true;
    }),
  body('countryCode')
    .optional()
    .isLength({ min: 2, max: 3 })
    .withMessage('Country code must be 2-3 characters')
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Password reset validation
const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// New password validation
const validateNewPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// =====================================================
// USER REGISTRATION
// =====================================================

router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      dateOfBirth, 
      countryCode 
    } = req.body;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const createUserQuery = `
      INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, country_code)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, email, first_name, last_name, created_at
    `;

    const userResult = await executeQuery(createUserQuery, [
      email, passwordHash, firstName, lastName, dateOfBirth, countryCode
    ]);

    const user = userResult.rows[0];

    // Create user profile
    const createProfileQuery = `
      INSERT INTO user_profiles (user_id, test_preferences, privacy_settings)
      VALUES ($1, $2, $3)
    `;

    await executeQuery(createProfileQuery, [
      user.user_id,
      { difficulty: 'medium', time_preference: 'standard' },
      { share_results: false, public_profile: false }
    ]);

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const updateVerificationQuery = `
      UPDATE users 
      SET email_verification_token = $1, email_verification_expires = $2
      WHERE user_id = $3
    `;

    await executeQuery(updateVerificationQuery, [verificationToken, expiresAt, user.user_id]);

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@iqtest.com',
        to: email,
        subject: 'Verify Your Email - IQ Test Platform',
        html: `
          <h2>Welcome to IQ Test Platform!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `
      });

      winston.info(`Verification email sent to: ${email}`);
    } catch (emailError) {
      winston.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Generate tokens
    const tokens = generateTokens(user);

    winston.info(`New user registered: ${email} (${user.user_id})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          email_verified: false
        },
        tokens: tokens
      }
    });

  } catch (error) {
    winston.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// =====================================================
// USER LOGIN
// =====================================================

router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Get user with password hash
    const getUserQuery = `
      SELECT user_id, email, password_hash, first_name, last_name, account_status, 
             email_verified, login_attempts, locked_until, role
      FROM users 
      WHERE email = $1 AND deleted_at IS NULL
    `;

    const userResult = await executeQuery(getUserQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date() < user.locked_until) {
      const remainingTime = Math.ceil((user.locked_until - new Date()) / 1000);
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${Math.ceil(remainingTime / 60)} minutes.`,
        code: 'ACCOUNT_LOCKED',
        locked_until: user.locked_until
      });
    }

    // Check if account is active
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
        code: 'ACCOUNT_INACTIVE',
        status: user.account_status
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.login_attempts + 1;
      let lockedUntil = null;

      if (newAttempts >= 5) {
        // Lock account for 30 minutes after 5 failed attempts
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      const updateAttemptsQuery = `
        UPDATE users 
        SET login_attempts = $1, locked_until = $2, last_login = NOW()
        WHERE user_id = $3
      `;

      await executeQuery(updateAttemptsQuery, [newAttempts, lockedUntil, user.user_id]);

      if (lockedUntil) {
        return res.status(423).json({
          success: false,
          message: 'Too many failed login attempts. Account locked for 30 minutes.',
          code: 'ACCOUNT_LOCKED',
          locked_until: lockedUntil
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        attempts_remaining: 5 - newAttempts
      });
    }

    // Reset login attempts on successful login
    const resetAttemptsQuery = `
      UPDATE users 
      SET login_attempts = 0, locked_until = NULL, last_login = NOW()
      WHERE user_id = $3
    `;

    await executeQuery(resetAttemptsQuery, [user.user_id]);

    // Generate tokens
    const tokens = generateTokens(user);

    // Store session in Redis
    const sessionData = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      login_time: new Date().toISOString(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    await setCache(`session:${user.user_id}`, sessionData, 86400); // 24 hours

    winston.info(`User logged in: ${email} (${user.user_id})`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          email_verified: user.email_verified,
          role: user.role
        },
        tokens: tokens
      }
    });

  } catch (error) {
    winston.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// =====================================================
// EMAIL VERIFICATION
// =====================================================

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
        code: 'TOKEN_MISSING'
      });
    }

    // Find user with this token
    const getUserQuery = `
      SELECT user_id, email, email_verification_expires
      FROM users 
      WHERE email_verification_token = $1 AND deleted_at IS NULL
    `;

    const userResult = await executeQuery(getUserQuery, [token]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
        code: 'INVALID_TOKEN'
      });
    }

    const user = userResult.rows[0];

    // Check if token is expired
    if (new Date() > user.email_verification_expires) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Verify email
    const verifyEmailQuery = `
      UPDATE users 
      SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL
      WHERE user_id = $1
    `;

    await executeQuery(verifyEmailQuery, [user.user_id]);

    winston.info(`Email verified for user: ${user.email} (${user.user_id})`);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    winston.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      code: 'VERIFICATION_ERROR'
    });
  }
});

// =====================================================
// PASSWORD RESET REQUEST
// =====================================================

router.post('/forgot-password', validatePasswordReset, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const getUserQuery = `
      SELECT user_id, email, first_name
      FROM users 
      WHERE email = $1 AND deleted_at IS NULL
    `;

    const userResult = await executeQuery(getUserQuery, [email]);

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store reset token in cache
    await setCache(`password_reset:${resetToken}`, {
      user_id: user.user_id,
      email: user.email,
      expires_at: expiresAt
    }, 3600); // 1 hour

    // Send reset email
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@iqtest.com',
        to: email,
        subject: 'Password Reset Request - IQ Test Platform',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${user.first_name},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        `
      });

      winston.info(`Password reset email sent to: ${email}`);
    } catch (emailError) {
      winston.error('Failed to send password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        code: 'EMAIL_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    winston.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      code: 'RESET_REQUEST_ERROR'
    });
  }
});

// =====================================================
// PASSWORD RESET
// =====================================================

router.post('/reset-password', validateNewPassword, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Get reset token from cache
    const resetData = await getCache(`password_reset:${token}`);

    if (!resetData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN'
      });
    }

    // Check if token is expired
    if (new Date() > new Date(resetData.expires_at)) {
      await setCache(`password_reset:${token}`, null, 1); // Delete expired token
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired',
        code: 'RESET_TOKEN_EXPIRED'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password
    const updatePasswordQuery = `
      UPDATE users 
      SET password_hash = $1, updated_at = NOW()
      WHERE user_id = $2
    `;

    await executeQuery(updatePasswordQuery, [passwordHash, resetData.user_id]);

    // Delete reset token from cache
    await setCache(`password_reset:${token}`, null, 1);

    // Invalidate all existing sessions
    const deleteSessionsQuery = `
      DELETE FROM user_sessions 
      WHERE user_id = $1
    `;

    await executeQuery(deleteSessionsQuery, [resetData.user_id]);

    winston.info(`Password reset for user: ${resetData.email} (${resetData.user_id})`);

    res.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.'
    });

  } catch (error) {
    winston.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      code: 'RESET_ERROR'
    });
  }
});

// =====================================================
// REFRESH TOKEN
// =====================================================

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    // Verify refresh token
    const { valid, payload, error } = require('../middleware/authMiddleware').verifyRefreshToken(token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
        error: error
      });
    }

    // Check if user exists and is active
    const getUserQuery = `
      SELECT user_id, email, first_name, last_name, account_status, role
      FROM users 
      WHERE user_id = $1 AND deleted_at IS NULL
    `;

    const userResult = await executeQuery(getUserQuery, [payload.user_id]);

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

    winston.info(`Token refreshed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresIn: newTokens.expiresIn
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
});

// =====================================================
// LOGOUT
// =====================================================

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Delete session from database
    const deleteSessionQuery = `
      DELETE FROM user_sessions 
      WHERE user_id = $1
    `;

    await executeQuery(deleteSessionQuery, [req.user.user_id]);

    // Clear Redis session
    await setCache(`session:${req.user.user_id}`, null, 1);

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
});

// =====================================================
// GET CURRENT USER
// =====================================================

router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Get user profile
    const getProfileQuery = `
      SELECT up.test_preferences, up.privacy_settings
      FROM user_profiles up
      WHERE up.user_id = $1
    `;

    const profileResult = await executeQuery(getProfileQuery, [req.user.user_id]);
    const profile = profileResult.rows[0] || {};

    res.json({
      success: true,
      data: {
        user: {
          user_id: req.user.user_id,
          email: req.user.email,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          role: req.user.role
        },
        profile: profile
      }
    });

  } catch (error) {
    winston.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      code: 'USER_INFO_ERROR'
    });
  }
});

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.post('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const getUserQuery = `
      SELECT password_hash
      FROM users 
      WHERE user_id = $1
    `;

    const userResult = await executeQuery(getUserQuery, [req.user.user_id]);
    const currentHash = userResult.rows[0].password_hash;

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, currentHash);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        code: 'INCORRECT_CURRENT_PASSWORD'
      });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    const updatePasswordQuery = `
      UPDATE users 
      SET password_hash = $1, updated_at = NOW()
      WHERE user_id = $2
    `;

    await executeQuery(updatePasswordQuery, [newPasswordHash, req.user.user_id]);

    // Invalidate all existing sessions
    const deleteSessionsQuery = `
      DELETE FROM user_sessions 
      WHERE user_id = $1
    `;

    await executeQuery(deleteSessionsQuery, [req.user.user_id]);

    winston.info(`Password changed for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });

  } catch (error) {
    winston.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

module.exports = router; 
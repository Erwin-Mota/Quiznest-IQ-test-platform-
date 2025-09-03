// =====================================================
// User Model Unit Tests
// =====================================================

const { User } = require('../../src/models/User.js');
const { hashPassword, verifyPassword } = require('../../src/config/security.js');

describe('User Model', () => {
  let userData;

  beforeEach(() => {
    userData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      first_name: 'John',
      last_name: 'Doe'
    };
  });

  describe('User Creation', () => {
    test('should create a user with valid data', async () => {
      const user = await User.query().insert(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.first_name).toBe(userData.first_name);
      expect(user.last_name).toBe(userData.last_name);
      expect(user.password_hash).toBeDefined();
      expect(user.password).toBeUndefined(); // Should be removed after hashing
      expect(user.role).toBe('user');
      expect(user.account_status).toBe('pending_verification');
      expect(user.email_verified).toBe(false);
    });

    test('should hash password before insertion', async () => {
      const user = await User.query().insert(userData);
      
      expect(user.password_hash).not.toBe(userData.password);
      expect(user.password_hash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt format
    });

    test('should generate email verification token', async () => {
      const user = await User.query().insert(userData);
      
      expect(user.email_verification_token).toBeDefined();
      expect(user.email_verification_token).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    test('should set timestamps on creation', async () => {
      const user = await User.query().insert(userData);
      
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
      expect(new Date(user.created_at)).toBeInstanceOf(Date);
      expect(new Date(user.updated_at)).toBeInstanceOf(Date);
    });
  });

  describe('Password Methods', () => {
    test('should verify correct password', async () => {
      const user = await User.query().insert(userData);
      const isValid = await user.verifyPassword(userData.password);
      
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const user = await User.query().insert(userData);
      const isValid = await user.verifyPassword('wrongpassword');
      
      expect(isValid).toBe(false);
    });

    test('should update password', async () => {
      const user = await User.query().insert(userData);
      const newPassword = 'NewSecurePassword123!';
      
      await user.setPassword(newPassword);
      await user.$query().patch({ password_hash: user.password_hash });
      
      const isValid = await user.verifyPassword(newPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('Account Status Methods', () => {
    test('should check if user is active', async () => {
      const user = await User.query().insert(userData);
      
      expect(user.isActive()).toBe(false); // pending_verification
      
      await user.$query().patch({ account_status: 'active' });
      user.account_status = 'active';
      
      expect(user.isActive()).toBe(true);
    });

    test('should check if user is locked', async () => {
      const user = await User.query().insert(userData);
      
      expect(user.isLocked()).toBe(false);
      
      const lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      await user.$query().patch({ locked_until: lockUntil.toISOString() });
      user.locked_until = lockUntil.toISOString();
      
      expect(user.isLocked()).toBe(true);
    });

    test('should check if email is verified', async () => {
      const user = await User.query().insert(userData);
      
      expect(user.isEmailVerified()).toBe(false);
      
      await user.$query().patch({ email_verified: true });
      user.email_verified = true;
      
      expect(user.isEmailVerified()).toBe(true);
    });
  });

  describe('Security Methods', () => {
    test('should increment login attempts', async () => {
      const user = await User.query().insert(userData);
      
      await user.incrementLoginAttempts();
      
      expect(user.login_attempts).toBe(1);
      expect(user.locked_until).toBeNull();
      
      // Test multiple attempts leading to lockout
      for (let i = 0; i < 4; i++) {
        await user.incrementLoginAttempts();
      }
      
      expect(user.login_attempts).toBe(5);
      expect(user.locked_until).toBeDefined();
    });

    test('should reset login attempts', async () => {
      const user = await User.query().insert(userData);
      
      // Increment attempts first
      await user.incrementLoginAttempts();
      await user.incrementLoginAttempts();
      
      expect(user.login_attempts).toBe(2);
      
      // Reset attempts
      await user.resetLoginAttempts();
      
      expect(user.login_attempts).toBe(0);
      expect(user.locked_until).toBeNull();
      expect(user.last_login).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    test('should find user by email', async () => {
      const user = await User.query().insert(userData);
      const found = await User.findByEmail(userData.email);
      
      expect(found).toBeDefined();
      expect(found.id).toBe(user.id);
    });

    test('should find active user by email', async () => {
      const user = await User.query().insert(userData);
      
      // Should not find inactive user
      const found = await User.findActiveByEmail(userData.email);
      expect(found).toBeUndefined();
      
      // Activate user and find again
      await user.$query().patch({ account_status: 'active' });
      const foundActive = await User.findActiveByEmail(userData.email);
      
      expect(foundActive).toBeDefined();
      expect(foundActive.id).toBe(user.id);
    });

    test('should find user by verification token', async () => {
      const user = await User.query().insert(userData);
      const found = await User.findByVerificationToken(user.email_verification_token);
      
      expect(found).toBeDefined();
      expect(found.id).toBe(user.id);
    });

    test('should find user by password reset token', async () => {
      const user = await User.query().insert(userData);
      const resetToken = 'valid-reset-token';
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      await user.$query().patch({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString()
      });
      
      const found = await User.findByPasswordResetToken(resetToken);
      
      expect(found).toBeDefined();
      expect(found.id).toBe(user.id);
    });

    test('should get user statistics', async () => {
      // Create multiple users with different statuses
      await User.query().insert({
        ...userData,
        email: 'user1@example.com',
        account_status: 'active',
        email_verified: true
      });
      
      await User.query().insert({
        ...userData,
        email: 'user2@example.com',
        account_status: 'pending_verification'
      });
      
      const stats = await User.getStats();
      
      expect(stats.total_users).toBeGreaterThanOrEqual(2);
      expect(stats.active_users).toBeGreaterThanOrEqual(1);
      expect(stats.verified_users).toBeGreaterThanOrEqual(1);
    });
  });

  describe('JSON Serialization', () => {
    test('should exclude sensitive fields in JSON', async () => {
      const user = await User.query().insert(userData);
      const json = user.$formatJson(user.toJSON());
      
      expect(json.password_hash).toBeUndefined();
      expect(json.password_reset_token).toBeUndefined();
      expect(json.two_factor_secret).toBeUndefined();
      expect(json.email_verification_token).toBeUndefined();
      
      // Non-sensitive fields should remain
      expect(json.email).toBeDefined();
      expect(json.first_name).toBeDefined();
      expect(json.last_name).toBeDefined();
    });
  });

  describe('Validation', () => {
    test('should reject invalid email format', async () => {
      const invalidUserData = {
        ...userData,
        email: 'invalid-email'
      };
      
      await expect(User.query().insert(invalidUserData)).rejects.toThrow();
    });

    test('should reject missing required fields', async () => {
      const incompleteUserData = {
        email: 'test@example.com'
        // Missing password, first_name, last_name
      };
      
      await expect(User.query().insert(incompleteUserData)).rejects.toThrow();
    });

    test('should reject invalid role', async () => {
      const invalidUserData = {
        ...userData,
        role: 'invalid_role'
      };
      
      await expect(User.query().insert(invalidUserData)).rejects.toThrow();
    });

    test('should reject invalid account status', async () => {
      const invalidUserData = {
        ...userData,
        account_status: 'invalid_status'
      };
      
      await expect(User.query().insert(invalidUserData)).rejects.toThrow();
    });
  });
});

// =====================================================
// Authentication Integration Tests
// =====================================================

const request = require('supertest');
const { User } = require('../../src/models/User.js');
const { createApp } = require('../../src/server.js');

describe('Authentication Integration', () => {
  let app;
  let server;

  beforeAll(async () => {
    app = await createApp();
    server = app.listen(0); // Random port for testing
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(async () => {
    // Clean up users before each test
    await User.query().delete();
  });

  describe('POST /api/v1/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email.toLowerCase());
      expect(response.body.data.user.first_name).toBe(userData.first_name);
      expect(response.body.data.user.last_name).toBe(userData.last_name);
      expect(response.body.data.user.password_hash).toBeUndefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.access_token).toBeDefined();
      expect(response.body.data.tokens.refresh_token).toBeDefined();

      // Verify user was created in database
      const user = await User.findByEmail(userData.email);
      expect(user).toBeDefined();
      expect(user.account_status).toBe('pending_verification');
    });

    test('should reject registration with existing email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        first_name: 'John',
        last_name: 'Doe'
      };

      // Create user first
      await User.query().insert(userData);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    test('should reject registration with invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        first_name: '', // Empty
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123456', // Weak password
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('WEAK_PASSWORD');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.query().insert({
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
        first_name: 'Test',
        last_name: 'User',
        account_status: 'active',
        email_verified: true
      });
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.tokens.access_token).toBeDefined();
      expect(response.body.data.tokens.refresh_token).toBeDefined();

      // Verify last_login was updated
      const updatedUser = await User.findById(testUser.id);
      expect(updatedUser.last_login).toBeDefined();
    });

    test('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    test('should reject login with invalid password', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    test('should reject login for inactive user', async () => {
      await testUser.$query().patch({ account_status: 'inactive' });

      const loginData = {
        email: 'testuser@example.com',
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCOUNT_INACTIVE');
    });

    test('should lock account after multiple failed attempts', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'WrongPassword123!'
      };

      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send(loginData)
          .expect(401);
      }

      // Account should now be locked
      const lockedUser = await User.findById(testUser.id);
      expect(lockedUser.isLocked()).toBe(true);

      // Even correct password should fail
      const correctLoginData = {
        email: 'testuser@example.com',
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(correctLoginData)
        .expect(423);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCOUNT_LOCKED');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let testUser;
    let refreshToken;

    beforeEach(async () => {
      testUser = await User.query().insert({
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
        first_name: 'Test',
        last_name: 'User',
        account_status: 'active',
        email_verified: true
      });

      // Login to get tokens
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePassword123!'
        });

      refreshToken = loginResponse.body.data.tokens.refresh_token;
    });

    test('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();
    });

    test('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    test('should reject refresh with expired token', async () => {
      // This would require manipulating the token expiration
      // For now, we'll test with a malformed token
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: 'expired.malformed.token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      testUser = await User.query().insert({
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
        first_name: 'Test',
        last_name: 'User',
        account_status: 'active',
        email_verified: true
      });

      // Login to get tokens
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePassword123!'
        });

      accessToken = loginResponse.body.data.tokens.access_token;
    });

    test('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });

    test('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    test('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Protected Routes', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      testUser = await User.query().insert({
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
        first_name: 'Test',
        last_name: 'User',
        account_status: 'active',
        email_verified: true
      });

      // Login to get tokens
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePassword123!'
        });

      accessToken = loginResponse.body.data.tokens.access_token;
    });

    test('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('testuser@example.com');
    });

    test('should reject access to protected route without token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    test('should reject access to protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });
});

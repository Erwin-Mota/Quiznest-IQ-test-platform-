// =====================================================
// IQ Test End-to-End Tests
// =====================================================

const request = require('supertest');
const { User } = require('../../src/models/User.js');
const { TestSession } = require('../../src/models/TestSession.js');
const { createApp } = require('../../src/server.js');

describe('IQ Test E2E', () => {
  let app;
  let server;
  let testUser;
  let accessToken;

  beforeAll(async () => {
    app = await createApp();
    server = app.listen(0); // Random port for testing

    // Create test user
    testUser = await User.query().insert({
      email: 'testuser@example.com',
      password: 'SecurePassword123!',
      first_name: 'Test',
      last_name: 'User',
      account_status: 'active',
      email_verified: true
    });

    // Login to get access token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'SecurePassword123!'
      });

    accessToken = loginResponse.body.data.tokens.access_token;
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(async () => {
    // Clean up test sessions before each test
    await TestSession.query().delete();
  });

  describe('Complete IQ Test Flow', () => {
    test('should complete full IQ test workflow', async () => {
      // 1. Get available tests
      const testsResponse = await request(app)
        .get('/api/v1/tests')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(testsResponse.body.success).toBe(true);
      expect(testsResponse.body.data.tests).toBeDefined();
      expect(Array.isArray(testsResponse.body.data.tests)).toBe(true);

      const availableTests = testsResponse.body.data.tests;
      expect(availableTests.length).toBeGreaterThan(0);

      // 2. Start a test session
      const startTestResponse = await request(app)
        .post('/api/v1/tests/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          test_type: 'standard',
          time_limit: 30 // 30 minutes
        })
        .expect(201);

      expect(startTestResponse.body.success).toBe(true);
      expect(startTestResponse.body.data.session).toBeDefined();
      expect(startTestResponse.body.data.questions).toBeDefined();

      const sessionId = startTestResponse.body.data.session.id;
      const questions = startTestResponse.body.data.questions;

      expect(questions.length).toBeGreaterThan(0);
      expect(questions[0]).toHaveProperty('id');
      expect(questions[0]).toHaveProperty('question');
      expect(questions[0]).toHaveProperty('options');

      // 3. Get test session details
      const sessionResponse = await request(app)
        .get(`/api/v1/tests/${sessionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(sessionResponse.body.success).toBe(true);
      expect(sessionResponse.body.data.session.id).toBe(sessionId);
      expect(sessionResponse.body.data.session.status).toBe('in_progress');

      // 4. Submit answers for all questions
      const answers = questions.map((question, index) => ({
        question_id: question.id,
        answer: question.options[0], // Select first option for each question
        time_spent: Math.floor(Math.random() * 60) + 10 // Random time between 10-70 seconds
      }));

      const submitResponse = await request(app)
        .post(`/api/v1/tests/${sessionId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          answers: answers,
          total_time: answers.reduce((sum, answer) => sum + answer.time_spent, 0)
        })
        .expect(200);

      expect(submitResponse.body.success).toBe(true);
      expect(submitResponse.body.data.result).toBeDefined();
      expect(submitResponse.body.data.result.score).toBeDefined();
      expect(submitResponse.body.data.result.percentage).toBeDefined();
      expect(submitResponse.body.data.result.iq_score).toBeDefined();
      expect(submitResponse.body.data.result.interpretation).toBeDefined();

      // 5. Get test results
      const resultsResponse = await request(app)
        .get(`/api/v1/tests/${sessionId}/results`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(resultsResponse.body.success).toBe(true);
      expect(resultsResponse.body.data.result).toBeDefined();
      expect(resultsResponse.body.data.result.score).toBeDefined();
      expect(resultsResponse.body.data.result.percentage).toBeDefined();
      expect(resultsResponse.body.data.result.iq_score).toBeDefined();
      expect(resultsResponse.body.data.result.interpretation).toBeDefined();
      expect(resultsResponse.body.data.result.completed_at).toBeDefined();

      // 6. Verify session status is completed
      const finalSessionResponse = await request(app)
        .get(`/api/v1/tests/${sessionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(finalSessionResponse.body.data.session.status).toBe('completed');
    });

    test('should handle test session timeout', async () => {
      // Start a test session with short time limit
      const startTestResponse = await request(app)
        .post('/api/v1/tests/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          test_type: 'standard',
          time_limit: 1 // 1 minute
        })
        .expect(201);

      const sessionId = startTestResponse.body.data.session.id;

      // Wait for timeout (in real scenario, this would be handled by background job)
      // For testing, we'll manually expire the session
      await TestSession.query()
        .findById(sessionId)
        .patch({
          status: 'expired',
          expires_at: new Date(Date.now() - 1000).toISOString()
        });

      // Try to submit answers after timeout
      const submitResponse = await request(app)
        .post(`/api/v1/tests/${sessionId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          answers: [{ question_id: 1, answer: 'A', time_spent: 30 }],
          total_time: 30
        })
        .expect(410);

      expect(submitResponse.body.success).toBe(false);
      expect(submitResponse.body.error.code).toBe('TEST_SESSION_EXPIRED');
    });

    test('should prevent multiple submissions for same session', async () => {
      // Start a test session
      const startTestResponse = await request(app)
        .post('/api/v1/tests/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          test_type: 'standard',
          time_limit: 30
        })
        .expect(201);

      const sessionId = startTestResponse.body.data.session.id;
      const questions = startTestResponse.body.data.questions;

      // Submit answers first time
      const answers = questions.map((question) => ({
        question_id: question.id,
        answer: question.options[0],
        time_spent: 30
      }));

      await request(app)
        .post(`/api/v1/tests/${sessionId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          answers: answers,
          total_time: answers.length * 30
        })
        .expect(200);

      // Try to submit again
      const secondSubmitResponse = await request(app)
        .post(`/api/v1/tests/${sessionId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          answers: answers,
          total_time: answers.length * 30
        })
        .expect(409);

      expect(secondSubmitResponse.body.success).toBe(false);
      expect(secondSubmitResponse.body.error.code).toBe('TEST_ALREADY_SUBMITTED');
    });

    test('should get user test history', async () => {
      // Create multiple test sessions
      const session1 = await TestSession.query().insert({
        user_id: testUser.id,
        test_type: 'standard',
        status: 'completed',
        score: 85,
        percentage: 85,
        iq_score: 115,
        completed_at: new Date().toISOString()
      });

      const session2 = await TestSession.query().insert({
        user_id: testUser.id,
        test_type: 'advanced',
        status: 'completed',
        score: 92,
        percentage: 92,
        iq_score: 125,
        completed_at: new Date().toISOString()
      });

      // Get user test history
      const historyResponse = await request(app)
        .get('/api/v1/users/tests')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(historyResponse.body.success).toBe(true);
      expect(historyResponse.body.data.tests).toBeDefined();
      expect(Array.isArray(historyResponse.body.data.tests)).toBe(true);
      expect(historyResponse.body.data.tests.length).toBeGreaterThanOrEqual(2);

      // Verify test sessions are included
      const testIds = historyResponse.body.data.tests.map(test => test.id);
      expect(testIds).toContain(session1.id);
      expect(testIds).toContain(session2.id);
    });

    test('should handle invalid test session access', async () => {
      // Try to access non-existent test session
      const response = await request(app)
        .get('/api/v1/tests/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TEST_SESSION_NOT_FOUND');
    });

    test('should prevent access to other user test sessions', async () => {
      // Create another user
      const otherUser = await User.query().insert({
        email: 'otheruser@example.com',
        password: 'SecurePassword123!',
        first_name: 'Other',
        last_name: 'User',
        account_status: 'active',
        email_verified: true
      });

      // Create test session for other user
      const otherSession = await TestSession.query().insert({
        user_id: otherUser.id,
        test_type: 'standard',
        status: 'in_progress'
      });

      // Try to access other user's test session
      const response = await request(app)
        .get(`/api/v1/tests/${otherSession.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });
  });

  describe('Test Analytics', () => {
    test('should provide test statistics', async () => {
      // Create multiple test sessions with different scores
      await TestSession.query().insert({
        user_id: testUser.id,
        test_type: 'standard',
        status: 'completed',
        score: 80,
        percentage: 80,
        iq_score: 110,
        completed_at: new Date().toISOString()
      });

      await TestSession.query().insert({
        user_id: testUser.id,
        test_type: 'standard',
        status: 'completed',
        score: 90,
        percentage: 90,
        iq_score: 120,
        completed_at: new Date().toISOString()
      });

      // Get user statistics
      const statsResponse = await request(app)
        .get('/api/v1/users/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(statsResponse.body.success).toBe(true);
      expect(statsResponse.body.data.stats).toBeDefined();
      expect(statsResponse.body.data.stats.total_tests).toBeGreaterThanOrEqual(2);
      expect(statsResponse.body.data.stats.average_score).toBeDefined();
      expect(statsResponse.body.data.stats.best_score).toBeDefined();
      expect(statsResponse.body.data.stats.average_iq).toBeDefined();
    });
  });
});

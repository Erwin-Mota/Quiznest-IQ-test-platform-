# IQ Test Platform - JavaScript Native Backend

A secure, scalable, and production-ready backend for an IQ test platform built with JavaScript-native technologies.

## �� Features

- **Fastify Framework**: High-performance HTTP server
- **PostgreSQL Database**: Robust data persistence with Objection.js ORM
- **Redis Caching**: High-speed caching and session management
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: DDoS protection and abuse prevention
- **Input Validation**: Comprehensive request validation with Ajv
- **Security Headers**: Production-ready security configurations
- **Error Handling**: Structured error responses and logging
- **Health Monitoring**: Built-in health checks and metrics
- **Email Integration**: SMTP-based email notifications
- **File Storage**: Local and S3-compatible storage support
- **Background Jobs**: Queue-based job processing with BullMQ
- **Real-time Features**: WebSocket support with Socket.IO
- **Observability**: Structured logging with Pino and Sentry integration

## 🏗️ Architecture

```
backend-js-native/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/          # Database models
│   ├── plugins/         # Fastify plugins
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── migrations/          # Database migrations
├── seeds/              # Database seeders
├── tests/              # Test files
├── uploads/            # File uploads (local storage)
├── logs/               # Application logs
├── .env.example        # Environment variables template
└── package.json        # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL 14+
- **ORM**: Objection.js 3.x with Knex.js
- **Cache**: Redis 7+
- **Authentication**: Passport.js with JWT
- **Validation**: Ajv JSON Schema
- **Logging**: Pino
- **Monitoring**: Sentry
- **Queue**: BullMQ
- **WebSockets**: Socket.IO
- **Storage**: Local filesystem + S3/R2

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 14.0 or higher
- Redis 7.0 or higher
- npm 9.0.0 or higher

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend-js-native
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb iq_test_platform

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

- **Database**: PostgreSQL connection settings
- **Redis**: Redis connection settings  
- **JWT**: Secret keys for token signing
- **Email**: SMTP configuration
- **Storage**: File storage settings
- **Security**: Rate limiting and security options

### Database Schema

The platform includes these main entities:

- **Users**: User accounts with authentication
- **TestSessions**: IQ test session tracking
- **TestResults**: Test results and scoring
- **Questions**: IQ test questions and answers
- **AuditLogs**: Security and activity logging

## 🔐 Security Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Per-IP and per-user limits
- **Security Headers**: Helmet.js integration
- **Password Security**: Bcrypt with configurable rounds
- **Account Protection**: Login attempt limiting
- **Audit Logging**: Security event tracking
- **CORS**: Configurable cross-origin policies
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Input sanitization

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset

### Tests
- `GET /api/v1/tests` - List available tests
- `POST /api/v1/tests/start` - Start new test session
- `GET /api/v1/tests/:id` - Get test details
- `POST /api/v1/tests/:id/submit` - Submit test answers
- `GET /api/v1/tests/:id/results` - Get test results

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/tests` - Get user's test history

### Admin
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/stats` - Platform statistics
- `GET /api/v1/admin/audit-logs` - Security audit logs

### System
- `GET /health` - Health check
- `GET /api/v1/status` - Detailed system status
- `GET /api/v1/metrics` - Application metrics

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "User Model"
```

## 📈 Monitoring

### Health Checks

- `GET /health` - Basic health status
- `GET /api/v1/status` - Detailed system status
- `GET /api/v1/metrics` - Application metrics

### Logging

Structured JSON logging with Pino:

```bash
# View logs
tail -f logs/app.log

# Filter by level
tail -f logs/app.log | jq 'select(.level >= 40)'
```

### Error Tracking

Sentry integration for production error monitoring:

- Automatic error capture
- Performance monitoring
- Release tracking
- User context

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT secrets
- [ ] Set up PostgreSQL with SSL
- [ ] Configure Redis with authentication
- [ ] Set up SMTP email service
- [ ] Configure file storage (S3/R2)
- [ ] Set up monitoring (Sentry)
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates
- [ ] Configure backup strategy

### Docker Deployment

```bash
# Build image
docker build -t iq-test-backend .

# Run container
docker run -p 5000:5000 --env-file .env iq-test-backend
```

### Environment-Specific Configs

- **Development**: Full logging, hot reload
- **Staging**: Production-like with debug features
- **Production**: Optimized performance, minimal logging

## 🔧 Development

### Code Structure

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and data processing
- **Models**: Database entities and relationships
- **Middleware**: Request/response processing
- **Plugins**: Fastify plugin configurations
- **Routes**: API endpoint definitions
- **Utils**: Shared utility functions

### Adding New Features

1. Create database migration
2. Add model with validation
3. Create service layer
4. Add controller methods
5. Define API routes
6. Add tests
7. Update documentation

### Database Migrations

```bash
# Create new migration
npm run migrate:make create_new_table

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:rollback
```

## 📚 API Documentation

### Request/Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run linting and tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issue for bugs
- **Security**: Report security issues privately
- **Questions**: Use GitHub discussions

## 🔄 Migration from Express/TypeScript

This JavaScript-native backend provides:

- **Better Performance**: Fastify is faster than Express
- **Native JavaScript**: No TypeScript compilation overhead
- **Simpler Deployment**: No build step required
- **Better Validation**: Ajv JSON Schema validation
- **Enhanced Security**: Built-in security features
- **Production Ready**: Battle-tested in production environments

To migrate from the existing TypeScript backend:

1. Export data from existing database
2. Run new migrations
3. Import data to new schema
4. Update frontend API calls
5. Test thoroughly
6. Deploy new backend
7. Update DNS/load balancer

---

**Built with ❤️ for secure, scalable IQ testing platforms**

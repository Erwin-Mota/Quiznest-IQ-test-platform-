# Advanced IQ Test Platform

A comprehensive cognitive assessment platform built with modern full-stack technologies. This project demonstrates enterprise-grade software architecture, security best practices, and scalable design patterns.

## Project Overview

This IQ testing platform evolved from a simple Flask application to a robust, production-ready system. The journey involved migrating to React with TypeScript, implementing a secure Node.js backend, and designing a sophisticated PostgreSQL database schema. The project showcases full-stack development skills, database design expertise, and the ability to architect complex systems.

## Key Features

- **Advanced IQ Testing**: 40 sophisticated cognitive assessment questions with adaptive difficulty algorithms
- **Modern User Interface**: React-based interface with smooth animations and responsive design
- **Enterprise Security**: JWT authentication, rate limiting, input validation, and comprehensive security middleware
- **Real-time Analytics**: Comprehensive test scoring and statistical analysis
- **Payment Integration**: Stripe payment processing for premium features
- **Responsive Design**: Mobile-first approach with cross-platform compatibility

## Architecture & Tech Stack

### Frontend
- **React 18** with TypeScript for type safety and maintainability
- **Styled Components** for modern CSS-in-JS styling
- **Framer Motion** for smooth animations and transitions
- **React Router** for client-side navigation
- **Lucide React** for consistent iconography

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for server-side type safety and better development experience
- **PostgreSQL** with advanced database design including UUIDs, JSONB, and Row-Level Security
- **Redis** for caching, session management, and rate limiting
- **JWT** for secure authentication and authorization

### Database Design
- **Advanced Schema**: 15+ tables with proper relationships and constraints
- **Security**: Row-Level Security (RLS) and data encryption capabilities
- **Performance**: Extensive indexing, table partitioning, and query optimization
- **Scalability**: Connection pooling and efficient connection management

### Security Features
- **Helmet.js** for security headers and protection
- **Rate Limiting** with Redis integration for abuse prevention
- **Input Validation** using Joi and express-validator
- **XSS Protection** and SQL injection prevention
- **CORS** configuration and comprehensive security middleware

## Technical Implementation

### IQ Test Algorithm
- **Multi-dimensional scoring** with age-adjusted calculations
- **Statistical analysis** using standard deviation and percentile ranking
- **Adaptive difficulty** based on user performance patterns
- **Question calibration** using Item Response Theory principles

### Performance Optimization
- **Connection pooling** for database efficiency and scalability
- **Redis caching** for session and data storage optimization
- **Compression middleware** for response size reduction
- **Query optimization** with strategic indexing strategies

### Development Experience
- **Monorepo structure** with npm workspaces for efficient development
- **Hot reloading** with nodemon for backend development
- **TypeScript compilation** with strict type checking
- **ESLint and Prettier** for code quality and consistent formatting

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Quiznest-IQ-test-platform-.git
cd Quiznest-IQ-test-platform-

# Install dependencies
npm run install-deps

# Start development servers
npm run dev        # Backend only
npm run frontend   # Frontend only
npm start          # Both servers
```

### Environment Setup

```bash
# Backend environment variables
cd backend
cp env.example .env
# Configure your .env file with database and Redis credentials
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/refresh` - Token refresh

### Core Features
- `GET /api/v1/questions` - Retrieve test questions
- `POST /api/v1/tests` - Create test sessions
- `GET /api/v1/results` - Get test results
- `POST /api/v1/payments` - Process payments

### Admin & Analytics
- `GET /api/v1/admin/users` - User management
- `GET /api/v1/admin/analytics` - Platform analytics
- `GET /api/v1/metrics` - System health metrics

## Development Commands

```bash
# Root level commands
npm start          # Start both servers
npm run dev        # Start backend in development mode
npm run frontend   # Start React development server
npm run build      # Build production version
npm run test       # Run test suite
npm run lint       # Lint code
npm run migrate    # Run database migrations

# Backend specific
cd backend
npm run dev        # Start with nodemon
npm run full       # Start full enterprise server
npm run test       # Run backend tests

# Frontend specific
cd iq-test-app
npm start          # Start React dev server
npm run build      # Build production bundle
npm run test       # Run frontend tests
```

## Performance & Security

### Performance Metrics
- **Response Time**: < 100ms for API endpoints
- **Database Queries**: Optimized with connection pooling
- **Memory Usage**: Efficient Redis caching strategy
- **Scalability**: Designed for horizontal scaling

### Security Implementation
- **Authentication**: JWT-based with refresh token rotation
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Input sanitization and validation
- **Rate Limiting**: IP-based request throttling
- **Security Headers**: Comprehensive security middleware

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Support
```bash
docker-compose up -d
```

### Environment Variables
- Database connection strings
- Redis configuration
- JWT secrets
- Payment API keys
- Security settings

## Project Structure

```
Quiznest-IQ-test-platform-/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # Database and Redis configuration
│   │   ├── middleware/     # Authentication and security
│   │   ├── routes/         # API endpoints
│   │   └── server.js       # Main server file
│   └── package.json
├── iq-test-app/            # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── data/           # Question data and generators
│   │   └── types/          # TypeScript interfaces
│   └── package.json
├── database/                # PostgreSQL schema and migrations
├── templates/               # Legacy Flask implementation
└── package.json            # Root package.json with scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Team for the frontend framework
- Express.js for the backend framework
- PostgreSQL for the database system
- Redis for high-performance caching

## Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your Name](https://linkedin.com/in/yourprofile)
- **Portfolio**: [yourwebsite.com](https://yourwebsite.com)

---

*Built with modern web technologies* 
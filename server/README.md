# DevSwap.live Backend

A comprehensive skill-swapping platform backend that connects developers for peer-to-peer learning sessions with AI-powered lesson generation and real-time collaboration features.

## 🚀 Features

- **Authentication & Authorization**: JWT-based secure authentication
- **Skill Matching**: Redis-powered intelligent matching system
- **AI-Powered Learning**: OpenAI integration for lesson plan generation
- **Real-time Communication**: WebRTC signaling and collaborative features
- **Session Management**: Complete session lifecycle management
- **Health Monitoring**: Comprehensive health checks and metrics
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Production Ready**: Docker containerization, testing, and monitoring

## 🏗️ Architecture

### Core Services
- **Auth Service**: User registration, login, profile management
- **User Service**: Profile management, skill tracking, search
- **Matching Service**: Skill-based user matching with Redis
- **Session Service**: Learning session lifecycle management
- **AI Service**: Lesson plan generation and session summaries
- **Signaling Service**: WebRTC signaling and real-time features

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for matching and caching
- **AI**: OpenAI GPT-4 for content generation
- **Real-time**: Socket.io for WebSocket communication
- **Testing**: Jest with MongoDB Memory Server
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker & Docker Compose

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB 6.0+
- Redis 7+
- OpenAI API key

### Quick Start

1. **Clone and install dependencies**:
```bash
cd server
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Development mode**:
```bash
npm run dev
```

4. **Production build**:
```bash
npm run build
npm start
```

### Docker Deployment

1. **Build and run with Docker Compose**:
```bash
docker-compose up -d
```

2. **Development with Docker**:
```bash
docker-compose -f docker-compose.dev.yml up
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

See `.env.example` for complete configuration options.

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📚 API Documentation

- **Interactive Docs**: http://localhost:5000/api-docs
- **OpenAPI Spec**: http://localhost:5000/api-docs.json
- **Health Check**: http://localhost:5000/api/health

### Key Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `POST /api/match/join` - Join matching pool
- `POST /api/sessions/join` - Join learning session
- `POST /api/ai/lesson-plan` - Generate AI lesson plan

## 🔍 Monitoring & Health Checks

### Health Endpoints
- `/api/health` - Overall health status
- `/api/health/ready` - Kubernetes readiness probe
- `/api/health/live` - Kubernetes liveness probe
- `/api/health/metrics` - Application metrics

### Monitoring Features
- Database connection monitoring
- Redis connectivity checks
- OpenAI API availability
- Memory and CPU usage metrics
- Request rate limiting and logging

## 🛠️ Development

### Scripts
```bash
npm run dev          # Development with hot reload
npm run build        # TypeScript compilation
npm run lint         # ESLint code checking
npm run lint:fix     # Auto-fix linting issues
npm run test         # Run test suite
npm run docker:build # Build Docker image
```

### Code Quality
- **TypeScript**: Strong typing and compile-time checks
- **ESLint**: Code linting and style enforcement
- **Jest**: Unit and integration testing
- **Prettier**: Code formatting (recommended)

## 🚀 Deployment

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure MongoDB Atlas or production database
- [ ] Set up Redis instance
- [ ] Obtain OpenAI API key
- [ ] Configure CORS for production frontend
- [ ] Set up monitoring and logging
- [ ] Configure SSL/TLS certificates

### Docker Production
```bash
# Build production image
docker build -t devswap-backend .

# Run with environment file
docker run --env-file .env -p 5000:5000 devswap-backend
```

## 🔐 Security Features

- JWT authentication with secure token handling
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Security headers (XSS, CSRF protection)
- Password hashing with bcrypt
- Environment variable validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the health status at `/api/health`

---

**DevSwap.live** - Connecting developers through skill exchange 🚀
# Deployment triggered at Monday 08 September 2025 01:40:58 AM IST

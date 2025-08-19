# DevSwap.live

DevSwap.live is a peer-to-peer skill-swapping platform that connects learners for live, real-time sessions with AI-assisted lesson plans, WebRTC video, synchronized code editing, and chat. This monorepo contains both the backend server (Express + MongoDB + Redis + Socket.io) and the frontend web app (React + Vite + Tailwind CSS), with first-class developer tooling and tests.

## Table of Contents
- Overview
- Features
- Tech Stack
- Repository Structure
- Architecture
- Prerequisites
- Setup & Installation
- Environment Variables
- Running in Development
- Testing
- Build & Production
- Docker & Compose
- API Overview
- Realtime Features
- Security & Best Practices
- Troubleshooting
- Scripts Reference
- Contributing
- License

---

## Overview
DevSwap.live enables people to teach and learn skills from each other in exchange sessions. The platform matches users by skills and experience level, facilitates scheduling and live calls, and leverages AI to generate lesson plans and summaries.

- Backend: Express REST API, MongoDB for persistence, Redis for matching and caching, OpenAI for AI features, Socket.io for realtime signaling and collaboration.
- Frontend: React + Vite SPA with Tailwind, routing, auth, and real-time client.

## Features
- Authentication (register/login/logout, profiles, skills)
- Skill matching with Redis-backed queues
- Session lifecycle: create, join, end
- WebRTC signaling via Socket.io
- Code editor sync and messaging
- AI lesson plans and session summaries (OpenAI)
- Swagger/OpenAPI docs (server)
- Test coverage for core services and controllers

## Tech Stack
- Backend: Node.js (>=18), TypeScript, Express 5, Mongoose, BullMQ, ioredis, Socket.io, OpenAI SDK, Winston
- Frontend: React 19, Vite 7, TypeScript, Tailwind CSS 4, React Router, Zustand, Socket.io client
- Datastores: MongoDB, Redis
- Infra: Docker, docker-compose
- Testing: Jest, Supertest, mongodb-memory-server
- Linting: ESLint, Typescript-ESLint

## Repository Structure
```
DevSwap.live/
├── Frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   └── main.tsx, App.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/                   # Express API + Socket.io
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── package.json
│   ├── docker-compose.yml
│   └── README.md (backend-only)
└── README.md (this file)
```

## Architecture
Microservice-inspired modular architecture within a single repo:
- API layer (Express): REST endpoints for auth, sessions, AI, matching, and users
- Realtime layer (Socket.io): WebRTC signaling, chat, editor sync, session status
- Data layer: MongoDB (persistent entities), Redis (queues, caching, locks)
- AI layer: OpenAI-backed lesson plan generation and session summaries with caching

Key backend modules:
- Models: User, Session, LessonPlan, plus centralized Skill data
- Controllers: Auth, AI, Session, Signaling, Match
- Services: AI service, Matching service (Redis-based)
- Middleware: AuthN/Z, rate limiting, logging, security

Frontend SPA communicates with the API and Socket.io in realtime, manages auth state, routes between pages, and renders the UI with Tailwind.

## Prerequisites
- Node.js >= 18, npm >= 8
- MongoDB (local or remote)
- Redis (local or remote)
- OpenAI API Key (for AI features)
- Docker & docker-compose (optional, for containerized runs)

## Setup & Installation
1) Clone and install dependencies
```
# from repo root
npm --version   # verify >=8
node --version  # verify >=18

# install frontend deps
cd Frontend
npm install

# in another terminal, install backend deps
cd server
npm install
```

2) Configure environment variables
- Backend: copy `server/.env.example` to `server/.env` and fill values
- Frontend: create `Frontend/.env` with the client variables below

## Environment Variables
Backend (`server/.env`)
Typical variables (see `server/.env.example` for full list):
```
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/devswap
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-strong-secret
OPENAI_API_KEY=sk-your-openai-key
```

Frontend (`Frontend/.env`)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Running in Development
Open two terminals:

Terminal 1 – Backend
```
cd server
npm run dev
```
- Starts Express with ts-node and nodemon at http://localhost:5000
- Health check: `GET /api/health`
- Swagger UI (if enabled): typically at `/api/docs`

Terminal 2 – Frontend
```
cd Frontend
npm run dev
```
- Starts Vite dev server at http://localhost:5173
- Proxies API calls if configured, otherwise uses `VITE_API_URL`

## Testing
Backend tests:
```
cd server
npm test            # run once
npm run test:watch  # watch mode
npm run test:coverage
```

## Build & Production
Backend:
```
cd server
npm run build   # compiles to dist/
npm start       # runs dist/index.js
```

Frontend:
```
cd Frontend
npm run build   # output in dist/
npm run preview # local preview
```

## Docker & Compose
The backend includes Docker configs for containerized development and deployment.

Build & run the backend image:
```
cd server
npm run docker:build
npm run docker:run   # exposes port 5000 by default
```

Compose (if using docker-compose.yml):
```
cd server
npm run docker:compose
```
This may spin up the API, Redis, and MongoDB depending on the compose file.

## API Overview
Primary REST endpoints (see server routes and Swagger for details):
- `/api/auth/*` – Authentication (register, login, logout, profile)
- `/api/sessions/*` – Session lifecycle (create, join, end)
- `/api/ai/*` – AI lesson plans and summaries (cached)
- `/api/match/*` – Skill matching (Redis-based)
- `/api/users/*` – User management

## Realtime Features
- WebRTC signaling via Socket.io
- Chat and code editor synchronization
- Session presence and status updates

## Security & Best Practices
- Helmet, CORS, and rate limiting on server
- JWT-based authentication
- Sensitive secrets in environment variables only
- Use HTTPS in production and configure CORS origins appropriately

## Troubleshooting
- Backend won’t start: Verify MongoDB and Redis are reachable and `.env` values are correct.
- CORS errors: Ensure `CLIENT_ORIGIN` (server) matches your frontend URL and Vite dev port.
- OpenAI errors: Double-check `OPENAI_API_KEY` and service availability.
- Socket.io connection issues: Confirm `VITE_SOCKET_URL` and backend port.

## Scripts Reference
Backend (`server/package.json`):
- `dev` – Nodemon + ts-node
- `build`, `build:watch` – TypeScript compilation
- `start` – Run compiled server
- `test`, `test:watch`, `test:coverage` – Jest test suite
- `lint`, `lint:fix` – ESLint
- `docker:build`, `docker:run`, `docker:compose` – Docker workflows
- `health` – Local health probe

Frontend (`Frontend/package.json`):
- `dev` – Vite dev server
- `build` – TypeScript build + Vite build
- `preview` – Preview production build
- `lint` – ESLint

## Contributing
1. Fork the repo and create a branch.
2. Make changes with clear commits and tests when applicable.
3. Run lints and tests locally.
4. Open a PR with a description of changes and screenshots when UI-related.

## License
MIT License. See `server/README.md` for backend-specific notes and license headers.

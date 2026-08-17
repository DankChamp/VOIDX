# VOIDX

<div align="center">

[![CI](https://github.com/DankChamp/VOIDX/actions/workflows/ci.yml/badge.svg)](https://github.com/DankChamp/VOIDX/actions/workflows/ci.yml)
[![CodeQL](https://github.com/DankChamp/VOIDX/actions/workflows/codeql.yml/badge.svg)](https://github.com/DankChamp/VOIDX/actions/workflows/codeql.yml)
[![Deploy Frontend](https://github.com/DankChamp/VOIDX/actions/workflows/deploy.yml/badge.svg)](https://github.com/DankChamp/VOIDX/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-00FF9C.svg)](https://opensource.org/licenses/MIT)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)

</div>

**PX Organization flagship — full-stack gaming platform with tournaments, authentication, notifications, and future wallet integration.**

---

## Architecture

```
VOIDX/
├── frontend/              # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level pages
│   │   ├── store/         # Zustand state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client, websocket
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # FastAPI + SQLAlchemy (async) + SQLite
│   ├── routes/            # API endpoints
│   │   ├── auth.py        # JWT authentication
│   │   ├── tournaments.py # Tournament CRUD, brackets
│   │   ├── notifications.py # Real-time notifications
│   │   └── wallet.py      # Future wallet integration
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── auth.py            # JWT utilities
│   ├── database.py        # Async DB session
│   ├── ai_sanitizer.py    # Content moderation
│   └── main.py            # FastAPI app entry
│
├── .github/workflows/     # CI/CD pipelines
├── render.yaml            # Render.com deployment config
├── Dockerfile             # Container image
└── docker-compose.yml     # Local development stack
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Zustand, React Router |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), aiosqlite, Pydantic |
| **Auth** | JWT (python-jose), bcrypt, OAuth-ready |
| **Real-time** | WebSocket (planned), Server-Sent Events |
| **AI** | Groq API for content moderation |
| **Deploy** | Render.com (backend + frontend), Docker |
| **CI/CD** | GitHub Actions (lint, typecheck, test, build, deploy) |

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| **User Auth** | ✅ | Register, login, JWT tokens, password hashing |
| **Tournaments** | 🚧 | Create, join, bracket generation, match reporting |
| **Notifications** | 🚧 | Real-time in-app notifications |
| **Wallet** | 📋 | Future: crypto wallet integration for prizes |
| **AI Moderation** | ✅ | Groq-powered content sanitization |
| **Leaderboards** | 📋 | Player rankings, stats, history |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- SQLite (included)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # configure secrets
python main.py        # runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # runs on http://localhost:5173
```

### Docker (full stack)
```bash
docker-compose up --build
```

---

## Configuration

### Backend (`.env`)
```bash
# Database
DATABASE_URL=sqlite+aiosqlite:///./voidx.db

# Auth
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Moderation (Groq)
GROQ_API_KEY=gsk_...

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login, returns JWT |
| `GET` | `/auth/me` | Get current user |
| `GET` | `/tournaments` | List tournaments |
| `POST` | `/tournaments` | Create tournament |
| `GET` | `/tournaments/{id}` | Get tournament details |
| `POST` | `/tournaments/{id}/join` | Join tournament |
| `GET` | `/notifications` | List user notifications |
| `WS` | `/ws/notifications` | Real-time notifications |

---

## Deployment

### Render.com (configured via `render.yaml`)
- **Backend**: Python web service, auto-deploys on push to main
- **Frontend**: Static site, builds via Vite, deploys to GitHub Pages

### Environment Variables (Render Dashboard)
Set these in Render for production:
- `SECRET_KEY` — strong random string
- `DATABASE_URL` — PostgreSQL URL (Render managed DB)
- `GROQ_API_KEY` — Groq API key
- `FRONTEND_URL` — production frontend URL
- `VITE_API_URL` — production backend URL

---

## Development

```bash
# Backend
cd backend
ruff check .           # lint
mypy .                 # type check
pytest -q              # test

# Frontend
cd frontend
npm run lint           # eslint (add script first)
npx tsc --noEmit       # type check
npm run build          # production build
```

---

## Project Structure for Contributors

### Backend (`/backend`)
```
├── main.py              # FastAPI app, middleware, lifespan
├── config.py            # Settings (Pydantic BaseSettings)
├── database.py          # Async engine, session factory
├── models.py            # SQLAlchemy models (User, Tournament, Match, Notification)
├── schemas.py           # Pydantic request/response models
├── auth.py              # JWT create/verify, password hashing
├── ai_sanitizer.py      # Groq API wrapper for content moderation
└── routes/
    ├── auth.py          # /auth/*
    ├── tournaments.py   # /tournaments/*
    ├── notifications.py # /notifications/*
    └── wallet.py        # /wallet/* (stub)
```

### Frontend (`/frontend/src`)
```
├── main.tsx             # App entry, providers
├── App.tsx              # Routes, layout
├── components/          # Button, Card, Modal, Input, etc.
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Tournaments.tsx
│   ├── TournamentDetail.tsx
│   └── Profile.tsx
├── store/               # Zustand stores (auth, tournaments, ui)
├── hooks/               # useAuth, useTournaments, useWebSocket
├── services/
│   ├── api.ts           # Axios instance, interceptors
│   └── websocket.ts     # WS connection manager
└── types/               # Shared TypeScript interfaces
```

---

## Roadmap

- [ ] Tournament bracket visualization (react-flow)
- [ ] WebSocket server for real-time match updates
- [ ] Email notifications (SendGrid/Resend)
- [ ] Wallet integration (Solana/Ethereum via Web3.js)
- [ ] Admin dashboard
- [ ] Mobile-responsive PWA
- [ ] Tournament seeding algorithms
- [ ] Spectator mode with live commentary

---

## Contributing

PRs welcome! Please:

1. Fork the repo & create a feature branch
2. Run lint/typecheck/test for both frontend and backend locally
3. Follow existing code style
4. Add tests for new functionality
5. Open a PR with a clear description

```bash
# Quick validation (both)
cd backend && ruff check . && mypy . && pytest -q
cd ../frontend && npx tsc --noEmit && npm run build
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.
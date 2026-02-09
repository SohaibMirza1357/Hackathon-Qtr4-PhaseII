# Implementation Plan: Todo Full-Stack Web Application

**Branch**: `001-todo-fullstack-app` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-fullstack-app/spec.md`

## Summary

Transform the console-based Todo application into a secure, multi-user
full-stack web application. The backend is a Python FastAPI REST API
using SQLModel for ORM and Neon PostgreSQL for persistence. The frontend
is a Next.js 16+ App Router application with Better Auth handling user
signup/signin and JWT issuance. The FastAPI backend independently
verifies JWTs using the shared BETTER_AUTH_SECRET. All task data is
scoped to the authenticated user.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Node.js 18+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel, PyJWT (backend); Next.js 16+, Better Auth, Tailwind CSS (frontend)
**Storage**: Neon Serverless PostgreSQL via `psycopg2-binary`
**Testing**: Manual verification (hackathon scope)
**Target Platform**: Web (desktop + mobile browsers)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Reasonable for hackathon (10 concurrent users, <5s CRUD operations)
**Constraints**: Stateless backend, JWT-only auth, no sessions on backend
**Scale/Scope**: 10 concurrent users, 2 entities, 6 API endpoints, 4 frontend routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Spec-First Development | PASS | Spec written and approved before this plan. All features trace to FR-001–FR-017. |
| II | Deterministic Behavior | PASS | REST API returns predictable responses. No implicit state. Backend is stateless. |
| III | Security by Design | PASS | JWT verified on every request (R2). Ownership checked in every query (data-model.md). Secrets in env vars (R6). |
| IV | Separation of Concerns | PASS | Frontend (Next.js), Backend (FastAPI), Auth (Better Auth), DB (Neon) are fully separate. Communication via REST only. |
| V | Production Realism | PASS | Neon PostgreSQL persistence. Normalized schema. Stateless backend. Multi-user support. |
| VI | Traceability | PASS | Every endpoint maps to FR-xxx. Every user story has acceptance scenarios. PHRs created for each phase. |

**Post-Phase 1 re-check**: All gates still PASS. Data model enforces
user_id filtering. API contract maps every endpoint to functional
requirements. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-fullstack-app/
├── plan.md              # This file
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/
│   └── api-contract.md  # Phase 1 output (REST API contract)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, lifespan
│   ├── config.py            # Settings from env vars
│   ├── database.py          # SQLModel engine, session factory
│   ├── models.py            # Task SQLModel definition
│   ├── auth.py              # JWT verification dependency
│   └── routers/
│       ├── __init__.py
│       └── tasks.py         # CRUD endpoints for tasks
├── requirements.txt
└── .env

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (auth provider)
│   │   ├── page.tsx             # Home → redirect to dashboard
│   │   ├── sign-in/
│   │   │   └── page.tsx         # Sign-in form
│   │   ├── sign-up/
│   │   │   └── page.tsx         # Sign-up form
│   │   └── dashboard/
│   │       ├── layout.tsx       # Nav bar, sign-out button
│   │       ├── page.tsx         # Task list + create form
│   │       ├── loading.tsx      # Loading skeleton
│   │       └── error.tsx        # Error boundary
│   └── lib/
│       ├── auth.ts              # Better Auth server config
│       ├── auth-client.ts       # Better Auth client instance
│       └── api.ts               # Fetch wrapper with JWT header
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── .env.local
```

**Structure Decision**: Web application structure selected (Option 2).
Backend and frontend are separate directories at the repository root,
each with their own dependency management and configuration. This
directly maps to the constitution's Separation of Concerns principle
(IV) and the agent delegation model.

## Component Architecture

### Data Flow

```
┌─────────────┐     REST + JWT      ┌─────────────┐     SQL        ┌──────────┐
│   Next.js   │ ──────────────────► │   FastAPI   │ ─────────────► │   Neon   │
│  Frontend   │ ◄────────────────── │   Backend   │ ◄───────────── │PostgreSQL│
│             │     JSON responses  │             │    Query results│          │
└──────┬──────┘                     └──────┬──────┘                └──────────┘
       │                                   │
       │ Better Auth                       │ PyJWT
       │ (signup/signin/JWT)               │ (JWT verification)
       │                                   │
       └──── Shared BETTER_AUTH_SECRET ────┘
```

### Backend Components

1. **main.py**: FastAPI app initialization, CORS middleware, lifespan
   event for DB table creation, router inclusion
2. **config.py**: Pydantic Settings loading DATABASE_URL,
   BETTER_AUTH_SECRET, FRONTEND_URL from environment
3. **database.py**: SQLModel engine creation from DATABASE_URL, session
   factory with `get_session()` generator
4. **models.py**: Task SQLModel with fields per data-model.md;
   TaskCreate and TaskUpdate Pydantic schemas for request validation
5. **auth.py**: `get_current_user()` dependency that extracts Bearer
   token, decodes JWT with PyJWT, returns user ID; raises
   HTTPException(401) on failure
6. **routers/tasks.py**: CRUD endpoints per api-contract.md, all using
   `Depends(get_current_user)` for auth and filtering by user_id

### Frontend Components

1. **Root layout**: Wraps app in auth provider context
2. **Home page**: Redirects to /dashboard if signed in, /sign-in if not
3. **Sign-in page**: Email + password form, calls Better Auth sign-in,
   redirects to /dashboard on success
4. **Sign-up page**: Email + password form, calls Better Auth sign-up,
   redirects to /dashboard on success
5. **Dashboard layout**: Nav bar with app name and sign-out button;
   protects route by checking session
6. **Dashboard page**: Task list display, create task form, inline edit,
   completion toggle, delete with confirmation
7. **auth-client.ts**: `createAuthClient()` instance for session and
   token management
8. **api.ts**: Fetch wrapper that attaches `Authorization: Bearer` header
   from the current session token

### Authentication Flow

```
1. User fills sign-up/sign-in form on Next.js frontend
2. Form submits to Better Auth API route (/api/auth/sign-up/email
   or /api/auth/sign-in/email)
3. Better Auth validates credentials, creates/retrieves user in Neon DB
4. Better Auth creates a session and issues a JWT (signed with
   BETTER_AUTH_SECRET using HS256)
5. Frontend stores session (Better Auth handles this via cookies/storage)
6. For API calls, frontend reads the JWT from the session and attaches
   it as Authorization: Bearer <token> header
7. FastAPI backend receives request, auth.py extracts token from header
8. PyJWT decodes token using BETTER_AUTH_SECRET (HS256), verifies
   signature and expiration
9. If valid, user_id (from JWT sub claim) is passed to the endpoint
10. Endpoint queries database with WHERE user_id = <jwt.sub>
11. If token is invalid/expired/missing, return 401 Unauthorized
```

## Implementation Order (per constitution)

### Phase 1: Setup & Infrastructure

1. Initialize backend Python project with dependencies
2. Initialize frontend Next.js project with dependencies
3. Create environment variable templates (.env.example)
4. Configure Tailwind CSS for frontend

### Phase 2: Database & Models

1. Create SQLModel Task model (backend/app/models.py)
2. Create database engine and session factory (backend/app/database.py)
3. Create configuration module (backend/app/config.py)
4. Implement table creation on startup (backend/app/main.py lifespan)

### Phase 3: Authentication

1. Configure Better Auth server on frontend (src/lib/auth.ts)
2. Create Better Auth API route handler (src/app/api/auth/[...all]/route.ts)
3. Create auth client for frontend components (src/lib/auth-client.ts)
4. Implement JWT verification dependency on backend (backend/app/auth.py)

### Phase 4: Backend API

1. Create task CRUD router (backend/app/routers/tasks.py)
2. Implement GET /api/tasks (list user's tasks)
3. Implement POST /api/tasks (create task)
4. Implement GET /api/tasks/{id} (get single task)
5. Implement PUT /api/tasks/{id} (update task)
6. Implement PATCH /api/tasks/{id}/toggle (toggle completion)
7. Implement DELETE /api/tasks/{id} (delete task)
8. Configure CORS middleware in main.py
9. Wire router into FastAPI app

### Phase 5: Frontend UI

1. Create root layout with auth provider
2. Create sign-up page with form
3. Create sign-in page with form
4. Create API client wrapper with JWT headers (src/lib/api.ts)
5. Create dashboard layout with nav bar and sign-out
6. Create dashboard page with task list
7. Add create task form on dashboard
8. Add task edit functionality (inline or modal)
9. Add task completion toggle
10. Add task delete with confirmation dialog
11. Add loading and error states
12. Implement protected route redirect

### Phase 6: Polish & Validation

1. Verify all CRUD operations work end-to-end
2. Verify data isolation between users
3. Verify JWT rejection for unauthenticated requests
4. Verify responsive layout on mobile viewport
5. Create .env.example documentation

## Complexity Tracking

No constitution violations detected. The architecture uses the minimum
viable set of components: one backend service, one frontend app, one
database, one auth provider. No unnecessary abstractions, no middleware
beyond JWT verification and CORS.

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| JWT algorithm | HS256 (symmetric) | Better Auth default; shared secret is simpler than asymmetric keys for single-backend setup |
| DB driver | psycopg2-binary (sync) | Simpler than async; sufficient for hackathon scale |
| Schema migration | create_all() on startup | Simpler than Alembic; reproducible since schema defined in code |
| Task ID type | UUID | Prevents enumeration attacks; standard for REST APIs |
| API error format | FastAPI default `{"detail": "..."}` | Standard, consistent, no custom error framework needed |
| Frontend styling | Tailwind CSS | Default with Next.js; utility-first enables rapid responsive development |
| User table | Better Auth managed | Avoid duplicate user models; task table references user.id via FK |

## Risks

1. **Better Auth JWT plugin compatibility**: If the JWT plugin behaves
   differently than documented, the backend verification could fail.
   Mitigation: Test JWT round-trip early in implementation.
2. **Neon cold start latency**: Serverless database may have cold start
   delays. Mitigation: Use pooled connection endpoint; acceptable for
   hackathon scope.
3. **CORS misconfiguration**: Cross-origin requests will silently fail
   if headers are wrong. Mitigation: Test CORS in Phase 4 before
   building frontend API calls.

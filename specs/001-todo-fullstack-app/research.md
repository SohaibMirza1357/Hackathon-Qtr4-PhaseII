# Research: Todo Full-Stack Web Application

**Branch**: `001-todo-fullstack-app` | **Date**: 2026-02-08
**Input**: Technical context unknowns from plan.md

## R1: Better Auth JWT Integration

**Decision**: Use Better Auth with JWT plugin on the Next.js frontend.
Better Auth runs as a Next.js API route handler and manages user signup,
signin, session creation, and JWT issuance. The `jwt` plugin is enabled
in the Better Auth server configuration to issue JWTs alongside sessions.

**Rationale**: Better Auth is the mandated auth provider per the
constitution. Its JWT plugin enables issuing self-contained tokens that
the Python FastAPI backend can verify independently using the shared
secret, without calling back to the auth server.

**Alternatives considered**:
- NextAuth.js: Mature but not mandated by constitution; Better Auth is
  required.
- Custom JWT implementation: Unnecessary complexity; Better Auth handles
  credential hashing, session management, and token issuance.

**Key details**:
- Package: `better-auth` (npm)
- JWT signing: HMAC-SHA256 (HS256) using `BETTER_AUTH_SECRET` env var
- JWT payload: `{ sub: userId, email: userEmail, iat, exp }`
- Token expiration: Configurable; default 1 hour for hackathon scope
- Frontend integration: `createAuthClient()` from `better-auth/react`
- Backend verification: Python `PyJWT` library with the same shared secret
- Database: Better Auth manages its own `user`, `session`, and `account`
  tables in the same Neon PostgreSQL database

## R2: FastAPI JWT Verification

**Decision**: Use `PyJWT` library in FastAPI to decode and verify JWTs
issued by Better Auth. Create a FastAPI dependency that extracts the
Bearer token from the Authorization header, verifies the HS256 signature
using the shared `BETTER_AUTH_SECRET`, checks expiration, and returns the
decoded user identity.

**Rationale**: PyJWT is the standard Python library for JWT operations.
Since Better Auth uses HS256 (symmetric), the same secret key used for
signing on the frontend is used for verification on the backend. No
asymmetric key exchange or JWKS endpoint is needed.

**Alternatives considered**:
- python-jose: Also viable but PyJWT is more actively maintained and
  sufficient for HS256.
- Calling Better Auth's session endpoint: Adds latency and coupling;
  self-contained JWT verification is preferred per the stateless backend
  principle.

**Key details**:
- Package: `PyJWT>=2.8.0`
- Algorithm: HS256
- Secret: `BETTER_AUTH_SECRET` environment variable (shared with frontend)
- Failure modes:
  - Missing Authorization header → 401 Unauthorized
  - Malformed token → 401 Unauthorized
  - Expired token → 401 Unauthorized
  - Invalid signature → 401 Unauthorized

## R3: SQLModel with Neon PostgreSQL

**Decision**: Use SQLModel for ORM with `psycopg2-binary` driver
connecting to Neon Serverless PostgreSQL. Use synchronous SQLModel
sessions via FastAPI dependency injection. For hackathon scope, use
`SQLModel.metadata.create_all()` for schema initialization instead of
full Alembic migrations.

**Rationale**: SQLModel provides a clean Pydantic + SQLAlchemy hybrid
that works well with FastAPI. Synchronous psycopg2 is simpler and
sufficient for hackathon scale. Neon's connection pooler handles
serverless connection management.

**Alternatives considered**:
- asyncpg + async SQLAlchemy: More performant at scale but adds
  complexity unnecessary for hackathon scope.
- Alembic migrations: Best practice for production but overkill for
  initial development; `create_all()` is simpler and meets the
  "reproducible" requirement since the schema is defined in code.

**Key details**:
- Packages: `sqlmodel>=0.0.22`, `psycopg2-binary>=2.9`
- Connection string: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
- Environment variable: `DATABASE_URL`
- Session pattern: FastAPI `Depends(get_session)` with `yield`
- Neon pooler: Use pooled connection endpoint (`-pooler` suffix) for
  serverless compatibility

## R4: Next.js App Router Structure

**Decision**: Use Next.js 16+ App Router with the following route
structure. Auth pages (signin, signup) are public routes. The dashboard
is a protected route that checks for an active session before rendering.

**Rationale**: App Router is the mandated frontend pattern. Route groups
separate public and protected layouts cleanly. Client Components handle
interactive forms and API calls.

**Alternatives considered**:
- Pages Router: Legacy pattern; App Router is mandated.
- Server-side session checking via middleware: Adds complexity; client-side
  auth check with redirect is simpler for hackathon scope.

**Key details**:
- Route structure:
  - `/sign-in` → Sign-in page (public)
  - `/sign-up` → Sign-up page (public)
  - `/dashboard` → Task list (protected)
- Layout hierarchy: Root layout wraps auth provider; dashboard layout
  includes nav bar with sign-out button
- API calls: Client-side `fetch()` with `Authorization: Bearer <token>`
- Styling: Tailwind CSS (default with Next.js)
- Forms: Client Components with `useState` and `fetch` for API calls

## R5: CORS Configuration

**Decision**: Configure FastAPI CORS middleware to allow requests from
the Next.js frontend origin. In development, allow `http://localhost:3000`.
In production, restrict to the deployed frontend domain.

**Rationale**: Since frontend (Next.js, port 3000) and backend (FastAPI,
port 8000) run on different origins, CORS must be explicitly configured
to allow cross-origin requests with Authorization headers.

**Key details**:
- Package: `fastapi.middleware.cors.CORSMiddleware`
- Allowed origins: configurable via `FRONTEND_URL` env var
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Authorization, Content-Type
- Credentials: Not needed (stateless JWT, no cookies sent cross-origin)

## R6: Environment Variables Strategy

**Decision**: Both frontend and backend share a common set of secrets
via environment variables. A `.env.example` file documents all required
variables.

**Required variables**:
- `BETTER_AUTH_SECRET` — Shared JWT signing secret (used by both frontend
  Better Auth and backend PyJWT)
- `DATABASE_URL` — Neon PostgreSQL connection string (used by backend
  and Better Auth for user storage)
- `BETTER_AUTH_URL` — Base URL of the Better Auth server (the Next.js
  app URL, e.g., `http://localhost:3000`)
- `NEXT_PUBLIC_API_URL` — Backend API base URL (e.g.,
  `http://localhost:8000`)
- `FRONTEND_URL` — Frontend origin for CORS (e.g.,
  `http://localhost:3000`)

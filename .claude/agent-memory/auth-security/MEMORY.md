# Auth Security Agent Memory

## Project: Hackathon2 Phase-II — Todo Full-Stack Web App

### Stack
- Frontend: Next.js 16.1.6 (App Router), React 19, TypeScript strict mode
- Auth library: better-auth ^1.4.18
- Database: Neon Serverless PostgreSQL via `pg` Pool
- Backend: Python FastAPI (separate directory)
- Path alias: `@/*` → `./src/*` (tsconfig.json)

### Auth Architecture
- Better Auth owns session management (server-side, pg-backed)
- JWT tokens issued by Better Auth; FastAPI verifies them via shared secret
- Session lifetime: 1 hour (`expiresIn: 3600`), rolling 5-min update (`updateAge: 300`)
- Min password length: 8 (enforced at library level in auth.ts)

### Key Files Created (T010–T013)
| File | Purpose |
|------|---------|
| `frontend/src/lib/auth.ts` | Better Auth server config (pg Pool, secrets from env) |
| `frontend/src/app/api/auth/[...all]/route.ts` | Next.js catch-all route handler via `toNextJsHandler` |
| `frontend/src/lib/auth-client.ts` | Client-side auth instance (`createAuthClient` from `better-auth/react`) |
| `frontend/src/lib/api.ts` | Authenticated fetch wrapper — attaches Bearer token, handles 401 redirect |

### Environment Variables Required
- `DATABASE_URL` — Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` — signing secret (min 32 random bytes in prod)
- `BETTER_AUTH_URL` — server-side base URL (e.g. http://localhost:3000)
- `NEXT_PUBLIC_BETTER_AUTH_URL` — client-side base URL (same value, browser-safe)
- `NEXT_PUBLIC_API_URL` — FastAPI backend URL (e.g. http://localhost:8000)

### Pending Manual Step
- Run `npm install pg @types/pg` inside `frontend/` — shell was unavailable during T010 setup.

### Security Notes
- `pg` package not yet in `node_modules` — must be installed before build
- `auth.ts` is server-only; never import into client components
- `auth-client.ts` is browser-only; never import into server-only modules
- Token extraction path: `sessionData?.token || sessionData?.session?.token`
- 401 redirect guard: `typeof window !== "undefined"` prevents SSR crash

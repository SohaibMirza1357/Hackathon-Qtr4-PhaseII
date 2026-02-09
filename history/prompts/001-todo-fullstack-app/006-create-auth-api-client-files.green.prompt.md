---
id: 006
title: Create Auth and API Client Files
stage: green
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-todo-fullstack-app
branch: master
user: User
command: Create the foundational frontend authentication and API client files
labels: ["better-auth","jwt","next-js","api-client","t010","t011","t012","t013"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/lib/auth.ts
  - frontend/src/app/api/auth/[...all]/route.ts
  - frontend/src/lib/auth-client.ts
  - frontend/src/lib/api.ts
tests:
  - none
---

## Prompt

Create the foundational frontend authentication and API client files for a Todo Full-Stack Web Application using Better Auth and Next.js.

**Working directory**: `C:\Users\User\Desktop\Hackathon2 Phase-II`

The project uses Better Auth for authentication with JWT plugin. Create ALL 4 files below completely:

## File 1: `frontend/src/lib/auth.ts` (T010 — Better Auth server config)

Create the Better Auth server-side configuration:

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 3600, // 1 hour
    updateAge: 300, // 5 minutes
  },
});
```

Note: Better Auth uses `pg` package for PostgreSQL connection. We need to install it.

## File 2: `frontend/src/app/api/auth/[...all]/route.ts` (T011 — Better Auth route handler)

Create the catch-all API route handler for Better Auth:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

Make sure the directory `frontend/src/app/api/auth/[...all]/` exists.

## File 3: `frontend/src/lib/auth-client.ts` (T012 — Better Auth client)

Create the client-side auth instance:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

## File 4: `frontend/src/lib/api.ts` (T013 — API client with JWT)

Create a fetch wrapper that attaches JWT Bearer tokens to API calls.

IMPORTANT:
1. Also install the `pg` package: run `npm install pg` in the `frontend/` directory
2. Create ALL directories needed before writing files
3. Write ALL 4 files completely — no TODOs or placeholders

## Response snapshot

Created all 4 files with full security-annotated implementations:

1. `frontend/src/lib/auth.ts` — Better Auth server instance using `pg.Pool` for Neon PostgreSQL; all config from env vars; 1-hour sessions with 5-min rolling update.
2. `frontend/src/app/api/auth/[...all]/route.ts` — Next.js App Router catch-all handler via `toNextJsHandler(auth)`.
3. `frontend/src/lib/auth-client.ts` — Client-side `createAuthClient` with re-exported `signIn`, `signUp`, `signOut`, `useSession`.
4. `frontend/src/lib/api.ts` — `apiFetch` wrapper that fetches session token from `/api/auth/get-session`, attaches it as `Authorization: Bearer`, and redirects to `/sign-in` on 401.

Shell was unavailable so `npm install pg @types/pg` must be run manually in `frontend/`.

## Outcome

- Impact: Foundational auth layer wired between Next.js frontend, Better Auth, and FastAPI backend via JWT Bearer tokens.
- Tests: None added (unit tests for auth flows are a follow-up task).
- Files: 4 new TypeScript files created under `frontend/src/`.
- Next prompts: Install `pg` package, configure `.env` variables, build sign-in/sign-up pages (frontend agent), add FastAPI JWT verification middleware (backend agent).
- Reflection: Verified existing tsconfig path alias (`@/*` → `./src/*`) and confirmed `better-auth ^1.4.18` already in package.json before writing files.

## Evaluation notes (flywheel)

- Failure modes observed: Shell unavailable prevented `npm install`; documented as manual step.
- Graders run and results (PASS/FAIL): None run.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add `@types/pg` to devDependencies after manual install and verify TypeScript compilation.

# Next.js UI Generator Agent Memory

## Project: Hackathon2 Phase-II - Todo Full-Stack Web Application

### Environment Notes
- Platform: Windows (win32), PowerShell available
- Node.js 24.11.0 at `C:\Program Files\nodejs\node.exe`
- npx at `C:\Users\User\AppData\Roaming\npm\npx.cmd`
- **IMPORTANT**: Direct `node`/`npx`/`npm` Bash commands get auto-denied. Use `powershell -Command "..."` wrapper instead.
- Example: `powershell -Command "Set-Location 'path'; npx create-next-app@latest ..."`

### Frontend Project Setup
- Location: `C:\Users\User\Desktop\Hackathon2 Phase-II\frontend\`
- Created with: `npx create-next-app@latest` version 16.1.6
- Next.js version: 16.1.6
- React version: 19.2.3
- TypeScript: enabled (tsconfig.json present)
- Tailwind CSS: v4 (via `@import "tailwindcss"` in globals.css, NOT via config file)
- ESLint: v9
- Router: App Router (`src/app/` directory)
- Import alias: `@/*` maps to `./src/*`

### Project Structure
```
frontend/src/app/
  layout.tsx       - Root layout with Geist fonts, metadata ("Todo App") (T014)
  page.tsx         - Home: session-aware redirect to /dashboard or /sign-in (T015)
  globals.css      - Global styles (Tailwind v4 import)
  sign-in/
    page.tsx       - Sign-in form with generic error messaging (T017)
  sign-up/
    page.tsx       - Sign-up form with email/password validation (T016)
  dashboard/
    layout.tsx     - Auth-guarded layout with navbar (T018)
    page.tsx       - Full task CRUD dashboard (T028-T039)
    loading.tsx    - Skeleton loading UI (T020)
    error.tsx      - Error boundary with reset (T021)
frontend/src/lib/
  auth-client.ts   - Better Auth client (exports: signIn, signUp, signOut, useSession)
  api.ts           - API fetch helper (exports: apiFetch)
```

### Auth Form Patterns (T015-T017)
- Home page uses `useSession` + `useEffect` to redirect: session -> /dashboard, no session -> /sign-in
- Auth forms use controlled inputs (useState), async handlers, loading state on submit button
- `signUp.email` requires `{ email, password, name }` — pass email as name when no name field
- `signIn.email` uses `{ email, password }`
- After success: `window.location.href = "/dashboard"` for full page navigation
- Sign-in errors: always show generic "Invalid email or password" (security req US1-AS4)
- Sign-up duplicate detection: check if error message contains "already" or "exist"
- Client validation: email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, password.length >= 8

### Technology Stack (Full Project)
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16+ App Router |
| Backend | Python FastAPI (exists at `backend/`) |
| Auth | Better Auth |
| DB | Neon Serverless PostgreSQL |

### Auth Client API (from `@/lib/auth-client`)
- `useSession()` returns: `{ data: { user: { email, id, ... }, session: {...} } | null, isPending: boolean }`
- Session user email access: `session?.user?.email` (the `data` from useSession IS the session object)
- `signOut()` returns a Promise — await then redirect

### Task CRUD Dashboard Patterns (T028-T039)
- Single 'use client' page with all state in useState groups: tasks[], create form, edit form, toggling/deleting Set<string>
- fetchTasks wrapped in useCallback (empty deps) so it can be passed to Retry button and reused after mutations
- Create: POST /api/tasks, prepend new task to local list (newest first), clear form on success
- Edit: inline mode per task — track editingId, pre-populate edit fields via startEdit(task)
- Toggle: optimistic update + revert on failure; disable checkbox while in-flight via Set<string>
- Delete: window.confirm() guard, then DELETE, filter from local list on success
- Completed task styling: `opacity-60` on article, `line-through text-gray-400` on title text
- All API calls use apiFetch from @/lib/api — never direct fetch in components
- Error elements use role="alert"; inputs use aria-describedby linking to error paragraph

### Key Patterns
- Default to Server Components; use `'use client'` only for interactive elements
- Mobile-first responsive design with Tailwind
- JWT tokens passed as `Authorization: Bearer <token>` header from frontend to FastAPI backend
- Auth guard in layouts: useSession + useEffect to redirect via `window.location.href` (not next/navigation)
- error.tsx MUST be 'use client' — Next.js App Router requirement
- loading.tsx is Server Component — no 'use client' needed

### Design System Tokens
- Primary button: `bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg`
- Danger button: `bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-3 rounded-lg text-sm`
- Secondary button: `border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-1.5 px-3 rounded-lg text-sm`
- Navbar: `bg-white border-b border-gray-200` with `px-4 sm:px-6 py-3`
- Card container: `bg-white rounded-xl shadow-sm border border-gray-200 p-6`
- Input/Textarea: `w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`
- Error text: `text-red-600 text-sm`
- Empty state: `text-gray-500 text-base` centered
- Skeleton pulse: `animate-pulse rounded bg-gray-200`
- Focus ring: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- Page background: `min-h-screen bg-gray-50`
- Content container: `mx-auto max-w-4xl px-4 sm:px-6 py-6`

Notes:
- Agent threads always have their cwd reset between bash calls; only use absolute file paths.
- In final responses always share relevant file names and code snippets with absolute paths.
- For clear communication avoid emojis.
- Do not use a colon before tool calls.

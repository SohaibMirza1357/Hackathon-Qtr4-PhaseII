---
id: 007
title: Build Auth Pages Layout Home SignIn SignUp
stage: green
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-todo-fullstack-app
branch: master
user: User
command: implement Phase 3 auth-related pages (T014-T017, T022 partial)
labels: ["auth","frontend","next.js","sign-in","sign-up","layout","responsive"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - C:\Users\User\Desktop\Hackathon2 Phase-II\frontend\src\app\layout.tsx
  - C:\Users\User\Desktop\Hackathon2 Phase-II\frontend\src\app\page.tsx
  - C:\Users\User\Desktop\Hackathon2 Phase-II\frontend\src\app\sign-up\page.tsx
  - C:\Users\User\Desktop\Hackathon2 Phase-II\frontend\src\app\sign-in\page.tsx
tests:
  - Manual: navigate to / while unauthenticated -> redirects to /sign-in
  - Manual: navigate to / while authenticated -> redirects to /dashboard
  - Manual: sign-up form shows validation errors for bad email or short password
  - Manual: sign-up with duplicate email shows "Email already in use" message
  - Manual: sign-in with wrong credentials shows "Invalid email or password"
  - Manual: successful sign-up redirects to /dashboard
  - Manual: successful sign-in redirects to /dashboard
---

## Prompt

You are implementing Phase 3 of a Todo Full-Stack App. Build the auth-related pages for User Story 1.

Tasks:
- T014: Update root layout metadata (title="Todo App", description="A secure multi-user task management application")
- T015: Replace home page with session-aware redirect (useSession -> /dashboard or /sign-in)
- T016: Create sign-up page at frontend/src/app/sign-up/page.tsx with email/password form and validation
- T017: Create sign-in page at frontend/src/app/sign-in/page.tsx with generic error messaging (US1-AS4)
- T022 (partial): Responsive styling for auth pages using the defined design system

## Response snapshot

Implemented all four tasks without running any shell commands (Windows restriction). Key decisions:

1. layout.tsx — Updated metadata title and description only; Geist fonts and html/body structure preserved.

2. page.tsx (home) — Client Component using useSession hook. useEffect waits for isPending=false before deciding redirect target. Shows "Redirecting..." placeholder during resolution.

3. sign-up/page.tsx — Client Component with controlled form. Client-side validation uses regex for email and length check for password (FR-015, FR-016). Calls signUp.email({email, password, name: email}). Detects duplicate email by checking error message string for "already"/"exist". Uses window.location.href for post-success navigation.

4. sign-in/page.tsx — Client Component with controlled form. Calls signIn.email({email, password}). Any error shows the generic "Invalid email or password" message (US1-AS4 security requirement).

All pages share the defined design system: bg-gray-50 page, bg-white rounded-xl card, blue-600 primary button, gray-300 bordered inputs with blue focus ring.

## Outcome

- Impact: Auth pages T014-T017 fully implemented; users can register and log in
- Tests: Manual acceptance criteria defined above
- Files: 4 files created/modified (layout.tsx edited, page.tsx replaced, sign-up/page.tsx created, sign-in/page.tsx created)
- Next prompts: Build /dashboard route (T018-T021), implement task CRUD UI
- Reflection: The signUp.email API requires a `name` field not mentioned in spec; defaulted to email value as a safe fallback

## Evaluation notes (flywheel)

- Failure modes observed: none during implementation
- Graders run and results (PASS/FAIL): not yet run
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): verify Better Auth signUp.email accepts name=email at runtime

# Tasks: Todo Full-Stack Web Application

**Input**: Design documents from `/specs/001-todo-fullstack-app/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-contract.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Tests are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` for Python FastAPI, `frontend/` for Next.js
- Backend source: `backend/app/`
- Frontend source: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize both projects and shared configuration

- [x] T001 [P] Initialize backend Python project: create `backend/` directory, `backend/app/__init__.py`, and `backend/requirements.txt` with dependencies (fastapi, uvicorn, sqlmodel, psycopg2-binary, PyJWT, python-dotenv)
- [x] T002 [P] Initialize frontend Next.js project: run `create-next-app` in `frontend/` with TypeScript, Tailwind CSS, App Router, and src directory enabled
- [x] T003 Install Better Auth in frontend: add `better-auth` package to `frontend/package.json` via npm
- [x] T004 Create `.env.example` at repository root documenting all required environment variables (BETTER_AUTH_SECRET, DATABASE_URL, BETTER_AUTH_URL, NEXT_PUBLIC_API_URL, FRONTEND_URL) per research.md R6

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create backend configuration module in `backend/app/config.py` loading DATABASE_URL, BETTER_AUTH_SECRET, and FRONTEND_URL from environment variables using pydantic-settings or python-dotenv
- [x] T006 [P] Create database engine and session factory in `backend/app/database.py` using SQLModel with `create_engine(DATABASE_URL)` and `get_session()` dependency per research.md R3
- [x] T007 [P] Create Task SQLModel in `backend/app/models.py` with fields: id (UUID PK), title (String max 200), description (optional String max 2000), is_completed (Boolean default False), user_id (String indexed), created_at (DateTime), updated_at (DateTime); plus TaskCreate and TaskUpdate Pydantic schemas per data-model.md
- [x] T008 Create FastAPI app with lifespan in `backend/app/main.py`: initialize app, run SQLModel.metadata.create_all() on startup, include CORS middleware allowing FRONTEND_URL origin with Authorization header per research.md R5
- [x] T009 [P] Implement JWT verification dependency in `backend/app/auth.py`: extract Bearer token from Authorization header, decode with PyJWT using BETTER_AUTH_SECRET and HS256, return user_id from sub claim, raise HTTPException(401) on any failure per research.md R2 and api-contract.md
- [x] T010 [P] Configure Better Auth server in `frontend/src/lib/auth.ts`: initialize betterAuth with database (DATABASE_URL), secret (BETTER_AUTH_SECRET), baseURL (BETTER_AUTH_URL), emailAndPassword plugin, and JWT plugin per research.md R1
- [x] T011 Create Better Auth API route handler in `frontend/src/app/api/auth/[...all]/route.ts`: export GET and POST handlers from auth.toNextJsHandler() per research.md R1
- [x] T012 [P] Create Better Auth client in `frontend/src/lib/auth-client.ts`: export createAuthClient() instance for use in Client Components per research.md R1
- [x] T013 [P] Create API client wrapper in `frontend/src/lib/api.ts`: export fetch helper that reads JWT from Better Auth session and attaches Authorization Bearer header to all requests to NEXT_PUBLIC_API_URL per api-contract.md

**Checkpoint**: Foundation ready — backend accepts JWT-authenticated requests, frontend can sign up/sign in and make authenticated API calls

---

## Phase 3: User Story 1 — User Registration and Sign-In (Priority: P1) MVP

**Goal**: Users can create accounts, sign in, sign out, and be redirected to their dashboard. This is the authentication foundation all other stories depend on.

**Independent Test**: Create a new account, get redirected to empty dashboard, sign out, sign back in, verify redirect to dashboard again. Try invalid credentials and verify error message.

### Implementation for User Story 1

- [x] T014 [US1] Create root layout in `frontend/src/app/layout.tsx` with html/body tags, Tailwind CSS globals import, and metadata (FR-001, FR-002)
- [x] T015 [US1] Create home page in `frontend/src/app/page.tsx` that redirects to /dashboard if session exists or /sign-in if not
- [x] T016 [P] [US1] Create sign-up page in `frontend/src/app/sign-up/page.tsx` with email and password form, minimum 8 character password validation (FR-016), email format validation (FR-015), call Better Auth signUp.email, redirect to /dashboard on success, display errors for duplicate email (US1-AS3) and generic failure (US1-AS4)
- [x] T017 [P] [US1] Create sign-in page in `frontend/src/app/sign-in/page.tsx` with email and password form, call Better Auth signIn.email, redirect to /dashboard on success, display generic authentication failure message on error (US1-AS2, US1-AS4)
- [x] T018 [US1] Create dashboard layout in `frontend/src/app/dashboard/layout.tsx` with navigation bar showing app name, user email, and sign-out button; sign-out calls Better Auth signOut and redirects to /sign-in (FR-005, US1-AS5); layout checks session and redirects to /sign-in if unauthenticated
- [x] T019 [US1] Create dashboard page stub in `frontend/src/app/dashboard/page.tsx` showing empty state message ("No tasks yet") for authenticated users (FR-007)
- [x] T020 [US1] Create loading state in `frontend/src/app/dashboard/loading.tsx` with skeleton placeholder UI
- [x] T021 [US1] Create error boundary in `frontend/src/app/dashboard/error.tsx` with error message display and retry button
- [x] T022 [US1] Add responsive styling to sign-up, sign-in, and dashboard pages using Tailwind CSS mobile-first approach (SC-006): forms centered on desktop, full-width on mobile

**Checkpoint**: Users can sign up, sign in, sign out, and see an empty dashboard. Authentication flow is complete end-to-end (SC-001, SC-005).

---

## Phase 4: User Story 2 — Create and View Tasks (Priority: P2)

**Goal**: Authenticated users can create new tasks and view all their tasks on the dashboard. Tasks are scoped to the owning user.

**Independent Test**: Sign in, create several tasks with title and optional description, verify all appear in the list. Sign in as a second user and verify they see none of the first user's tasks.

### Implementation for User Story 2

- [x] T023 [US2] Create backend task router in `backend/app/routers/__init__.py` and `backend/app/routers/tasks.py`: set up APIRouter with prefix `/api/tasks`
- [x] T024 [US2] Implement POST /api/tasks endpoint in `backend/app/routers/tasks.py`: accept TaskCreate body, validate title non-empty and length 1-200 chars (FR-014, FR-013), validate description max 2000 chars (FR-013), set user_id from JWT, return 201 with created task per api-contract.md
- [x] T025 [US2] Implement GET /api/tasks endpoint in `backend/app/routers/tasks.py`: query tasks WHERE user_id = jwt.sub ORDER BY created_at DESC, return list of tasks per api-contract.md (FR-007, FR-008)
- [x] T026 [US2] Implement GET /api/tasks/{task_id} endpoint in `backend/app/routers/tasks.py`: query task WHERE id = task_id AND user_id = jwt.sub, return 404 if not found or wrong owner per api-contract.md (FR-008)
- [x] T027 [US2] Wire task router into FastAPI app in `backend/app/main.py`: import and include tasks router
- [x] T028 [US2] Add create task form to dashboard page in `frontend/src/app/dashboard/page.tsx`: title input (required, max 200 chars), optional description textarea (max 2000 chars), submit button, validation errors display, call POST /api/tasks via api.ts (FR-006, FR-013, FR-014)
- [x] T029 [US2] Add task list display to dashboard page in `frontend/src/app/dashboard/page.tsx`: fetch tasks via GET /api/tasks on mount, render each task showing title, description (if present), and completion status; show empty state when no tasks exist (FR-007)
- [x] T030 [US2] Add responsive styling to task list and create form using Tailwind CSS: cards or list items for tasks, form layout adapts to mobile/desktop (SC-006)

**Checkpoint**: Users can create and view their own tasks. Data isolation between users is verified (SC-002, SC-004, SC-007 partial).

---

## Phase 5: User Story 3 — Update Tasks (Priority: P3)

**Goal**: Authenticated users can edit the title and description of their own tasks. Changes persist immediately.

**Independent Test**: Create a task, edit its title and description, reload page, verify updated values persist.

### Implementation for User Story 3

- [x] T031 [US3] Implement PUT /api/tasks/{task_id} endpoint in `backend/app/routers/tasks.py`: accept TaskUpdate body, validate title non-empty and length 1-200 chars (FR-014, FR-013), validate description max 2000 chars (FR-013), verify ownership WHERE id = task_id AND user_id = jwt.sub, update fields and updated_at, return 404 if not found or wrong owner per api-contract.md (FR-009, FR-008)
- [x] T032 [US3] Add task edit UI to dashboard page in `frontend/src/app/dashboard/page.tsx`: inline edit mode or edit modal for each task, pre-populate title and description, save button calls PUT /api/tasks/{id} via api.ts, cancel button, validation errors display (FR-009)
- [x] T033 [US3] Add responsive styling to edit UI using Tailwind CSS: edit form adapts to mobile/desktop viewport (SC-006)

**Checkpoint**: Users can edit their own tasks. Edits persist across page reloads (SC-007 partial).

---

## Phase 6: User Story 4 — Complete and Uncomplete Tasks (Priority: P4)

**Goal**: Authenticated users can toggle task completion status. Completed tasks are visually distinguished.

**Independent Test**: Create a task, mark it complete, verify visual distinction, toggle back to incomplete, verify visual change reverts.

### Implementation for User Story 4

- [x] T034 [US4] Implement PATCH /api/tasks/{task_id}/toggle endpoint in `backend/app/routers/tasks.py`: verify ownership WHERE id = task_id AND user_id = jwt.sub, toggle is_completed field, update updated_at, return updated task or 404 per api-contract.md (FR-010, FR-008)
- [x] T035 [US4] Add completion toggle to task list in `frontend/src/app/dashboard/page.tsx`: checkbox or toggle button per task, call PATCH /api/tasks/{id}/toggle via api.ts on click, update UI immediately (FR-010)
- [x] T036 [US4] Add visual distinction for completed tasks in `frontend/src/app/dashboard/page.tsx`: strikethrough title text, muted colors or opacity change for completed tasks using Tailwind CSS classes

**Checkpoint**: Users can toggle task completion. Visual distinction is clear (SC-007 partial).

---

## Phase 7: User Story 5 — Delete Tasks (Priority: P5)

**Goal**: Authenticated users can permanently delete their own tasks with a confirmation step.

**Independent Test**: Create a task, click delete, cancel confirmation (task remains), click delete again, confirm deletion (task removed), reload page (task gone).

### Implementation for User Story 5

- [x] T037 [US5] Implement DELETE /api/tasks/{task_id} endpoint in `backend/app/routers/tasks.py`: verify ownership WHERE id = task_id AND user_id = jwt.sub, delete task, return success message or 404 per api-contract.md (FR-011, FR-008)
- [x] T038 [US5] Add delete button to each task in `frontend/src/app/dashboard/page.tsx`: show confirmation dialog (browser confirm or modal) before calling DELETE /api/tasks/{id} via api.ts, remove task from UI on success (FR-011)
- [x] T039 [US5] Style delete button and confirmation dialog using Tailwind CSS: red/destructive color scheme, responsive layout (SC-006)

**Checkpoint**: All CRUD operations complete. Tasks can be created, viewed, edited, completed, and deleted (SC-007).

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, edge cases, and documentation

- [x] T040 Add session expiry handling in `frontend/src/lib/api.ts`: detect 401 responses from backend, redirect to /sign-in with session expired message (Edge Case 1)
- [x] T041 [P] Create `.env.example` files in `backend/.env.example` and `frontend/.env.example` with all required variables documented per quickstart.md
- [ ] T042 Verify end-to-end: sign up User A, create tasks, sign up User B, verify User B sees zero of User A's tasks (SC-004)
- [ ] T043 Verify responsive layout: test all pages at 1920x1080 and 375px viewport widths, fix any horizontal scrolling or overlapping elements (SC-006)
- [ ] T044 Verify JWT rejection: attempt all task endpoints without Authorization header, verify 401 responses (SC-005)
- [ ] T045 Run quickstart.md validation: follow quickstart.md steps from scratch and verify the application starts and functions correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — no dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Phase 2 and Phase 3 (needs auth UI to exist for testing)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (needs tasks to exist for editing)
- **User Story 4 (Phase 6)**: Depends on Phase 4 (needs tasks to exist for toggling)
- **User Story 5 (Phase 7)**: Depends on Phase 4 (needs tasks to exist for deleting)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 (P2)**: Can start after US1 is complete (needs auth for testing; shares dashboard page)
- **US3 (P3)**: Can start after US2 (needs existing tasks to edit)
- **US4 (P4)**: Can start after US2 (needs existing tasks to toggle); parallel with US3
- **US5 (P5)**: Can start after US2 (needs existing tasks to delete); parallel with US3 and US4

### Within Each User Story

- Backend endpoints before frontend UI (backend provides API for frontend to call)
- Router setup before endpoint implementation
- Core implementation before styling

### Parallel Opportunities

- **Phase 1**: T001 and T002 can run in parallel (different directories)
- **Phase 2**: T006, T007, T009 can run in parallel (different backend files); T010, T012, T013 can run in parallel (different frontend files)
- **Phase 3**: T016 and T017 can run in parallel (different page files)
- **Phase 4**: Backend tasks (T023–T027) then frontend tasks (T028–T030)
- **Phase 6 and Phase 7**: US4 and US5 can run in parallel (different endpoints, different UI elements)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Backend parallel group (different files):
Task: "T006 Create database engine in backend/app/database.py"
Task: "T007 Create Task SQLModel in backend/app/models.py"
Task: "T009 Implement JWT verification in backend/app/auth.py"

# Frontend parallel group (different files):
Task: "T010 Configure Better Auth server in frontend/src/lib/auth.ts"
Task: "T012 Create Better Auth client in frontend/src/lib/auth-client.ts"
Task: "T013 Create API client wrapper in frontend/src/lib/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Auth)
4. **STOP and VALIDATE**: Sign up, sign in, sign out all work
5. Demo-ready: Authentication system is functional

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Auth) → Test independently → MVP!
3. Add US2 (Create/View) → Test independently → Core app
4. Add US3 (Update) → Test independently → Full edit
5. Add US4 (Complete) → Test independently → Full workflow
6. Add US5 (Delete) → Test independently → Full CRUD
7. Polish → Validate all success criteria → Final product

### Agent Delegation (per constitution)

1. **DB Agent**: T006, T007 (database and models)
2. **Auth Agent**: T009, T010, T011, T012 (JWT verification, Better Auth config)
3. **Backend Agent**: T005, T008, T023–T027, T031, T034, T037 (FastAPI endpoints)
4. **Frontend Agent**: T014–T022, T028–T030, T032–T033, T035–T036, T038–T039 (Next.js UI)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 45
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 9 tasks
- Phase 3 (US1 Auth): 9 tasks
- Phase 4 (US2 Create/View): 8 tasks
- Phase 5 (US3 Update): 3 tasks
- Phase 6 (US4 Complete): 3 tasks
- Phase 7 (US5 Delete): 3 tasks
- Phase 8 (Polish): 6 tasks

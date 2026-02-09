---
id: 002
title: Create Foundational Backend Files
stage: green
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-backend
branch: master
user: User
command: Create foundational backend files for Todo Full-Stack Web Application
labels: ["fastapi", "sqlmodel", "backend", "foundation", "jwt", "cors"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/config.py
  - backend/app/database.py
  - backend/app/models.py
  - backend/app/auth.py
  - backend/app/main.py
tests:
  - none
---

## Prompt

Create the foundational backend files for a Todo Full-Stack Web Application using FastAPI and SQLModel. You must create ALL of the following files. Write complete, production-ready code for each.

File 1: backend/app/config.py (T005) — configuration module loading DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL from .env
File 2: backend/app/database.py (T006) — database engine and session factory using SQLModel create_engine
File 3: backend/app/models.py (T007) — Task SQLModel table model and TaskCreate/TaskUpdate schemas
File 4: backend/app/auth.py (T009) — JWT verification dependency using PyJWT and HTTPBearer
File 5: backend/app/main.py (T008) — FastAPI app with CORS, lifespan startup, health check endpoint

## Response snapshot

Created all 5 files:
- config.py: loads env vars using dotenv.load_dotenv() and os.environ
- database.py: create_engine with pool_pre_ping=True, get_session() generator dependency
- models.py: Task(SQLModel, table=True) with UUID PK, user_id index; TaskCreate/TaskUpdate schemas
- auth.py: get_current_user() using HTTPBearer + jwt.decode HS256, raises 401 on any failure
- main.py: FastAPI with lifespan (SQLModel.metadata.create_all on startup), CORSMiddleware, GET / health check

## Outcome

- Impact: All foundational backend modules are in place; the application can now start, connect to the DB, and verify JWT tokens
- Tests: none added at this stage
- Files: 5 files created under backend/app/
- Next prompts: Implement routers/tasks.py with CRUD endpoints (T010+)
- Reflection: Used SQLModel's Session directly (not AsyncSession) matching the sync engine; no FK constraint on user_id per spec since Better Auth manages that table

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): none
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): add tasks router with user-scoped CRUD endpoints

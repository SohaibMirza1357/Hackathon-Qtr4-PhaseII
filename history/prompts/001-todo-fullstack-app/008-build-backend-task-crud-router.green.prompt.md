---
id: 008
title: Build Backend Task CRUD Router
stage: green
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-todo-fullstack-app
branch: master
user: User
command: implement phase 4 task router
labels: ["fastapi","tasks","crud","router","backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/routers/tasks.py
  - backend/app/main.py
tests:
  - null
---

## Prompt

You are implementing Phase 4 of a Todo Full-Stack App. Build the backend task router with CRUD endpoints.

Tasks T023-T027: Create task router, POST /api/tasks, GET /api/tasks, GET /api/tasks/{task_id}, wire router into main.py.

## Response snapshot

Created `backend/app/routers/tasks.py` with:
- APIRouter at prefix `/api/tasks`, tag "tasks"
- POST / — creates task with user_id from JWT, returns 201
- GET / — lists tasks for user ordered by created_at desc, returns 200
- GET /{task_id} — fetches single task by id+user_id, returns 404 if not found

Updated `backend/app/main.py` to import tasks_router and call `app.include_router(tasks_router.router)`.

## Outcome

- Impact: All task CRUD endpoints are now live and protected by JWT authentication
- Tests: No automated tests run (file-only task)
- Files: backend/app/routers/tasks.py (created), backend/app/main.py (updated)
- Next prompts: Frontend integration; PATCH/DELETE endpoints if needed
- Reflection: SQLModel session.exec() used instead of session.execute() per SQLModel 2.0 pattern

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Add PATCH and DELETE endpoints for task update/completion

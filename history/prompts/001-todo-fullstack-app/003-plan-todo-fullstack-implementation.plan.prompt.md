---
id: 003
title: Plan Todo Fullstack Implementation
stage: plan
date: 2026-02-08
surface: agent
model: claude-opus-4-6
feature: 001-todo-fullstack-app
branch: 001-todo-fullstack-app
user: User
command: /sp.plan
labels: ["plan", "architecture", "fullstack", "fastapi", "nextjs", "better-auth"]
links:
  spec: specs/001-todo-fullstack-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-fullstack-app/plan.md
  - specs/001-todo-fullstack-app/research.md
  - specs/001-todo-fullstack-app/data-model.md
  - specs/001-todo-fullstack-app/quickstart.md
  - specs/001-todo-fullstack-app/contracts/api-contract.md
tests:
  - N/A
---

## Prompt

/sp.plan Todo Full-Stack Web Application

Planning objective:
Produce a clear, step-by-step execution plan that transforms the written specification into an implemented full-stack application using an agentic workflow.

Phase 1: System decomposition
- Identify major system components: Frontend (Next.js), Backend (FastAPI), Authentication (Better Auth + JWT), Database (Neon PostgreSQL)
- Define responsibilities and boundaries of each component
- Define data flow between frontend, backend, and database

Phase 2: Backend & data planning
- Design normalized database schema for users and tasks
- Define SQLModel models and relationships
- Specify database migrations strategy
- Define REST API endpoints and request/response shapes
- Plan task ownership enforcement at query level

Phase 3: Authentication & security planning
- Plan Better Auth configuration with JWT enabled
- Define JWT payload contents (user ID, email, expiry)
- Define shared secret handling via environment variables
- Plan FastAPI middleware for token extraction, signature verification, user identity extraction
- Define failure modes (expired token, invalid token, missing token)

Phase 4: Frontend planning
- Plan application routes and layouts using Next.js App Router
- Plan authentication flows (signup, signin, logout)
- Plan API client behavior with Authorization headers
- Plan UI components for task CRUD and completion
- Plan loading, error, and empty states

Phase 5: Integration planning
- Define end-to-end flow: User login, JWT issuance, authenticated API calls, task persistence
- Validate consistency between frontend expectations and backend contracts
- Ensure user ID consistency between JWT and API paths

Phase 6: Validation & review planning
- Verify all requirements are covered by the plan
- Ensure no feature exists without a corresponding spec
- Confirm security rules are enforced everywhere

## Response snapshot

Generated complete implementation plan with 5 artifacts: plan.md (6 phases, 7 key design decisions, 3 risks, full constitution check), research.md (6 research items covering Better Auth JWT, PyJWT verification, SQLModel+Neon, Next.js App Router, CORS, env vars), data-model.md (2 entities with fields, indexes, validation rules, query patterns), contracts/api-contract.md (6 REST endpoints with request/response schemas, status codes, ownership checks), quickstart.md (setup guide with project structure). All constitution gates PASS. Architecture: Next.js frontend + FastAPI backend + Neon PostgreSQL + Better Auth (JWT/HS256). Agent context updated in CLAUDE.md.

## Outcome

- Impact: Complete architectural blueprint ready for task generation; all design decisions documented
- Tests: N/A (planning phase, no code)
- Files: plan.md, research.md, data-model.md, quickstart.md, contracts/api-contract.md (all created)
- Next prompts: /sp.tasks to generate task breakdown from plan
- Reflection: User provided detailed phase structure in prompt; mapped cleanly to plan template. All 6 constitution principles verified with evidence.

## Evaluation notes (flywheel)

- Failure modes observed: Research agent output files were empty (results returned in completion context only); worked around with direct knowledge
- Graders run and results (PASS/FAIL): Constitution check 6/6 PASS, all NEEDS CLARIFICATION resolved in research.md
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A

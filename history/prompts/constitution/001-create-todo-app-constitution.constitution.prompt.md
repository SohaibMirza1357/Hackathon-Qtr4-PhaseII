---
id: 001
title: Create Todo App Constitution
stage: constitution
date: 2026-02-08
surface: agent
model: claude-opus-4-6
feature: none
branch: master
user: User
command: /sp.constitution
labels: ["constitution", "governance", "project-setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

/sp.constitution

Project: Todo Full-Stack Web Application (Agentic, Spec-Driven Development)

Objective:
Transform a basic console-based Todo application into a secure, multi-user, full-stack web application using a fully spec-driven, agentic development workflow (Spec → Plan → Tasks → Implement). No manual coding is permitted.

Core principles:
- Spec-first development (all implementation must strictly follow written specs)
- Deterministic behavior (same inputs produce same outputs)
- Security by design (authentication and authorization enforced at every layer)
- Clear separation of concerns (frontend, backend, auth, data)
- Production realism (architecture and decisions reflect real-world systems)
- Traceability (every feature maps back to an explicit requirement)

Key standards:
- Every feature must be explicitly specified before planning or implementation
- No feature may be implemented if it is not present in the spec
- REST APIs must follow standard HTTP semantics and status codes
- All data access must be scoped to the authenticated user
- Authentication must be stateless using JWTs
- Secrets must never be hard-coded and must rely on environment variables
- Frontend and backend must communicate only via defined API contracts

Technology standards:
- Frontend: Next.js 16+ using App Router
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (JWT-based)
- API style: REST (no RPC, no GraphQL)

Security standards:
- All API endpoints require a valid JWT after authentication is enabled
- Requests without valid JWT must return HTTP 401 Unauthorized
- Users may only access or modify their own tasks
- Task ownership must be verified on every read/write/delete operation
- JWT signature must be verified using a shared secret
- Token expiration must be enforced
- No cross-user data leakage is permitted under any condition

Data standards:
- Persistent storage is mandatory (no in-memory-only state)
- Database schema must be normalized and minimal
- Clear primary keys and foreign keys must be defined
- All task queries must be filtered by authenticated user ID
- Database migrations must be reproducible and reversible

API standards:
- Endpoints must exactly follow the defined API contract
- HTTP methods must be used correctly (GET, POST, PUT, PATCH, DELETE)
- Error responses must be explicit and meaningful
- API behavior must be consistent and predictable

Development constraints:
- No manual coding; all code must be generated via Claude Code
- All work must follow the Agentic Dev Stack workflow:
  1. Write specification
  2. Generate plan
  3. Break into tasks
  4. Implement
- Each phase must be reviewable independently
- Specs must be clear enough that implementation can be regenerated

Non-functional constraints:
- Frontend must be responsive and usable on desktop and mobile
- Backend must be stateless
- System must support multiple concurrent users
- Performance must be reasonable for a hackathon-scale application
- Codebase structure must be clean and understandable

Success criteria:
- All required Todo features are implemented as a web application
- Users can sign up, sign in, and manage their own tasks
- Tasks persist across sessions and reloads
- API is fully secured using JWT-based authentication
- No user can access another user's data
- The entire project can be evaluated via specs, plans, and generated code
- Project demonstrates correct use of spec-driven, agentic development

## Response snapshot

Created the project constitution v1.0.0 for the Todo Full-Stack Web Application at `.specify/memory/constitution.md`. The constitution defines 6 core principles (Spec-First Development, Deterministic Behavior, Security by Design, Separation of Concerns, Production Realism, Traceability), technology stack (Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth), security/data/API standards, development workflow constraints (agentic dev stack), and governance rules with semantic versioning for amendments. All templates verified compatible. No follow-up TODOs.

## Outcome

- Impact: Established project governance foundation; all future specs, plans, and tasks MUST comply
- Tests: N/A (governance document, not code)
- Files: .specify/memory/constitution.md (created)
- Next prompts: /sp.specify to create the first feature specification
- Reflection: User provided comprehensive principles; all 6 mapped cleanly to template structure with 3 additional standards sections

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation PASS — no unresolved placeholders, version matches report, dates ISO format, principles declarative and testable
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A

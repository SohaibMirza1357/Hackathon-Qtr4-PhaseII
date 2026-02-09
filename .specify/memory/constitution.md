<!--
=== Sync Impact Report ===
Version change: 0.0.0 → 1.0.0 (MAJOR - initial ratification)
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (6 principles)
  - Technology & Security Standards
  - Development Workflow & Constraints
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible (Constitution Check section present)
  - .specify/templates/spec-template.md — ✅ compatible (requirements and success criteria sections present)
  - .specify/templates/tasks-template.md — ✅ compatible (phase structure supports foundational + story phases)
Follow-up TODOs: None
===========================
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Spec-First Development

All implementation MUST strictly follow written specifications. No feature
may be implemented unless it is explicitly present in an approved spec.
Every feature MUST be specified before planning or implementation begins.
Specs MUST be clear enough that implementation can be regenerated from
the spec alone.

**Rationale**: Spec-first ensures traceability, reproducibility, and
prevents scope creep. It enables the agentic workflow where each phase
(spec, plan, tasks, implement) is independently reviewable.

### II. Deterministic Behavior

Same inputs MUST produce same outputs across all system layers. API
responses MUST be consistent and predictable for identical requests.
System behavior MUST NOT depend on implicit state, race conditions,
or uncontrolled side effects.

**Rationale**: Determinism enables reliable testing, debugging, and
confidence in system correctness. Non-deterministic behavior undermines
every other quality guarantee.

### III. Security by Design

Authentication and authorization MUST be enforced at every layer. All
API endpoints MUST require a valid JWT after authentication is enabled.
Requests without valid JWT MUST return HTTP 401 Unauthorized. Users MUST
only access or modify their own tasks. Task ownership MUST be verified
on every read, write, and delete operation. JWT signature MUST be
verified using a shared secret. Token expiration MUST be enforced. No
cross-user data leakage is permitted under any condition. Secrets MUST
never be hard-coded; environment variables MUST be used.

**Rationale**: Security cannot be bolted on after the fact. Enforcing
it from the start prevents entire classes of vulnerabilities and ensures
user trust.

### IV. Separation of Concerns

Frontend, backend, authentication, and data layers MUST be clearly
separated. Frontend and backend MUST communicate only via defined API
contracts (REST). No layer may directly access another layer's internal
state. Each layer MUST be independently deployable and testable.

**Rationale**: Clean separation enables independent development, testing,
and scaling of each layer. It also maps directly to the agent delegation
model (auth, frontend, backend, DB agents).

### V. Production Realism

Architecture and decisions MUST reflect real-world production systems.
Persistent storage is mandatory (no in-memory-only state). The backend
MUST be stateless. The system MUST support multiple concurrent users.
Database schema MUST be normalized and minimal with clear primary keys
and foreign keys. All task queries MUST be filtered by authenticated
user ID.

**Rationale**: Building for production from day one prevents costly
rework and ensures the system is demonstrably viable beyond a prototype.

### VI. Traceability

Every feature MUST map back to an explicit requirement in a spec. Every
implementation task MUST reference its parent spec and plan. Every
significant decision MUST be documented or suggested for ADR capture.
Prompt History Records MUST be created for every user interaction to
maintain a complete audit trail.

**Rationale**: Traceability ensures accountability, enables auditing,
and provides a clear chain from requirement to implementation. It is
essential for the spec-driven workflow to deliver on its promise.

## Technology & Security Standards

### Technology Stack

| Layer          | Technology                      |
|----------------|--------------------------------|
| Frontend       | Next.js 16+ (App Router)       |
| Backend        | Python FastAPI                  |
| ORM            | SQLModel                        |
| Database       | Neon Serverless PostgreSQL      |
| Spec-Driven    | Claude Code + Spec-Kit Plus     |
| Authentication | Better Auth (JWT-based)         |
| API Style      | REST (no RPC, no GraphQL)       |

### Security Rules

- All API endpoints MUST require a valid JWT after authentication is enabled
- Requests without valid JWT MUST return HTTP 401 Unauthorized
- Users MUST only access or modify their own tasks
- Task ownership MUST be verified on every read/write/delete operation
- JWT signature MUST be verified using a shared secret
- Token expiration MUST be enforced
- No cross-user data leakage is permitted under any condition
- Secrets MUST use environment variables; hard-coding is prohibited

### Data Rules

- Persistent storage is mandatory (no in-memory-only state)
- Database schema MUST be normalized and minimal
- Clear primary keys and foreign keys MUST be defined
- All task queries MUST be filtered by authenticated user ID
- Database migrations MUST be reproducible and reversible

### API Rules

- Endpoints MUST exactly follow the defined API contract
- HTTP methods MUST be used correctly (GET, POST, PUT, PATCH, DELETE)
- Error responses MUST be explicit and meaningful
- API behavior MUST be consistent and predictable

## Development Workflow & Constraints

### Agentic Dev Stack Workflow

All work MUST follow this strict workflow:

1. **Write specification** (`/sp.specify`)
2. **Generate plan** (`/sp.plan`)
3. **Break into tasks** (`/sp.tasks`)
4. **Implement** (`/sp.implement`)

Each phase MUST be reviewable independently. No manual coding is
permitted; all code MUST be generated via Claude Code.

### Implementation Order

When implementing features end-to-end, follow this order:

1. **DB Agent** — Design and create database tables/schema
2. **Auth Agent** — Set up Better Auth, configure JWT, secure endpoints
3. **Backend Agent** — Build FastAPI endpoints with SQLModel, add JWT verification
4. **Frontend Agent** — Build Next.js UI pages that consume the API

### Non-Functional Requirements

- Frontend MUST be responsive and usable on desktop and mobile
- Backend MUST be stateless
- System MUST support multiple concurrent users
- Performance MUST be reasonable for a hackathon-scale application
- Codebase structure MUST be clean and understandable

### Success Criteria

- All required Todo features are implemented as a web application
- Users can sign up, sign in, and manage their own tasks
- Tasks persist across sessions and reloads
- API is fully secured using JWT-based authentication
- No user can access another user's data
- The entire project can be evaluated via specs, plans, and generated code
- Project demonstrates correct use of spec-driven, agentic development

## Governance

This constitution is the authoritative source for project principles,
standards, and constraints. It supersedes all other practices and
informal agreements.

### Amendment Procedure

1. Amendments MUST be proposed with a clear rationale
2. Amendments MUST be documented with before/after comparison
3. Amendments MUST include a migration plan for affected artifacts
4. All dependent templates (plan, spec, tasks) MUST be checked for
   consistency after any amendment
5. Version MUST be incremented per semantic versioning rules:
   - **MAJOR**: Backward-incompatible governance/principle changes
   - **MINOR**: New principles or materially expanded guidance
   - **PATCH**: Clarifications, wording, non-semantic refinements

### Compliance

- All specs, plans, and task lists MUST comply with this constitution
- All PRs and reviews MUST verify compliance with stated principles
- Complexity beyond the minimum viable solution MUST be justified
- See `CLAUDE.md` for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08

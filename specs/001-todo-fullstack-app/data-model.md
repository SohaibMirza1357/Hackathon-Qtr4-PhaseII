# Data Model: Todo Full-Stack Web Application

**Branch**: `001-todo-fullstack-app` | **Date**: 2026-02-08
**Source**: spec.md Key Entities + research.md

## Entity Relationship Diagram (Textual)

```
┌──────────────────────┐       ┌──────────────────────────────┐
│        user           │       │            task               │
├──────────────────────┤       ├──────────────────────────────┤
│ id (PK, text)        │──1:N──│ id (PK, uuid)                │
│ email (unique, text) │       │ title (text, max 200, NOT NULL│
│ name (text, nullable)│       │ description (text, max 2000,  │
│ email_verified (bool)│       │   nullable)                   │
│ image (text, nullable│       │ is_completed (bool, default   │
│ created_at (timestam)│       │   false)                      │
│ updated_at (timestam)│       │ user_id (FK → user.id, NOT    │
└──────────────────────┘       │   NULL)                       │
                               │ created_at (timestamp, NOT    │
Better Auth manages the         │   NULL, default now)          │
user table schema. Do NOT      │ updated_at (timestamp, NOT    │
define a custom User model      │   NULL, default now)          │
in SQLModel — only reference   └──────────────────────────────┘
user.id as a foreign key
from the task table.

Better Auth also creates:
- session table
- account table
- verification table
These are managed internally.
```

## Entity: task

**Purpose**: Represents a to-do item owned by a single user.

| Field        | Type                   | Constraints                        | Notes                          |
|------------- |------------------------|------------------------------------|--------------------------------|
| id           | UUID                   | PK, default uuid4()               | Unique task identifier         |
| title        | String(200)            | NOT NULL, min length 1             | Task title (FR-006, FR-013)    |
| description  | String(2000)           | Nullable                           | Optional detail (FR-006, FR-013)|
| is_completed | Boolean                | NOT NULL, default False            | Completion toggle (FR-010)     |
| user_id      | String                 | FK → user.id, NOT NULL, indexed    | Owner reference (FR-008)       |
| created_at   | DateTime (with tz)     | NOT NULL, default now()            | Creation timestamp             |
| updated_at   | DateTime (with tz)     | NOT NULL, default now(), on update | Last modification timestamp    |

**Indexes**:
- Primary key on `id`
- Index on `user_id` (all queries filter by user_id per constitution)
- Composite index on `(user_id, created_at DESC)` for default sort order

**Relationships**:
- `task.user_id` → `user.id` (many-to-one)
- No cascade delete defined (task deletion is explicit per US5)

## Entity: user (Better Auth Managed)

**Purpose**: Represents a registered user. Schema is managed by Better
Auth — NOT defined in SQLModel application code.

| Field          | Type      | Constraints            | Notes                      |
|--------------- |-----------|------------------------|----------------------------|
| id             | String    | PK                     | Better Auth user ID        |
| email          | String    | Unique, NOT NULL       | Login identifier (FR-001)  |
| name           | String    | Nullable               | Display name               |
| emailVerified  | Boolean   | Default false          | Not used in hackathon scope|
| image          | String    | Nullable               | Profile image URL          |
| createdAt      | DateTime  | NOT NULL               | Registration timestamp     |
| updatedAt      | DateTime  | NOT NULL               | Last update timestamp      |

**Important**: The application code MUST NOT create or migrate the user
table. Better Auth handles this during its initialization. The task table
references `user.id` as a foreign key.

## Validation Rules (from spec)

- **Title**: Non-empty, max 200 characters (FR-013, FR-014)
- **Description**: Optional, max 2,000 characters when provided (FR-013)
- **Email**: Valid format enforced by Better Auth (FR-015)
- **Password**: Minimum 8 characters enforced by Better Auth (FR-016)

## State Transitions

### Task Completion State

```
                toggle (FR-010)
  ┌──────────┐ ──────────────► ┌──────────┐
  │ incomplete│                 │ complete  │
  │ (default) │ ◄────────────── │           │
  └──────────┘   toggle (FR-010)└──────────┘
```

- New tasks start as `is_completed = false`
- Toggle flips between `true` and `false`
- No intermediate states exist

## Query Patterns

All task queries MUST include `WHERE user_id = :authenticated_user_id`
per constitution principle III (Security by Design) and FR-008.

- **List tasks**: `SELECT * FROM task WHERE user_id = ? ORDER BY created_at DESC`
- **Get single task**: `SELECT * FROM task WHERE id = ? AND user_id = ?`
- **Create task**: `INSERT INTO task (id, title, description, user_id, ...) VALUES (...)`
- **Update task**: `UPDATE task SET ... WHERE id = ? AND user_id = ?`
- **Toggle complete**: `UPDATE task SET is_completed = NOT is_completed WHERE id = ? AND user_id = ?`
- **Delete task**: `DELETE FROM task WHERE id = ? AND user_id = ?`

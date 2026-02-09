# API Contract: Todo Full-Stack Web Application

**Branch**: `001-todo-fullstack-app` | **Date**: 2026-02-08
**Base URL**: `{NEXT_PUBLIC_API_URL}` (e.g., `http://localhost:8000`)

## Authentication

All endpoints under `/api/tasks` require a valid JWT in the
Authorization header:

```
Authorization: Bearer <jwt_token>
```

Failure to provide a valid token results in:

```json
{ "detail": "Not authenticated" }
```

**Status**: `401 Unauthorized`

---

## Endpoints

### Auth Endpoints (Better Auth — Next.js)

Better Auth exposes its own API routes on the Next.js server at
`/api/auth/*`. These are NOT implemented in FastAPI.

| Method | Path                      | Purpose          |
|--------|---------------------------|------------------|
| POST   | /api/auth/sign-up/email   | Register user    |
| POST   | /api/auth/sign-in/email   | Sign in user     |
| POST   | /api/auth/sign-out        | Sign out user    |
| GET    | /api/auth/get-session     | Get current session |

These are handled entirely by Better Auth's route handler in Next.js.

---

### Task Endpoints (FastAPI Backend)

#### GET /api/tasks

**Purpose**: List all tasks for the authenticated user (FR-007)

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
[
  {
    "id": "uuid-string",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "is_completed": false,
    "user_id": "user-id-string",
    "created_at": "2026-02-08T12:00:00Z",
    "updated_at": "2026-02-08T12:00:00Z"
  }
]
```

**Response 401**: Missing or invalid token

**Query filter**: `WHERE user_id = <jwt.sub>` (automatic, not
user-specified)

---

#### POST /api/tasks

**Purpose**: Create a new task (FR-006)

**Headers**: `Authorization: Bearer <token>`

**Request body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

| Field       | Type   | Required | Constraints              |
|-------------|--------|----------|--------------------------|
| title       | string | Yes      | 1-200 characters (FR-013)|
| description | string | No       | Max 2000 chars (FR-013)  |

**Response 201**:
```json
{
  "id": "uuid-string",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "user_id": "user-id-string",
  "created_at": "2026-02-08T12:00:00Z",
  "updated_at": "2026-02-08T12:00:00Z"
}
```

**Response 400**: Validation error (empty title, title too long, etc.)
```json
{
  "detail": "Title must be between 1 and 200 characters"
}
```

**Response 401**: Missing or invalid token

---

#### GET /api/tasks/{task_id}

**Purpose**: Get a single task by ID (FR-007)

**Headers**: `Authorization: Bearer <token>`

**Path parameters**:
| Param   | Type | Description         |
|---------|------|---------------------|
| task_id | UUID | The task identifier |

**Response 200**: Single task object (same shape as list item)

**Response 401**: Missing or invalid token

**Response 404**: Task not found or does not belong to user
```json
{
  "detail": "Task not found"
}
```

**Ownership check**: `WHERE id = task_id AND user_id = <jwt.sub>`

---

#### PUT /api/tasks/{task_id}

**Purpose**: Update a task's title and/or description (FR-009)

**Headers**: `Authorization: Bearer <token>`

**Path parameters**:
| Param   | Type | Description         |
|---------|------|---------------------|
| task_id | UUID | The task identifier |

**Request body**:
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

| Field       | Type   | Required | Constraints              |
|-------------|--------|----------|--------------------------|
| title       | string | Yes      | 1-200 characters (FR-013)|
| description | string | No       | Max 2000 chars (FR-013)  |

**Response 200**: Updated task object

**Response 400**: Validation error

**Response 401**: Missing or invalid token

**Response 404**: Task not found or does not belong to user

**Ownership check**: `WHERE id = task_id AND user_id = <jwt.sub>`

---

#### PATCH /api/tasks/{task_id}/toggle

**Purpose**: Toggle task completion status (FR-010)

**Headers**: `Authorization: Bearer <token>`

**Path parameters**:
| Param   | Type | Description         |
|---------|------|---------------------|
| task_id | UUID | The task identifier |

**Request body**: None

**Response 200**: Updated task object with toggled `is_completed`

**Response 401**: Missing or invalid token

**Response 404**: Task not found or does not belong to user

**Ownership check**: `WHERE id = task_id AND user_id = <jwt.sub>`

---

#### DELETE /api/tasks/{task_id}

**Purpose**: Delete a task permanently (FR-011)

**Headers**: `Authorization: Bearer <token>`

**Path parameters**:
| Param   | Type | Description         |
|---------|------|---------------------|
| task_id | UUID | The task identifier |

**Request body**: None

**Response 200**:
```json
{
  "detail": "Task deleted"
}
```

**Response 401**: Missing or invalid token

**Response 404**: Task not found or does not belong to user

**Ownership check**: `WHERE id = task_id AND user_id = <jwt.sub>`

---

## Error Response Format

All error responses use the standard FastAPI format:

```json
{
  "detail": "Human-readable error message"
}
```

## HTTP Status Code Summary (FR-017)

| Code | Meaning               | When Used                                |
|------|-----------------------|------------------------------------------|
| 200  | OK                    | Successful read, update, toggle, delete  |
| 201  | Created               | Successful task creation                 |
| 400  | Bad Request           | Validation errors (empty title, too long)|
| 401  | Unauthorized          | Missing, expired, or invalid JWT         |
| 404  | Not Found             | Task doesn't exist or wrong owner        |
| 422  | Unprocessable Entity  | Malformed request body (FastAPI default)  |

## Cross-Origin (CORS)

FastAPI MUST be configured with CORS middleware to accept requests from
the frontend origin (`FRONTEND_URL` env var). The `Authorization` header
MUST be in the allowed headers list.

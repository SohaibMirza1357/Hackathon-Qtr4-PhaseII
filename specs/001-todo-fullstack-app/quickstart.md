# Quickstart: Todo Full-Stack Web Application

**Branch**: `001-todo-fullstack-app` | **Date**: 2026-02-08

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- A Neon Serverless PostgreSQL database (free tier available)
- Git

## 1. Clone and Configure

```bash
git clone <repository-url>
cd Hackathon2-Phase-II
git checkout 001-todo-fullstack-app
```

## 2. Environment Variables

Create a `.env` file in the project root (or in both `frontend/` and
`backend/` directories):

```env
# Shared secret for JWT signing (MUST be the same for frontend and backend)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-long

# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Better Auth base URL (the Next.js app URL)
BETTER_AUTH_URL=http://localhost:3000

# Backend API URL (used by frontend to make API calls)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Frontend URL (used by backend for CORS)
FRONTEND_URL=http://localhost:3000
```

## 3. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Start the backend:
```bash
uvicorn app.main:app --reload --port 8000
```

The backend starts at `http://localhost:8000`. On first run, it
automatically creates the `task` table in the database.

## 4. Frontend Setup (Next.js)

```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

The frontend starts at `http://localhost:3000`.

## 5. Verify

1. Open `http://localhost:3000` in your browser
2. Click "Sign Up" and create an account
3. You should be redirected to the dashboard
4. Create a task and verify it appears in the list
5. Open an incognito window, create a second account
6. Verify the second account sees no tasks from the first

## 6. API Testing (Optional)

Test the backend directly:

```bash
# Sign in via the frontend first to get a JWT token, then:

# List tasks
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/tasks

# Create a task
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task"}' \
  http://localhost:8000/api/tasks
```

## Project Structure

```
Hackathon2-Phase-II/
├── backend/                  # Python FastAPI
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, startup
│   │   ├── models.py        # SQLModel Task model
│   │   ├── database.py      # DB engine and session
│   │   ├── auth.py          # JWT verification dependency
│   │   └── routers/
│   │       └── tasks.py     # Task CRUD endpoints
│   ├── requirements.txt
│   └── .env
├── frontend/                 # Next.js 16+ App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Home redirect
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx     # Sign-in form
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx     # Sign-up form
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx   # Dashboard layout (nav, sign-out)
│   │   │       ├── page.tsx     # Task list + create form
│   │   │       └── loading.tsx  # Loading state
│   │   └── lib/
│   │       ├── auth-client.ts   # Better Auth client
│   │       └── api.ts           # API client with JWT headers
│   ├── package.json
│   └── .env.local
├── specs/                    # Spec-driven artifacts
│   └── 001-todo-fullstack-app/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md
│       └── contracts/
└── .env.example
```

## Troubleshooting

- **CORS errors**: Ensure `FRONTEND_URL` in backend `.env` matches the
  Next.js URL exactly (including port).
- **401 on all requests**: Verify `BETTER_AUTH_SECRET` is identical in
  both frontend and backend `.env` files.
- **Database connection failed**: Verify `DATABASE_URL` uses the pooled
  connection endpoint from Neon (with `-pooler` suffix).
- **Better Auth errors**: Ensure `BETTER_AUTH_URL` matches the Next.js
  server URL and `DATABASE_URL` is accessible from the frontend server.

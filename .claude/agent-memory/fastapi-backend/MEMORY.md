# FastAPI Backend Agent Memory

## Project Context
- Project: Todo Full-Stack Web Application
- Stack: FastAPI + SQLModel + Neon PostgreSQL + Better Auth JWT
- Working directory: `C:\Users\User\Desktop\Hackathon2 Phase-II\backend\`
- Branch: master

## Project Structure (established)
```
backend/
  app/
    __init__.py          (empty)
    routers/
      __init__.py        (empty)
  requirements.txt
```

## Dependencies (requirements.txt)
- fastapi>=0.115.0
- uvicorn[standard]>=0.30.0
- sqlmodel>=0.0.22
- psycopg2-binary>=2.9.9
- PyJWT>=2.8.0
- python-dotenv>=1.0.0

## Authentication Pattern
- Better Auth issues JWT tokens on frontend login
- FastAPI verifies JWT tokens using PyJWT and shared secret
- Token passed in `Authorization: Bearer <token>` header
- Backend filters data by user_id extracted from token

## Completed Files
- config.py — loads DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL from .env via os.environ
- database.py — create_engine(DATABASE_URL, echo=False, pool_pre_ping=True); get_session() yields Session
- models.py — Task(SQLModel, table=True) with UUID PK; TaskCreate/TaskUpdate schemas (table=False)
- auth.py — get_current_user() depends on HTTPBearer, decodes JWT HS256, returns sub as user_id
- main.py — FastAPI app with lifespan (create_all on startup), CORS from FRONTEND_URL, GET / health check; includes tasks_router
- routers/tasks.py — POST /api/tasks (201), GET /api/tasks (200 list ordered by created_at desc), GET /api/tasks/{task_id} (200 or 404); all require get_current_user

## All Backend Files Complete

## Notes
- Use SQLModel (not pure SQLAlchemy) for ORM — combines Pydantic + SQLAlchemy
- Neon PostgreSQL requires psycopg2-binary driver
- See patterns.md for detailed implementation patterns

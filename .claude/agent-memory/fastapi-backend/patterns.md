# FastAPI Backend Patterns

## SQLModel Usage (not pure SQLAlchemy)
This project uses SQLModel which wraps both Pydantic and SQLAlchemy 2.0.
- Table models: `class Todo(SQLModel, table=True)`
- Response schemas: `class TodoResponse(SQLModel)` (no table=True)
- Engine: use `create_engine` from sqlmodel, async via `create_async_engine` if needed

## JWT Verification Pattern
Better Auth issues tokens; FastAPI verifies them:
```python
import jwt  # PyJWT
def verify_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
```

## Directory Layout Convention
- Routers live in `app/routers/`
- All router files imported and included in `main.py`
- Settings loaded via python-dotenv from `.env` file

## Database Connection (Neon)
- Connection string from env: DATABASE_URL=postgresql://...
- psycopg2-binary driver used (not asyncpg for now)

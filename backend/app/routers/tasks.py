from uuid import UUID
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.models import Task, TaskCreate, TaskUpdate

router = APIRouter(prefix="/api", tags=["tasks"])


def _verify_user(path_user_id: str, token_user_id: str) -> None:
    """Verify that the user_id in the URL matches the JWT token's sub claim."""
    if path_user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch",
        )


@router.post(
    "/{user_id}/tasks",
    response_model=Task,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
)
def create_task(
    user_id: str,
    task_in: TaskCreate,
    token_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Create a new task for the authenticated user."""
    _verify_user(user_id, token_user_id)
    task = Task(
        title=task_in.title,
        description=task_in.description,
        user_id=token_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get(
    "/{user_id}/tasks",
    response_model=List[Task],
    status_code=status.HTTP_200_OK,
    summary="List all tasks for the authenticated user",
)
def list_tasks(
    user_id: str,
    token_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[Task]:
    """Return all tasks belonging to the authenticated user, ordered by creation date descending."""
    _verify_user(user_id, token_user_id)
    statement = select(Task).where(Task.user_id == token_user_id).order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()
    return tasks


@router.get(
    "/{user_id}/tasks/{task_id}",
    response_model=Task,
    status_code=status.HTTP_200_OK,
    summary="Get a single task by ID",
)
def get_task(
    user_id: str,
    task_id: UUID,
    token_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Return a single task by ID. Returns 404 if not found or not owned by the authenticated user."""
    _verify_user(user_id, token_user_id)
    statement = select(Task).where(Task.id == task_id, Task.user_id == token_user_id)
    task = session.exec(statement).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.put(
    "/{user_id}/tasks/{task_id}",
    response_model=Task,
    status_code=status.HTTP_200_OK,
    summary="Update a task",
)
def update_task(
    user_id: str,
    task_id: UUID,
    task_in: TaskUpdate,
    token_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Update title and description of a task. Returns 404 if not found or not owned by the authenticated user."""
    _verify_user(user_id, token_user_id)
    statement = select(Task).where(Task.id == task_id, Task.user_id == token_user_id)
    task = session.exec(statement).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    task.title = task_in.title
    task.description = task_in.description
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.patch(
    "/{user_id}/tasks/{task_id}/complete",
    response_model=Task,
    status_code=status.HTTP_200_OK,
    summary="Toggle task completion status",
)
def toggle_task(
    user_id: str,
    task_id: UUID,
    token_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Toggle the is_completed flag on a task. Returns 404 if not found or not owned by the authenticated user."""
    _verify_user(user_id, token_user_id)
    statement = select(Task).where(Task.id == task_id, Task.user_id == token_user_id)
    task = session.exec(statement).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    task.is_completed = not task.is_completed
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete(
    "/{user_id}/tasks/{task_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a task",
)
def delete_task(
    user_id: str,
    task_id: UUID,
    token_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> dict:
    """Delete a task by ID. Returns 404 if not found or not owned by the authenticated user."""
    _verify_user(user_id, token_user_id)
    statement = select(Task).where(Task.id == task_id, Task.user_id == token_user_id)
    task = session.exec(statement).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    session.delete(task)
    session.commit()
    return {"detail": "Task deleted"}

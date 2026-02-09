from uuid import UUID
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.models import Task, TaskCreate, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post(
    "/",
    response_model=Task,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
)
def create_task(
    task_in: TaskCreate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Create a new task for the authenticated user."""
    task = Task(
        title=task_in.title,
        description=task_in.description,
        user_id=user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get(
    "/",
    response_model=List[Task],
    status_code=status.HTTP_200_OK,
    summary="List all tasks for the authenticated user",
)
def list_tasks(
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[Task]:
    """Return all tasks belonging to the authenticated user, ordered by creation date descending."""
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()
    return tasks


@router.get(
    "/{task_id}",
    response_model=Task,
    status_code=status.HTTP_200_OK,
    summary="Get a single task by ID",
)
def get_task(
    task_id: UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Return a single task by ID. Returns 404 if not found or not owned by the authenticated user."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.put(
    "/{task_id}",
    response_model=Task,
    status_code=status.HTTP_200_OK,
    summary="Update a task",
)
def update_task(
    task_id: UUID,
    task_in: TaskUpdate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Update title and description of a task. Returns 404 if not found or not owned by the authenticated user."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
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
    "/{task_id}/toggle",
    response_model=Task,
    status_code=status.HTTP_200_OK,
    summary="Toggle task completion status",
)
def toggle_task(
    task_id: UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Toggle the is_completed flag on a task. Returns 404 if not found or not owned by the authenticated user."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
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
    "/{task_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a task",
)
def delete_task(
    task_id: UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> dict:
    """Delete a task by ID. Returns 404 if not found or not owned by the authenticated user."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    session.delete(task)
    session.commit()
    return {"detail": "Task deleted"}

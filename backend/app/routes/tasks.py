"""Task API routes with filtering, search, and sorting"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, case
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.websocket.manager import manager

router = APIRouter(prefix="/api", tags=["tasks"])


@router.get("/projects/{project_id}/tasks", response_model=List[TaskResponse])
async def get_tasks(
    project_id: int,
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    assigned_to: Optional[int] = Query(None, description="Filter by assigned team member ID"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    sort_by: Optional[str] = Query("created_at", description="Sort by: created_at, due_date, priority"),
    order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    """
    Get all tasks for a project with optional filtering, search, and sorting.
    
    **Filters:**
    - **status**: Filter by task status (to_do, in_progress, done)
    - **priority**: Filter by priority (low, medium, high)
    - **assigned_to**: Filter by assigned team member ID
    - **search**: Search in task title and description
    
    **Sorting:**
    - **sort_by**: Field to sort by (created_at, due_date, priority)
    - **order**: Sort order (asc, desc)
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    
    # Build query
    query = db.query(Task).filter(Task.project_id == project_id)
    
    # Apply filters
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )
    
    # Apply sorting
    if sort_by == "due_date":
        # NULL due dates should appear last
        order_clause = Task.due_date.is_(None), Task.due_date
    elif sort_by == "priority":
        # Custom sort: high > medium > low
        order_clause = case(
            (Task.priority == TaskPriority.HIGH, 1),
            (Task.priority == TaskPriority.MEDIUM, 2),
            (Task.priority == TaskPriority.LOW, 3)
        )
    else:  # created_at or default
        order_clause = Task.created_at
    
    if order == "desc":
        if isinstance(order_clause, tuple):
            query = query.order_by(*[o.desc() for o in order_clause])
        else:
            query = query.order_by(order_clause.desc())
    else:
        if isinstance(order_clause, tuple):
            query = query.order_by(*order_clause)
        else:
            query = query.order_by(order_clause)
    
    tasks = query.all()
    return tasks


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task by ID"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return task


@router.post("/tasks/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task.
    
    - **project_id**: ID of the project (required)
    - **title**: Task title (required)
    - **description**: Task description (optional)
    - **status**: Task status (default: to_do)
    - **priority**: Task priority (default: medium)
    - **assigned_to**: ID of assigned team member (optional)
    - **due_date**: Task due date (optional)
    - **position**: Position within status column (default: 0)
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == task.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {task.project_id} not found"
        )
    
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Broadcast to WebSocket clients
    await manager.broadcast({
        "type": "task_created",
        "data": TaskResponse.model_validate(db_task).model_dump(mode="json")
    })
    
    return db_task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a task.
    
    All fields are optional - only provided fields will be updated.
    """
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    
    # Update only provided fields
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    
    # Broadcast to WebSocket clients
    await manager.broadcast({
        "type": "task_updated",
        "data": TaskResponse.model_validate(db_task).model_dump(mode="json")
    })
    
    return db_task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    
    task_id_to_broadcast = db_task.id
    project_id_to_broadcast = db_task.project_id
    
    db.delete(db_task)
    db.commit()
    
    # Broadcast to WebSocket clients
    await manager.broadcast({
        "type": "task_deleted",
        "data": {"id": task_id_to_broadcast, "project_id": project_id_to_broadcast}
    })
    
    return None

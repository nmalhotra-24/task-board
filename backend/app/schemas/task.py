"""Task schemas for request/response validation"""

from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
from enum import Enum


class TaskStatus(str, Enum):
    """Task status enumeration"""
    TO_DO = "to_do"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskPriority(str, Enum):
    """Task priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskBase(BaseModel):
    """Base schema with common task fields"""
    title: str = Field(..., min_length=1, max_length=500, description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    status: TaskStatus = Field(default=TaskStatus.TO_DO, description="Task status")
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, description="Task priority")
    assigned_to: Optional[int] = Field(None, description="ID of assigned team member")
    due_date: Optional[date] = Field(None, description="Task due date")
    position: int = Field(default=0, description="Position within status column")


class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    project_id: int = Field(..., description="ID of the project this task belongs to")


class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None
    position: Optional[int] = None


class TaskResponse(TaskBase):
    """Schema for task response"""
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

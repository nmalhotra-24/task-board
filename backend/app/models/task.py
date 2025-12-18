"""Task model"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date, Enum, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TaskStatus(str, enum.Enum):
    """Task status enumeration"""
    TO_DO = "to_do"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskPriority(str, enum.Enum):
    """Task priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(Base):
    """
    Task model representing a task within a project.
    
    Relationships:
    - Many tasks belong to one project
    - Many tasks can be assigned to one team member
    
    Constraints:
    - status must be one of: to_do, in_progress, done
    - priority must be one of: low, medium, high
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(TaskStatus, native_enum=False, length=50),
        nullable=False,
        default=TaskStatus.TO_DO,
        index=True
    )
    priority = Column(
        Enum(TaskPriority, native_enum=False, length=20),
        nullable=False,
        default=TaskPriority.MEDIUM,
        index=True
    )
    assigned_to = Column(
        Integer,
        ForeignKey("team_members.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    due_date = Column(Date, nullable=True, index=True)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("TeamMember", back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"

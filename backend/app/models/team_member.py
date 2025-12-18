"""Team Member model"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class TeamMember(Base):
    """
    Team Member model representing users who can be assigned to tasks.
    
    Relationships:
    - One team member can be assigned to many tasks
    """
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    tasks = relationship("Task", back_populates="assignee")

    def __repr__(self):
        return f"<TeamMember(id={self.id}, name='{self.name}', email='{self.email}')>"

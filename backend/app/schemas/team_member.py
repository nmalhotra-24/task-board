"""Team Member schemas for request/response validation"""

from pydantic import BaseModel, EmailStr, Field, HttpUrl
from datetime import datetime
from typing import Optional


class TeamMemberBase(BaseModel):
    """Base schema with common team member fields"""
    name: str = Field(..., min_length=1, max_length=255, description="Team member name")
    email: EmailStr = Field(..., description="Team member email address")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Avatar image URL")


class TeamMemberCreate(TeamMemberBase):
    """Schema for creating a new team member"""
    pass


class TeamMemberUpdate(BaseModel):
    """Schema for updating a team member (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = Field(None, max_length=500)


class TeamMemberResponse(TeamMemberBase):
    """Schema for team member response"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

"""Team Member API routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.team_member import TeamMember
from app.schemas.team_member import TeamMemberCreate, TeamMemberUpdate, TeamMemberResponse
from app.websocket.manager import manager

router = APIRouter(prefix="/api/team-members", tags=["team-members"])


@router.get("/", response_model=List[TeamMemberResponse])
async def get_team_members(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all team members with optional pagination.
    
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum number of records to return (default: 100)
    """
    members = db.query(TeamMember).offset(skip).limit(limit).all()
    return members


@router.get("/{member_id}", response_model=TeamMemberResponse)
async def get_team_member(member_id: int, db: Session = Depends(get_db)):
    """Get a specific team member by ID"""
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team member with id {member_id} not found"
        )
    return member


@router.post("/", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def create_team_member(member: TeamMemberCreate, db: Session = Depends(get_db)):
    """
    Create a new team member.
    
    - **name**: Team member name (required)
    - **email**: Team member email (required, must be unique)
    - **avatar_url**: Avatar image URL (optional)
    """
    # Check if email already exists
    existing_member = db.query(TeamMember).filter(TeamMember.email == member.email).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Team member with email {member.email} already exists"
        )
    
    db_member = TeamMember(**member.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    
    # Broadcast team member creation via WebSocket
    await manager.broadcast({
        "type": "team_member_created",
        "data": TeamMemberResponse.model_validate(db_member).model_dump(mode='json')
    })
    
    return db_member


@router.put("/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    member_id: int,
    member_update: TeamMemberUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a team member.
    
    All fields are optional - only provided fields will be updated.
    """
    db_member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team member with id {member_id} not found"
        )
    
    # Check if email is being updated and already exists
    update_data = member_update.model_dump(exclude_unset=True)
    if "email" in update_data:
        existing_member = db.query(TeamMember).filter(
            TeamMember.email == update_data["email"],
            TeamMember.id != member_id
        ).first()
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team member with email {update_data['email']} already exists"
            )
    
    # Update only provided fields
    for field, value in update_data.items():
        setattr(db_member, field, value)
    
    db.commit()
    db.refresh(db_member)
    
    # Broadcast team member update via WebSocket
    await manager.broadcast({
        "type": "team_member_updated",
        "data": TeamMemberResponse.model_validate(db_member).model_dump(mode='json')
    })
    
    return db_member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team_member(member_id: int, db: Session = Depends(get_db)):
    """
    Delete a team member.
    
    Note: Tasks assigned to this member will have assigned_to set to NULL.
    """
    db_member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team member with id {member_id} not found"
        )
    
    # Broadcast team member deletion via WebSocket
    await manager.broadcast({
        "type": "team_member_deleted",
        "data": {"id": member_id}
    })
    
    db.delete(db_member)
    db.commit()
    return None

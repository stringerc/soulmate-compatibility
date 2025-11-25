"""
Soul Journey Journaling API Routes
Handles journaling entries for self-reflection and relationship tracking
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid
from pydantic import BaseModel

from database.connection import get_db
from database.soulmates_models import SoulJourneyEntry, User, SoulJourneyEntryType
from core_domain import logSoulmatesEvent, SoulmatesEvent
from .auth import get_current_user_id

router = APIRouter()


class JournalEntryCreate(BaseModel):
    body: str
    entry_type: str = "SELF_REFLECTION"
    title: Optional[str] = None
    tags: Optional[List[str]] = None
    mood_score: Optional[int] = None
    bond_id: Optional[str] = None


@router.post("/journaling/entries")
async def create_entry(
    user_id: str = Depends(get_current_user_id),
    entry_data: JournalEntryCreate = Body(...),
    db: Session = Depends(get_db)
):
    """Create a new journal entry"""
    user_uuid = uuid.UUID(user_id)
    
    # Validate user
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create entry
    entry = SoulJourneyEntry(
        owner_user_id=user_uuid,
        bond_id=uuid.UUID(entry_data.bond_id) if entry_data.bond_id else None,
        entry_type=SoulJourneyEntryType[entry_data.entry_type],
        title=entry_data.title,
        body=entry_data.body,
        tags=entry_data.tags or [],
        mood_score=entry_data.mood_score,
    )
    
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    # Log event
    logSoulmatesEvent(SoulmatesEvent(
        name="souljourney_entry_created",
        userId=user_id,
        bondId=entry_data.bond_id,
        payload={"entry_type": entry_data.entry_type},
    ))
    
    return {"success": True, "entry": entry}


@router.get("/journaling/entries")
async def list_entries(
    user_id: str = Depends(get_current_user_id),
    bond_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List journal entries for user"""
    user_uuid = uuid.UUID(user_id)
    
    query = db.query(SoulJourneyEntry).filter(SoulJourneyEntry.owner_user_id == user_uuid)
    
    if bond_id:
        query = query.filter(SoulJourneyEntry.bond_id == uuid.UUID(bond_id))
    
    entries = query.order_by(SoulJourneyEntry.created_at.desc()).limit(limit).all()
    
    return {"entries": entries}


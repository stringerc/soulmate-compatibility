"""
Soul Profile API Routes
Handles SoulProfile CRUD and onboarding
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from database.connection import get_db
from database.soulmates_models import SoulProfile, User
from core_domain import logSoulmatesEvent, SoulmatesEvent
from .auth import get_current_user_id

router = APIRouter()


@router.get("/profile")
async def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get user's soul profile"""
    profile = db.query(SoulProfile).filter(SoulProfile.user_id == uuid.UUID(user_id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/profile")
async def create_or_update_profile(
    user_id: str = Depends(get_current_user_id),
    primary_archetype: Optional[str] = None,
    attachment_style: Optional[str] = None,
    love_languages: Optional[list] = None,
    values_vector: Optional[dict] = None,
    astrology_meta: Optional[dict] = None,
    numerology_meta: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    """Create or update soul profile (onboarding)"""
    user_uuid = uuid.UUID(user_id)
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if profile exists
    profile = db.query(SoulProfile).filter(SoulProfile.user_id == user_uuid).first()
    
    if profile:
        # Update existing
        if primary_archetype:
            profile.primary_archetype = primary_archetype
        if attachment_style:
            profile.attachment_style = attachment_style
        if love_languages:
            profile.love_languages = love_languages
        if values_vector:
            profile.values_vector = values_vector
        if astrology_meta:
            profile.astrology_meta = astrology_meta
        if numerology_meta:
            profile.numerology_meta = numerology_meta
    else:
        # Create new
        profile = SoulProfile(
            user_id=user_uuid,
            primary_archetype=primary_archetype,
            attachment_style=attachment_style,
            love_languages=love_languages or [],
            values_vector=values_vector or {},
            astrology_meta=astrology_meta,
            numerology_meta=numerology_meta,
        )
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    
    # Log event
    logSoulmatesEvent(SoulmatesEvent(
        name="onboard_completed",
        userId=user_id,
    ))
    
    return {"success": True, "profile": profile}


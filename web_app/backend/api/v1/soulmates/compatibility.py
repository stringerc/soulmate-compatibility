"""
Compatibility Explorer API Routes
Handles compatibility calculations and explorer features
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import uuid

from database.connection import get_db
from database.soulmates_models import CompatibilitySnapshot, User
from soulmates_engine import computeCompatibilitySnapshot, CompatibilityOptions
from core_domain import logSoulmatesEvent, SoulmatesEvent
from .auth import get_current_user_id

router = APIRouter()


@router.post("/compatibility/explore")
async def explore_compatibility(
    user_id: str = Depends(get_current_user_id),
    target_user_id: Optional[str] = None,
    hypothetical_profile: Optional[Dict[str, Any]] = None,
    allow_astrology: bool = True,
    allow_numerology: bool = True,
    db: Session = Depends(get_db)
):
    """Run compatibility explorer (Phase 1)"""
    if not target_user_id and not hypothetical_profile:
        raise HTTPException(status_code=400, detail="Either target_user_id or hypothetical_profile required")
    
    # Validate user exists
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Compute compatibility
    options = CompatibilityOptions(
        allow_astrology=allow_astrology,
        allow_numerology=allow_numerology,
    )
    
    target = {}
    if target_user_id:
        target["userId"] = target_user_id
    else:
        target["hypotheticalProfile"] = hypothetical_profile
    
    snapshot_result = await computeCompatibilitySnapshot(
        user_id,
        target,
        options,
    )
    
    # Persist snapshot
    snapshot = CompatibilitySnapshot(
        user_a_id=uuid.UUID(user_id),
        user_b_id=uuid.UUID(target_user_id) if target_user_id else None,
        model_version=snapshot_result.model_version,
        score_overall=snapshot_result.score_overall,
        score_axes=snapshot_result.score_axes,
        astro_used=snapshot_result.astro_used,
        num_used=snapshot_result.num_used,
        soulmate_flag=snapshot_result.soulmate_flag,
        debug_metrics=snapshot_result.debug_metrics,
        explanation_summary=snapshot_result.explanation_summary,
        explanation_details=snapshot_result.explanation_details,
    )
    
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    
    # Log event
    logSoulmatesEvent(SoulmatesEvent(
        name="comp_explorer_run",
        userId=user_id,
        payload={"snapshot_id": str(snapshot.id)},
    ))
    
    return {"success": True, "snapshot": snapshot}


"""
Resonance Lab API Routes
Handles resonance data retrieval for solo and couple views
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from database.connection import get_db
from database.soulmates_models import RelationshipBond, User
from core_domain import getResonanceSummaryForUser
from .auth import get_current_user_id

router = APIRouter()


@router.get("/resonance")
async def get_solo_resonance(
    window_days: int = Query(30, ge=1, le=365),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get solo resonance summary for current user"""
    try:
        summary = await getResonanceSummaryForUser(
            user_id,
            {"days": window_days}
        )
        return {
            "window_start": summary.window_start.isoformat(),
            "window_end": summary.window_end.isoformat(),
            "metrics": summary.metrics,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bonds/{bond_id}/resonance")
async def get_couple_resonance(
    bond_id: str,
    window_days: int = Query(30, ge=1, le=365),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get couple resonance summary for a bond"""
    # Verify bond exists and user is part of it
    bond = db.query(RelationshipBond).filter(RelationshipBond.id == uuid.UUID(bond_id)).first()
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    
    user_uuid = uuid.UUID(user_id)
    if bond.user_a_id != user_uuid and bond.user_b_id != user_uuid:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if bond.status != "ACTIVE":
        raise HTTPException(status_code=400, detail="Bond is not active")
    
    try:
        # Get resonance for both users
        user_a_summary = await getResonanceSummaryForUser(
            str(bond.user_a_id),
            {"days": window_days}
        )
        user_b_summary = await getResonanceSummaryForUser(
            str(bond.user_b_id),
            {"days": window_days}
        )
        
        # Calculate correlations (placeholder - in production, use actual correlation)
        correlation = {
            "stressCorrelation": 0.65,  # Placeholder
            "connectionCorrelation": 0.82,  # Placeholder
            "moodCorrelation": 0.78,  # Placeholder
        }
        
        return {
            "window_start": user_a_summary.window_start.isoformat(),
            "window_end": user_a_summary.window_end.isoformat(),
            "user_a_metrics": user_a_summary.metrics,
            "user_b_metrics": user_b_summary.metrics,
            "correlation": correlation,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


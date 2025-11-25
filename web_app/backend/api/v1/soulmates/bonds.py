"""
Relationship Bond API Routes
Handles bond invites, acceptance, and couple mode
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from datetime import datetime

from database.connection import get_db
from database.soulmates_models import (
    RelationshipBond, BondInvite, User,
    BondStatus, BondType, BondInviteStatus
)
from core_domain import logSoulmatesEvent, SoulmatesEvent
from .auth import get_current_user_id

router = APIRouter()


@router.post("/bonds/invite")
async def create_bond_invite(
    from_user_id: str = Depends(get_current_user_id),
    to_user_id: Optional[str] = None,
    to_email: Optional[str] = None,
    bond_type: str = "ROMANTIC",
    db: Session = Depends(get_db)
):
    """Create a bond invite"""
    if not to_user_id and not to_email:
        raise HTTPException(status_code=400, detail="Either to_user_id or to_email required")
    
    from_user_uuid = uuid.UUID(from_user_id)
    
    # Validate from_user exists
    from_user = db.query(User).filter(User.id == from_user_uuid).first()
    if not from_user:
        raise HTTPException(status_code=404, detail="From user not found")
    
    # Create invite
    invite = BondInvite(
        from_user_id=from_user_uuid,
        to_user_id=uuid.UUID(to_user_id) if to_user_id else None,
        to_email=to_email,
        bond_type=BondType[bond_type],
        status=BondInviteStatus.PENDING,
        invite_token=str(uuid.uuid4()) if to_email else None,
    )
    
    db.add(invite)
    db.commit()
    db.refresh(invite)
    
    # Log event
    logSoulmatesEvent(SoulmatesEvent(
        name="bond_invite_sent",
        userId=from_user_id,
        payload={"invite_id": str(invite.id)},
    ))
    
    return {"success": True, "invite": invite}


@router.post("/bonds/accept")
async def accept_bond_invite(
    user_id: str = Depends(get_current_user_id),
    invite_id: Optional[str] = None,
    invite_token: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Accept a bond invite"""
    if not invite_id and not invite_token:
        raise HTTPException(status_code=400, detail="Either invite_id or invite_token required")
    
    # Find invite
    if invite_id:
        invite = db.query(BondInvite).filter(BondInvite.id == uuid.UUID(invite_id)).first()
    else:
        invite = db.query(BondInvite).filter(BondInvite.invite_token == invite_token).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    
    if invite.status != BondInviteStatus.PENDING:
        raise HTTPException(status_code=400, detail="Invite already processed")
    
    # Update invite
    invite.status = BondInviteStatus.ACCEPTED
    invite.accepted_at = datetime.utcnow()
    
    # Create bond
    to_user_id = invite.to_user_id or uuid.UUID(user_id)
    bond = RelationshipBond(
        user_a_id=invite.from_user_id,
        user_b_id=to_user_id,
        status=BondStatus.ACTIVE,
        bond_type=invite.bond_type,
        initiator_user_id=invite.from_user_id,
        started_at=datetime.utcnow(),
    )
    
    db.add(bond)
    db.commit()
    db.refresh(bond)
    
    # Log event
    logSoulmatesEvent(SoulmatesEvent(
        name="bond_invite_accepted",
        userId=user_id,
        bondId=str(bond.id),
    ))
    
    return {"success": True, "bond": bond}


@router.post("/bonds/end")
async def end_bond(
    user_id: str = Depends(get_current_user_id),
    bond_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """End a relationship bond"""
    if not bond_id:
        raise HTTPException(status_code=400, detail="bond_id is required")
    bond = db.query(RelationshipBond).filter(RelationshipBond.id == uuid.UUID(bond_id)).first()
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    
    # Verify user is part of bond
    user_uuid = uuid.UUID(user_id)
    if bond.user_a_id != user_uuid and bond.user_b_id != user_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to end this bond")
    
    # Update bond
    bond.status = BondStatus.ENDED
    bond.ended_by_user_id = user_uuid
    bond.ended_at = datetime.utcnow()
    
    db.commit()
    
    # Log event
    logSoulmatesEvent(SoulmatesEvent(
        name="bond_ended",
        userId=user_id,
        bondId=str(bond.id),
    ))
    
    return {"success": True}


@router.get("/bonds")
async def list_bonds(
    user_id: str = Depends(get_current_user_id),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List user's bonds"""
    user_uuid = uuid.UUID(user_id)
    
    query = db.query(RelationshipBond).filter(
        (RelationshipBond.user_a_id == user_uuid) | (RelationshipBond.user_b_id == user_uuid)
    )
    
    if status:
        query = query.filter(RelationshipBond.status == BondStatus[status])
    else:
        # Default: only show active bonds
        query = query.filter(RelationshipBond.status == BondStatus.ACTIVE)
    
    bonds = query.order_by(RelationshipBond.created_at.desc()).all()
    
    return {"bonds": bonds}


@router.get("/bonds/{bond_id}")
async def get_bond(
    bond_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get bond details"""
    bond = db.query(RelationshipBond).filter(RelationshipBond.id == uuid.UUID(bond_id)).first()
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    
    # Verify user is part of bond
    user_uuid = uuid.UUID(user_id)
    if bond.user_a_id != user_uuid and bond.user_b_id != user_uuid:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Log event
    logSoulmatesEvent(SoulmatesEvent(
        name="bond_dashboard_viewed",
        userId=user_id,
        bondId=str(bond.id),
    ))
    
    return bond


@router.get("/bonds/{bond_id}/compatibility")
async def get_bond_compatibility(
    bond_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get compatibility snapshot for a bond"""
    from database.soulmates_models import CompatibilitySnapshot
    
    bond = db.query(RelationshipBond).filter(RelationshipBond.id == uuid.UUID(bond_id)).first()
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    
    # Verify user is part of bond
    user_uuid = uuid.UUID(user_id)
    if bond.user_a_id != user_uuid and bond.user_b_id != user_uuid:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Find most recent compatibility snapshot for this bond
    snapshot = db.query(CompatibilitySnapshot).filter(
        (
            (CompatibilitySnapshot.user_a_id == bond.user_a_id) &
            (CompatibilitySnapshot.user_b_id == bond.user_b_id)
        ) | (
            (CompatibilitySnapshot.user_a_id == bond.user_b_id) &
            (CompatibilitySnapshot.user_b_id == bond.user_a_id)
        )
    ).order_by(CompatibilitySnapshot.created_at.desc()).first()
    
    if not snapshot:
        raise HTTPException(status_code=404, detail="No compatibility snapshot found for this bond")
    
    return {"snapshot": snapshot}


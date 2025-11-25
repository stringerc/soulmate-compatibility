"""
Plan Gating Helper Functions
Check user subscription tier and permissions
"""

from sqlalchemy.orm import Session
from typing import Optional
import uuid
from database.soulmates_models import SoulmatesSubscription, SoulmatesPlan, SoulmatesPlanTier


def get_user_soulmates_tier(
    user_id: str,
    bond_id: Optional[str] = None,
    db: Session = None
) -> SoulmatesPlanTier:
    """
    Get user's current subscription tier
    Returns FREE if no active subscription
    """
    if not db:
        return SoulmatesPlanTier.FREE
    
    query = db.query(SoulmatesSubscription).filter(
        SoulmatesSubscription.user_id == uuid.UUID(user_id),
        SoulmatesSubscription.is_active == True,
    )
    
    if bond_id:
        query = query.filter(SoulmatesSubscription.bond_id == uuid.UUID(bond_id))
    
    subscription = query.first()
    
    if not subscription:
        return SoulmatesPlanTier.FREE
    
    return subscription.plan.tier


def can_run_comp_explorer(tier: SoulmatesPlanTier, runs_this_month: int = 0) -> bool:
    """Check if user can run compatibility explorer"""
    if tier == SoulmatesPlanTier.FREE:
        return runs_this_month < 5  # Free tier: 5 runs/month
    # PLUS and COUPLE_PREMIUM: unlimited
    return True


def get_comp_explorer_run_limit(tier: SoulmatesPlanTier) -> Optional[int]:
    """Get compatibility explorer run limit for tier"""
    if tier == SoulmatesPlanTier.FREE:
        return 5
    return None  # Unlimited


def can_access_resonance_lab(tier: SoulmatesPlanTier) -> bool:
    """Check if user can access Resonance Lab"""
    return tier == SoulmatesPlanTier.COUPLE_PREMIUM


def can_create_bond(tier: SoulmatesPlanTier, current_bonds: int = 0) -> bool:
    """Check if user can create a new bond"""
    if tier == SoulmatesPlanTier.FREE:
        return current_bonds < 0  # Free: no bonds
    elif tier == SoulmatesPlanTier.PLUS:
        return current_bonds < 1  # Plus: 1 bond
    # COUPLE_PREMIUM: unlimited
    return True


def get_max_bonds(tier: SoulmatesPlanTier) -> Optional[int]:
    """Get maximum bonds for tier"""
    if tier == SoulmatesPlanTier.FREE:
        return 0
    elif tier == SoulmatesPlanTier.PLUS:
        return 1
    return None  # Unlimited


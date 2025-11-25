"""
Billing and Payments API Routes
Handles Stripe checkout, webhooks, and subscription management
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import os

from database.connection import get_db
from database.soulmates_models import SoulmatesPlan, SoulmatesSubscription, User
from .auth import get_current_user_id

# Import payment adapter
# Add packages path to sys.path
import sys
from pathlib import Path
backend_dir = Path(__file__).parent.parent.parent.parent
packages_dir = backend_dir.parent.parent / "packages" / "core-domain" / "python"
sys.path.insert(0, str(packages_dir))

try:
    from payments import create_payment_adapter
except ImportError:
    # Fallback: try relative import
    import sys
    import os
    core_domain_path = os.path.join(os.path.dirname(__file__), "../../../../packages/core-domain/python")
    if os.path.exists(core_domain_path):
        sys.path.insert(0, core_domain_path)
        from payments import create_payment_adapter
    else:
        # If package doesn't exist, create a simple inline adapter
        def create_payment_adapter():
            raise ValueError("Payment adapter not available - packages/core-domain/python/payments.py not found")

router = APIRouter()

# Map plan slugs to Stripe price IDs
# First try environment variables, then fall back to config file
def _load_price_ids():
    """Load price IDs from env vars or config file"""
    price_ids = {
        "plus": os.getenv("STRIPE_PRICE_PLUS_MONTHLY"),
        "couple-premium": os.getenv("STRIPE_PRICE_COUPLE_PREMIUM_MONTHLY"),
    }
    
    # If env vars not set, try config file
    if not price_ids["plus"] or not price_ids["couple-premium"]:
        try:
            import json
            config_path = os.path.join(os.path.dirname(__file__), "../../../config/stripe_prices.json")
            if os.path.exists(config_path):
                with open(config_path, "r") as f:
                    config = json.load(f)
                    price_ids["plus"] = price_ids["plus"] or config.get("plus")
                    price_ids["couple-premium"] = price_ids["couple-premium"] or config.get("couple-premium")
        except Exception:
            pass
    
    return price_ids

PLAN_PRICE_IDS = _load_price_ids()


@router.post("/billing/checkout")
async def create_checkout(
    user_id: str = Depends(get_current_user_id),
    plan_slug: str = None,
    bond_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Create Stripe checkout session"""
    if not plan_slug:
        raise HTTPException(status_code=400, detail="plan_slug is required")
    
    # Find plan
    plan = db.query(SoulmatesPlan).filter(SoulmatesPlan.slug == plan_slug).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Free plan doesn't need checkout
    if plan.tier.value == "FREE":
        raise HTTPException(status_code=400, detail="Free plan doesn't require payment")
    
    # Get Stripe price ID for this plan
    price_id = PLAN_PRICE_IDS.get(plan_slug)
    if not price_id:
        raise HTTPException(
            status_code=500,
            detail=f"Stripe price ID not configured for plan: {plan_slug}. Set STRIPE_PRICE_{plan_slug.upper().replace('-', '_')}_MONTHLY"
        )
    
    try:
        # Create payment adapter
        adapter = create_payment_adapter()
        
        # Build success and cancel URLs
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        success_url = f"{frontend_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{frontend_url}/checkout/cancel"
        
        # Create checkout session
        metadata = {
            "user_id": user_id,
            "plan_slug": plan_slug,
        }
        if bond_id:
            metadata["bond_id"] = bond_id
        
        result = await adapter.create_checkout_session(
            mode="subscription",
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata,
        )
        
        return {
            "success": True,
            "checkout_url": result["url"],
        }
    except ValueError as e:
        # Payment adapter not configured (missing STRIPE_SECRET_KEY)
        raise HTTPException(
            status_code=503,
            detail=f"Payment system not configured: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create checkout session: {str(e)}"
        )


@router.get("/billing/subscription")
async def get_subscription(
    user_id: str = Depends(get_current_user_id),
    bond_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get user's active subscription"""
    query = db.query(SoulmatesSubscription).filter(
        SoulmatesSubscription.user_id == uuid.UUID(user_id),
        SoulmatesSubscription.is_active == True,
    )
    
    if bond_id:
        query = query.filter(SoulmatesSubscription.bond_id == uuid.UUID(bond_id))
    
    subscription = query.first()
    
    if not subscription:
        return {"tier": "FREE", "subscription": None}
    
    return {
        "tier": subscription.plan.tier.value,
        "subscription": {
            "id": str(subscription.id),
            "plan_slug": subscription.plan.slug,
            "plan_name": subscription.plan.name,
            "is_active": subscription.is_active,
            "started_at": subscription.started_at.isoformat() if subscription.started_at else None,
            "ends_at": subscription.ends_at.isoformat() if subscription.ends_at else None,
        },
    }


@router.get("/billing/plans")
async def list_plans(
    db: Session = Depends(get_db)
):
    """List all available plans"""
    plans = db.query(SoulmatesPlan).filter(SoulmatesPlan.is_active == True).all()
    
    return {
        "plans": [
            {
                "slug": plan.slug,
                "name": plan.name,
                "description": plan.description,
                "tier": plan.tier.value,
                "max_comp_explorer_runs_per_month": plan.max_comp_explorer_runs_per_month,
                "max_active_bonds": plan.max_active_bonds,
                "includes_resonance_lab": plan.includes_resonance_lab,
            }
            for plan in plans
        ]
    }


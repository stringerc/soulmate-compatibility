"""
Stripe Webhook Handler for Soulmates Subscriptions
Handles checkout.session.completed, subscription updates, etc.
"""

from fastapi import APIRouter, Request, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from datetime import datetime

from database.connection import get_db
from database.soulmates_models import SoulmatesSubscription, SoulmatesPlan, User
import os
import hmac
import hashlib

router = APIRouter()

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


def verify_stripe_signature(payload: bytes, signature: str) -> bool:
    """Verify Stripe webhook signature"""
    if not STRIPE_WEBHOOK_SECRET:
        return False  # In development, might skip verification
    
    try:
        expected_sig = hmac.new(
            STRIPE_WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_sig, signature)
    except Exception:
        return False


@router.post("/billing/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="stripe-signature"),
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events"""
    payload = await request.body()
    
    # Verify signature
    if not verify_stripe_signature(payload, stripe_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Parse event
    try:
        import stripe
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")
    
    # Handle event types
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        metadata = session.get("metadata", {})
        
        user_id = metadata.get("user_id")
        plan_slug = metadata.get("plan_slug")
        bond_id = metadata.get("bond_id")
        
        if user_id and plan_slug:
            # Find plan
            plan = db.query(SoulmatesPlan).filter(SoulmatesPlan.slug == plan_slug).first()
            if plan:
                # Create or update subscription
                subscription = SoulmatesSubscription(
                    user_id=uuid.UUID(user_id),
                    bond_id=uuid.UUID(bond_id) if bond_id else None,
                    plan_id=plan.id,
                    is_active=True,
                    external_provider="stripe",
                    external_ref=subscription_id,
                    started_at=datetime.utcnow(),
                )
                db.add(subscription)
                db.commit()
    
    elif event["type"] == "customer.subscription.updated":
        subscription_obj = event["data"]["object"]
        subscription_id = subscription_obj["id"]
        
        # Find subscription
        subscription = db.query(SoulmatesSubscription).filter(
            SoulmatesSubscription.external_ref == subscription_id
        ).first()
        
        if subscription:
            # Update status based on Stripe subscription status
            stripe_status = subscription_obj.get("status")
            subscription.is_active = stripe_status in ["active", "trialing"]
            if stripe_status == "canceled":
                subscription.canceled_at = datetime.utcnow()
            db.commit()
    
    elif event["type"] == "customer.subscription.deleted":
        subscription_obj = event["data"]["object"]
        subscription_id = subscription_obj["id"]
        
        # Find and deactivate subscription
        subscription = db.query(SoulmatesSubscription).filter(
            SoulmatesSubscription.external_ref == subscription_id
        ).first()
        
        if subscription:
            subscription.is_active = False
            subscription.canceled_at = datetime.utcnow()
            db.commit()
    
    return {"received": True}


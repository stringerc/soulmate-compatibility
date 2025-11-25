"""
Soulmates API Routes
Phase-based feature rollout for soulmates.syncscript.app
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/soulmates", tags=["soulmates"])

# Import route modules
from . import profiles, bonds, journaling, compatibility, billing, organizations, resonance, stripe_webhook, auth_routes

router.include_router(profiles.router)
router.include_router(bonds.router)
router.include_router(journaling.router)
router.include_router(compatibility.router)
router.include_router(billing.router)
router.include_router(organizations.router)
router.include_router(resonance.router)
router.include_router(stripe_webhook.router)
router.include_router(auth_routes.router)


"""
API Authentication and Authorization
Handles API key verification and partner authentication
"""

import hashlib
import secrets
from datetime import datetime
from typing import Optional, Dict
from fastapi import Header, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import Partner, APIKey


# Rate limit configuration per tier
RATE_LIMITS = {
    "starter": {
        "per_minute": 60,
        "per_day": 10000,
        "batch_limit": 10,
    },
    "professional": {
        "per_minute": 300,
        "per_day": 100000,
        "batch_limit": 50,
    },
    "enterprise": {
        "per_minute": 1000,
        "per_day": 1000000,
        "batch_limit": 100,
    },
    "research": {
        "per_minute": 100,
        "per_day": 50000,
        "batch_limit": 20,
    },
}


def generate_api_key(partner_id: str) -> str:
    """Generate secure API key"""
    random_part = secrets.token_urlsafe(32)
    # Format: sk_live_{first8chars}_{random}
    key = f"sk_live_{partner_id[:8]}_{random_part}"
    return key


def hash_api_key(key: str) -> str:
    """Hash API key for storage (SHA-256)"""
    return hashlib.sha256(key.encode()).hexdigest()


def verify_api_key_hash(key: str, key_hash: str) -> bool:
    """Verify API key against stored hash"""
    computed_hash = hash_api_key(key)
    return computed_hash == key_hash


async def get_partner_by_api_key(
    api_key: str,
    db: Session = Depends(get_db)
) -> Optional[Dict]:
    """
    Get partner information by API key
    
    Returns partner dict if valid, None otherwise
    """
    if not api_key:
        return None
    
    # Hash the provided key
    key_hash = hash_api_key(api_key)
    
    # Find API key in database
    db_key = db.query(APIKey).filter(
        APIKey.key_hash == key_hash,
        APIKey.revoked_at.is_(None)  # Not revoked
    ).first()
    
    if not db_key:
        return None
    
    # Update last used timestamp
    db_key.last_used_at = datetime.utcnow()
    db.commit()
    
    # Get partner
    partner = db.query(Partner).filter(Partner.id == db_key.partner_id).first()
    
    if not partner or partner.status != "active":
        return None
    
    return {
        "id": str(partner.id),
        "company_name": partner.company_name,
        "email": partner.email,
        "tier": partner.tier,
        "status": partner.status,
        "ip_whitelist": partner.ip_whitelist or [],
    }


async def verify_api_key_dependency(
    request: Request,
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> Dict:
    """
    FastAPI dependency to verify API key
    
    Usage:
        @app.post("/endpoint")
        async def endpoint(partner: dict = Depends(verify_api_key_dependency)):
            ...
    """
    # Get partner by API key
    partner = await get_partner_by_api_key(x_api_key, db)
    
    if not partner:
        raise HTTPException(
            status_code=401,
            detail="Invalid or inactive API key"
        )
    
    # Check IP whitelist if configured
    if partner.get("ip_whitelist"):
        client_ip = request.client.host
        if client_ip not in partner["ip_whitelist"]:
            raise HTTPException(
                status_code=403,
                detail=f"IP {client_ip} not whitelisted"
            )
    
    return partner


def check_rate_limit(
    partner_id: str,
    endpoint: str,
    db: Session
) -> tuple[bool, Optional[str]]:
    """
    Check if partner is within rate limits
    
    Returns: (is_allowed, error_message)
    
    Note: For production, use Redis for rate limiting.
    This is a database-based fallback.
    """
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        return False, "Partner not found"
    
    tier = partner.tier
    limits = RATE_LIMITS.get(tier, RATE_LIMITS["starter"])
    
    # Check per-minute limit (simplified - use Redis in production)
    # For now, we'll track in database
    from database.models import APIUsage
    from datetime import datetime, timedelta
    
    now = datetime.utcnow()
    minute_ago = now - timedelta(minutes=1)
    
    minute_count = db.query(APIUsage).filter(
        APIUsage.partner_id == partner_id,
        APIUsage.timestamp >= minute_ago
    ).count()
    
    if minute_count >= limits["per_minute"]:
        return False, f"Rate limit exceeded: {limits['per_minute']} requests per minute"
    
    # Check per-day limit
    day_ago = now - timedelta(days=1)
    day_count = db.query(APIUsage).filter(
        APIUsage.partner_id == partner_id,
        APIUsage.timestamp >= day_ago
    ).count()
    
    if day_count >= limits["per_day"]:
        return False, f"Rate limit exceeded: {limits['per_day']} requests per day"
    
    return True, None


def get_rate_limits_for_tier(tier: str) -> Dict:
    """Get rate limits for a partner tier"""
    return RATE_LIMITS.get(tier, RATE_LIMITS["starter"])


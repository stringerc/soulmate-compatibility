"""
Partner Management API (v1)
For partner onboarding, API key management, and account management
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Partner, APIKey
from api.auth import generate_api_key, hash_api_key

router = APIRouter(prefix="/api/v1/partners", tags=["partners"])


# Request/Response Models
class PartnerCreateRequest(BaseModel):
    """Request to create a new partner"""
    company_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    tier: str = Field(default="starter", pattern="^(starter|professional|enterprise|research)$")
    ip_whitelist: Optional[List[str]] = Field(None, description="Optional IP whitelist")


class PartnerResponse(BaseModel):
    """Partner information response"""
    id: str
    company_name: str
    email: str
    tier: str
    status: str
    created_at: str
    updated_at: str


class APIKeyCreateRequest(BaseModel):
    """Request to create a new API key"""
    name: str = Field(..., min_length=1, max_length=255, description="User-friendly name for the key")


class APIKeyResponse(BaseModel):
    """API key response (only shown once)"""
    api_key: str = Field(..., description="API key (store securely, shown only once)")
    name: str
    created_at: str
    warning: str = Field(default="Store this key securely. It will not be shown again.")


class APIKeyListResponse(BaseModel):
    """List of API keys (without actual keys)"""
    id: str
    name: str
    last_used_at: Optional[str]
    created_at: str
    revoked_at: Optional[str]


@router.post("/", response_model=PartnerResponse)
async def create_partner(
    request: PartnerCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new partner account.
    
    This endpoint is typically called during partner onboarding.
    """
    # Check if email already exists
    existing = db.query(Partner).filter(Partner.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create partner
    partner = Partner(
        id=uuid.uuid4(),
        company_name=request.company_name,
        email=request.email,
        tier=request.tier,
        status="trial",  # Start with trial status
        ip_whitelist=request.ip_whitelist,
    )
    
    db.add(partner)
    db.commit()
    db.refresh(partner)
    
    return PartnerResponse(
        id=str(partner.id),
        company_name=partner.company_name,
        email=partner.email,
        tier=partner.tier,
        status=partner.status,
        created_at=partner.created_at.isoformat(),
        updated_at=partner.updated_at.isoformat(),
    )


@router.get("/{partner_id}", response_model=PartnerResponse)
async def get_partner(
    partner_id: str,
    db: Session = Depends(get_db)
):
    """Get partner information"""
    partner = db.query(Partner).filter(Partner.id == uuid.UUID(partner_id)).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    return PartnerResponse(
        id=str(partner.id),
        company_name=partner.company_name,
        email=partner.email,
        tier=partner.tier,
        status=partner.status,
        created_at=partner.created_at.isoformat(),
        updated_at=partner.updated_at.isoformat(),
    )


@router.post("/{partner_id}/api-keys", response_model=APIKeyResponse)
async def create_api_key(
    partner_id: str,
    request: APIKeyCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new API key for a partner.
    
    The API key is shown only once. Store it securely.
    """
    partner = db.query(Partner).filter(Partner.id == uuid.UUID(partner_id)).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    if partner.status != "active":
        raise HTTPException(status_code=403, detail="Partner account is not active")
    
    # Generate API key
    api_key = generate_api_key(str(partner.id))
    key_hash = hash_api_key(api_key)
    
    # Store in database
    db_key = APIKey(
        id=uuid.uuid4(),
        partner_id=partner.id,
        key_hash=key_hash,
        name=request.name,
    )
    
    db.add(db_key)
    db.commit()
    
    return APIKeyResponse(
        api_key=api_key,
        name=request.name,
        created_at=db_key.created_at.isoformat(),
    )


@router.get("/{partner_id}/api-keys", response_model=List[APIKeyListResponse])
async def list_api_keys(
    partner_id: str,
    db: Session = Depends(get_db)
):
    """List all API keys for a partner (without showing actual keys)"""
    partner = db.query(Partner).filter(Partner.id == uuid.UUID(partner_id)).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    keys = db.query(APIKey).filter(APIKey.partner_id == partner.id).all()
    
    return [
        APIKeyListResponse(
            id=str(key.id),
            name=key.name,
            last_used_at=key.last_used_at.isoformat() if key.last_used_at else None,
            created_at=key.created_at.isoformat(),
            revoked_at=key.revoked_at.isoformat() if key.revoked_at else None,
        )
        for key in keys
    ]


@router.delete("/{partner_id}/api-keys/{key_id}")
async def revoke_api_key(
    partner_id: str,
    key_id: str,
    db: Session = Depends(get_db)
):
    """Revoke an API key"""
    partner = db.query(Partner).filter(Partner.id == uuid.UUID(partner_id)).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    api_key = db.query(APIKey).filter(
        APIKey.id == uuid.UUID(key_id),
        APIKey.partner_id == partner.id
    ).first()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    if api_key.revoked_at:
        raise HTTPException(status_code=400, detail="API key already revoked")
    
    api_key.revoked_at = datetime.utcnow()
    db.commit()
    
    return {"message": "API key revoked successfully"}


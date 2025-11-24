"""
Authentication API (v1)
Handles partner login and session management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

from database.connection import get_db
from database.models import Partner
from api.auth_jwt import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_partner,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from api.auth import generate_api_key, hash_api_key
from database.models import APIKey

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


class PartnerRegister(BaseModel):
    """Partner registration request"""
    company_name: str
    email: EmailStr
    password: str
    tier: str = "starter"


class TokenResponse(BaseModel):
    """Token response"""
    access_token: str
    token_type: str = "bearer"
    partner_id: str
    partner_name: str


class PartnerInfo(BaseModel):
    """Partner information response"""
    id: str
    company_name: str
    email: str
    tier: str
    status: str


@router.post("/register", response_model=PartnerInfo)
async def register_partner(
    registration: PartnerRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new partner account.
    
    Creates partner account and initial API key.
    """
    # Check if email already exists
    existing = db.query(Partner).filter(Partner.email == registration.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create partner
    partner = Partner(
        id=uuid.uuid4(),
        company_name=registration.company_name,
        email=registration.email,
        tier=registration.tier,
        status="trial",
    )
    
    # Note: In production, store password hash
    # For now, we'll use API key authentication only
    # If you want password auth, add password_hash field to Partner model
    
    db.add(partner)
    db.commit()
    db.refresh(partner)
    
    # Create initial API key
    api_key = generate_api_key(str(partner.id))
    key_hash = hash_api_key(api_key)
    
    db_key = APIKey(
        id=uuid.uuid4(),
        partner_id=partner.id,
        key_hash=key_hash,
        name="Initial Key",
    )
    db.add(db_key)
    db.commit()
    
    return PartnerInfo(
        id=str(partner.id),
        company_name=partner.company_name,
        email=partner.email,
        tier=partner.tier,
        status=partner.status,
    )


@router.post("/login", response_model=TokenResponse)
async def login_partner(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login partner and get access token.
    
    For now, uses email as username and API key as password.
    In production, implement proper password authentication.
    """
    # Find partner by email
    partner = db.query(Partner).filter(Partner.email == form_data.username).first()
    
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # For API key-based login, verify API key
    # In production, verify password hash
    api_key = form_data.password
    from api.auth import verify_api_key_hash, hash_api_key
    
    # Check if API key matches
    key_hash = hash_api_key(api_key)
    db_key = db.query(APIKey).filter(
        APIKey.key_hash == key_hash,
        APIKey.partner_id == partner.id,
        APIKey.revoked_at.is_(None)
    ).first()
    
    if not db_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if partner.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner account is not active"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(partner.id), "email": partner.email},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        partner_id=str(partner.id),
        partner_name=partner.company_name,
    )


@router.get("/me", response_model=PartnerInfo)
async def get_current_partner_info(
    partner: Partner = Depends(get_current_partner)
):
    """Get current authenticated partner information"""
    return PartnerInfo(
        id=str(partner.id),
        company_name=partner.company_name,
        email=partner.email,
        tier=partner.tier,
        status=partner.status,
    )


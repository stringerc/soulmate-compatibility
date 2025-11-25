"""
Authentication routes for Soulmates (magic link)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import os
from datetime import datetime, timedelta
from jose import jwt

from database.connection import get_db
from database.soulmates_models import User
from .auth import JWT_SECRET, ALGORITHM

router = APIRouter(prefix="/auth", tags=["soulmates-auth"])


class MagicLinkRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class MagicLinkResponse(BaseModel):
    success: bool
    message: str
    dev_link: Optional[str] = None  # For development only


@router.post("/magic-link", response_model=MagicLinkResponse)
async def request_magic_link(
    request: MagicLinkRequest,
    db: Session = Depends(get_db)
):
    """
    Request a magic link for authentication.
    
    In production, this would send an email. For development,
    it returns a dev_link that can be used directly.
    """
    email = request.email.lower().strip()
    
    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            id=uuid.uuid4(),
            email=email,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create JWT token (expires in 15 minutes)
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(minutes=15),
    }
    token = jwt.encode(token_data, JWT_SECRET, algorithm=ALGORITHM)
    
    # In production, send email with magic link
    # For now, return dev_link in development
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    magic_link = f"{frontend_url}/auth/callback?token={token}"
    
    # TODO: Send email in production
    # For development, return the link directly
    is_dev = os.getenv("ENVIRONMENT", "development") == "development"
    
    return MagicLinkResponse(
        success=True,
        message="Magic link sent to your email" if not is_dev else "Development mode: use the link below",
        dev_link=magic_link if is_dev else None,
    )


@router.get("/verify")
async def verify_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify a magic link token and return user info.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "user": {
                "id": str(user.id),
                "email": user.email,
            },
            "token": token,  # Return token for client to store
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


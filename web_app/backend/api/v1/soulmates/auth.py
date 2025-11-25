"""
Authentication utilities for Soulmates API
JWT-based user authentication
"""

from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
import os
from jose import JWTError, jwt

from database.connection import get_db
from database.soulmates_models import User

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production"))
ALGORITHM = "HS256"

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def decode_jwt_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user_id(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> str:
    """
    Get current user ID from JWT token.
    
    Supports both Authorization header and OAuth2 scheme.
    
    Returns:
        user_id (str): UUID string of authenticated user
        
    Raises:
        HTTPException: 401 if token is invalid or missing
    """
    # Try Authorization header first
    token_str = None
    if authorization and authorization.startswith("Bearer "):
        token_str = authorization[7:]
    elif token:
        token_str = token
    
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Decode token
    payload = decode_jwt_token(token_str)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user ID (can be from 'sub', 'user_id', or 'email')
    user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
    email = payload.get("email")
    
    if not user_id and not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identifier",
        )
    
    # If we have email but no user_id, try to find user by email
    if not user_id and email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            return str(user.id)
        else:
            # Create user if doesn't exist (for magic link flow)
            user = User(email=email)
            db.add(user)
            db.commit()
            db.refresh(user)
            return str(user.id)
    
    # Verify user exists
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        return str(user.id)
    except Exception:
        # If user_id is not a valid UUID, treat as email
        if email:
            user = db.query(User).filter(User.email == email).first()
            if user:
                return str(user.id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identifier",
        )


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated User object.
    
    Usage:
        @router.get("/protected")
        async def protected_route(user: User = Depends(get_current_user)):
            ...
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


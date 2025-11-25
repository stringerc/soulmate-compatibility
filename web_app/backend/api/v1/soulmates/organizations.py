"""
B2B Organizations API Routes
Handles organization creation, memberships, and org plans
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from database.connection import get_db
from database.soulmates_models import (
    Organization, OrganizationMembership, OrganizationPlan,
    User, OrgRole
)

router = APIRouter()


@router.post("/orgs")
async def create_organization(
    user_id: str,  # TODO: Get from JWT/auth
    name: str,
    slug: str,
    db: Session = Depends(get_db)
):
    """Create a new organization (owner only)"""
    user_uuid = uuid.UUID(user_id)
    
    # Validate user exists
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if slug is taken
    existing = db.query(Organization).filter(Organization.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already taken")
    
    # Create organization
    org = Organization(name=name, slug=slug)
    db.add(org)
    db.flush()
    
    # Add creator as owner
    membership = OrganizationMembership(
        organization_id=org.id,
        user_id=user_uuid,
        role=OrgRole.OWNER,
    )
    db.add(membership)
    db.commit()
    db.refresh(org)
    
    return {"success": True, "organization": org}


@router.post("/orgs/{org_id}/invite")
async def invite_member(
    org_id: str,
    user_id: str,  # TODO: Get from JWT/auth (must be admin/owner)
    invitee_email: str,
    role: str = "MEMBER",
    db: Session = Depends(get_db)
):
    """Invite a member to an organization"""
    # TODO: Verify user is admin/owner of org
    # TODO: Generate invite token and send email
    
    return {
        "success": True,
        "message": "TODO: Implement invite token generation and email sending",
        "invite_token": "placeholder-token",
    }


@router.post("/orgs/{org_id}/plans")
async def create_org_plan(
    org_id: str,
    user_id: str,  # TODO: Get from JWT/auth (must be admin/owner)
    plan_id: str,
    seat_count: int,
    db: Session = Depends(get_db)
):
    """Create organization subscription to a plan"""
    org_uuid = uuid.UUID(org_id)
    plan_uuid = uuid.UUID(plan_id)
    
    # Verify org exists
    org = db.query(Organization).filter(Organization.id == org_uuid).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Create org plan
    org_plan = OrganizationPlan(
        organization_id=org_uuid,
        plan_id=plan_uuid,
        seat_count=seat_count,
    )
    
    db.add(org_plan)
    db.commit()
    db.refresh(org_plan)
    
    return {"success": True, "org_plan": org_plan}


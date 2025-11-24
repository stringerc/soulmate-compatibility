"""
Usage Analytics API (v1)
Provides usage statistics for partners
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from database.connection import get_db
from database.models import APIUsage, Partner
from api.auth import verify_api_key_dependency
from api.analytics import get_usage_stats
from api.auth import verify_api_key_dependency

router = APIRouter(prefix="/api/v1/partners", tags=["analytics"])


class UsageStatsResponse(BaseModel):
    """Usage statistics response"""
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_response_time: float
    endpoints: Dict[str, int]
    status_codes: Dict[int, int]
    start_date: Optional[str] = None
    end_date: Optional[str] = None


@router.get("/{partner_id}/usage", response_model=UsageStatsResponse)
async def get_partner_usage_stats(
    partner_id: str,
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    partner: Dict = Depends(verify_api_key_dependency),
    db: Session = Depends(get_db)
):
    """
    Get usage statistics for a partner.
    
    Requires API key authentication.
    Partners can only view their own usage stats.
    """
    # Verify partner owns this account
    if partner["id"] != partner_id:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own usage statistics"
        )
    
    # Parse dates
    start_dt = None
    end_dt = None
    
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")
    
    # Get usage stats
    stats = get_usage_stats(partner_id, start_dt, end_dt, db)
    
    return UsageStatsResponse(
        total_requests=stats["total_requests"],
        successful_requests=stats["successful_requests"],
        failed_requests=stats["failed_requests"],
        average_response_time=stats["average_response_time"],
        endpoints=stats["endpoints"],
        status_codes=stats["status_codes"],
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/{partner_id}/usage/summary")
async def get_usage_summary(
    partner_id: str,
    partner: Dict = Depends(verify_api_key_dependency),
    db: Session = Depends(get_db)
):
    """
    Get quick usage summary (last 24 hours, 7 days, 30 days)
    """
    if partner["id"] != partner_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    now = datetime.utcnow()
    
    # Last 24 hours
    stats_24h = get_usage_stats(
        partner_id,
        start_date=now - timedelta(hours=24),
        end_date=now,
        db=db
    )
    
    # Last 7 days
    stats_7d = get_usage_stats(
        partner_id,
        start_date=now - timedelta(days=7),
        end_date=now,
        db=db
    )
    
    # Last 30 days
    stats_30d = get_usage_stats(
        partner_id,
        start_date=now - timedelta(days=30),
        end_date=now,
        db=db
    )
    
    return {
        "last_24_hours": {
            "total_requests": stats_24h["total_requests"],
            "success_rate": (
                (stats_24h["successful_requests"] / stats_24h["total_requests"] * 100)
                if stats_24h["total_requests"] > 0 else 0
            ),
        },
        "last_7_days": {
            "total_requests": stats_7d["total_requests"],
            "success_rate": (
                (stats_7d["successful_requests"] / stats_7d["total_requests"] * 100)
                if stats_7d["total_requests"] > 0 else 0
            ),
        },
        "last_30_days": {
            "total_requests": stats_30d["total_requests"],
            "success_rate": (
                (stats_30d["successful_requests"] / stats_30d["total_requests"] * 100)
                if stats_30d["total_requests"] > 0 else 0
            ),
        },
    }


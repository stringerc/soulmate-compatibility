"""
API Usage Analytics and Tracking
"""

from datetime import datetime
from typing import Optional, Dict
from sqlalchemy.orm import Session
from database.models import APIUsage, Partner
import uuid


async def track_api_usage(
    partner_id: str,
    endpoint: str,
    method: str,
    status_code: int,
    response_time: Optional[int] = None,
    db: Session = None,
    metadata: Optional[Dict] = None,
    api_key_id: Optional[str] = None,
    request_size: Optional[int] = None,
    response_size: Optional[int] = None,
):
    """
    Track API usage for analytics
    
    Args:
        partner_id: Partner UUID
        endpoint: API endpoint called
        method: HTTP method
        status_code: HTTP status code
        response_time: Response time in milliseconds
        db: Database session
        metadata: Additional metadata (JSON)
        api_key_id: API key UUID (optional)
        request_size: Request size in bytes (optional)
        response_size: Response size in bytes (optional)
    """
    if not db:
        return
    
    try:
        usage = APIUsage(
            id=uuid.uuid4(),
            partner_id=uuid.UUID(partner_id),
            api_key_id=uuid.UUID(api_key_id) if api_key_id else None,
            endpoint=endpoint,
            method=method,
            response_time=response_time,
            status_code=status_code,
            request_size=request_size,
            response_size=response_size,
            timestamp=datetime.utcnow(),
            metadata=metadata or {},
        )
        
        db.add(usage)
        db.commit()
    except Exception as e:
        # Log error but don't fail the request
        print(f"Error tracking API usage: {e}")
        db.rollback()


def get_usage_stats(
    partner_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = None,
) -> Dict:
    """
    Get usage statistics for a partner
    
    Returns:
        {
            "total_requests": int,
            "successful_requests": int,
            "failed_requests": int,
            "average_response_time": float,
            "endpoints": {endpoint: count},
            "status_codes": {code: count},
        }
    """
    if not db:
        return {}
    
    query = db.query(APIUsage).filter(APIUsage.partner_id == uuid.UUID(partner_id))
    
    if start_date:
        query = query.filter(APIUsage.timestamp >= start_date)
    if end_date:
        query = query.filter(APIUsage.timestamp <= end_date)
    
    usage_records = query.all()
    
    if not usage_records:
        return {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "average_response_time": 0.0,
            "endpoints": {},
            "status_codes": {},
        }
    
    total = len(usage_records)
    successful = sum(1 for u in usage_records if 200 <= u.status_code < 300)
    failed = total - successful
    
    response_times = [u.response_time for u in usage_records if u.response_time]
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0.0
    
    endpoints = {}
    for u in usage_records:
        endpoints[u.endpoint] = endpoints.get(u.endpoint, 0) + 1
    
    status_codes = {}
    for u in usage_records:
        status_codes[u.status_code] = status_codes.get(u.status_code, 0) + 1
    
    return {
        "total_requests": total,
        "successful_requests": successful,
        "failed_requests": failed,
        "average_response_time": avg_response_time,
        "endpoints": endpoints,
        "status_codes": status_codes,
    }


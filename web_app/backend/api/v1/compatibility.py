"""
B2B Compatibility Calculation API (v1)
Research-backed API design with authentication and rate limiting
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
import uuid
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import APIUsage, Partner
from api.auth import verify_api_key_dependency, check_rate_limit
from api.analytics import track_api_usage
import uuid

# Import compatibility calculation logic
# Note: In production, these should be imported from a shared package
# For now, we'll use the compatibility functions from main.py
# Import from parent directory
import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent.parent.parent
sys.path.insert(0, str(project_root))

try:
    from base_model import PersonVector32, ResonanceVector7, CompatibilityModel
except ImportError:
    # Fallback: use simplified compatibility functions
    from typing import List
    import math
    
    class PersonVector32:
        def __init__(self, traits: List[float]):
            if len(traits) != 32:
                raise ValueError("Must have 32 traits")
            self.traits = traits
    
    class ResonanceVector7:
        def __init__(self, metrics: List[float]):
            if len(metrics) != 7:
                raise ValueError("Must have 7 metrics")
            self.metrics = metrics
        
        @property
        def mean(self):
            return sum(self.metrics) / len(self.metrics)
        
        @property
        def stability(self):
            m = self.mean == 0:
                return 1.0
            variance = sum((x - self.mean) ** 2 for x in self.metrics) / len(self.metrics)
            return max(0.0, min(1.0, 1.0 - variance))
    
    class CompatibilityModel:
        def trait_distance(self, p1, p2):
            return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1.traits, p2.traits)))
        
        def trait_compatibility(self, p1, p2):
            return math.exp(-self.trait_distance(p1, p2))
        
        def resonance_compatibility(self, r):
            return 0.5 * r.mean + 0.5 * r.stability
        
        def total_compatibility(self, p1, p2, r, feasibility=1.0):
            c_traits = self.trait_compatibility(p1, p2)
            c_res = self.resonance_compatibility(r)
            c_total = 0.6 * c_traits + 0.4 * c_res
            s_hat = feasibility * c_total
            return {
                "C_traits": c_traits,
                "C_res": c_res,
                "C_total": c_total,
                "S_hat": s_hat,
            }

router = APIRouter(prefix="/api/v1/compatibility", tags=["compatibility"])


# Request/Response Models
class CompatibilityRequest(BaseModel):
    """Request model for compatibility calculation"""
    person1: Dict = Field(..., description="Person 1 data")
    person2: Dict = Field(..., description="Person 2 data")
    resonance: Optional[List[float]] = Field(None, description="7D resonance vector (optional)")
    include_numerology: bool = Field(False, description="Include numerology score")
    include_astrology: bool = Field(False, description="Include astrology score")
    birthdate1: Optional[str] = Field(None, description="Person 1 birthdate (YYYY-MM-DD)")
    birthdate2: Optional[str] = Field(None, description="Person 2 birthdate (YYYY-MM-DD)")


class CompatibilityResponse(BaseModel):
    """Response model for compatibility calculation"""
    compatibility_score: float = Field(..., ge=0, le=1, description="Overall compatibility score (S_hat)")
    trait_compatibility: float = Field(..., description="Trait compatibility (C_traits)")
    resonance_compatibility: float = Field(..., description="Resonance compatibility (C_res)")
    total_compatibility: float = Field(..., description="Total compatibility (C_total)")
    dimension_breakdown: Dict = Field(..., description="Dimension-specific alignments")
    numerology_score: Optional[float] = Field(None, description="Numerology compatibility score")
    astrology_score: Optional[float] = Field(None, description="Astrology compatibility score")
    timestamp: str = Field(..., description="ISO timestamp of calculation")
    request_id: str = Field(..., description="Unique request ID")


class BatchCompatibilityRequest(BaseModel):
    """Request model for batch compatibility calculation"""
    pairs: List[CompatibilityRequest] = Field(..., max_items=100, description="List of pairs (max 100)")


class BatchCompatibilityResponse(BaseModel):
    """Response model for batch compatibility calculation"""
    results: List[CompatibilityResponse] = Field(..., description="Compatibility results")
    count: int = Field(..., description="Number of pairs processed")
    timestamp: str = Field(..., description="ISO timestamp")


# Helper functions
def calculate_dimension_alignment(p1: PersonVector32, p2: PersonVector32) -> Dict:
    """Calculate dimension-specific alignments"""
    v1 = p1.traits
    v2 = p2.traits
    
    # Attachment & Regulation (indices 0-4)
    attachment_diff = sum(abs(v1[i] - v2[i]) for i in range(5)) / 5
    attachment_alignment = 1.0 - attachment_diff
    
    # Conflict & Communication (indices 5-9)
    conflict_diff = sum(abs(v1[i] - v2[i]) for i in range(5, 10)) / 5
    conflict_alignment = 1.0 - conflict_diff
    
    # Cognitive Style (indices 10-14)
    cognitive_diff = sum(abs(v1[i] - v2[i]) for i in range(10, 15)) / 5
    cognitive_alignment = 1.0 - cognitive_diff
    
    # Values (indices 15-20)
    value_diff = sum(abs(v1[i] - v2[i]) for i in range(15, 21)) / 6
    value_alignment = 1.0 - value_diff
    
    # Social Style (indices 21-25)
    social_diff = sum(abs(v1[i] - v2[i]) for i in range(21, 26)) / 5
    social_alignment = 1.0 - social_diff
    
    # Sexual System (indices 26-28)
    sexual_diff = sum(abs(v1[i] - v2[i]) for i in range(26, 29)) / 3
    sexual_alignment = 1.0 - sexual_diff
    
    # Life Structure (indices 29-31)
    life_diff = sum(abs(v1[i] - v2[i]) for i in range(29, 32)) / 3
    life_alignment = 1.0 - life_diff
    
    return {
        "attachment": max(0, min(1, attachment_alignment)),
        "conflict": max(0, min(1, conflict_alignment)),
        "cognitive": max(0, min(1, cognitive_alignment)),
        "values": max(0, min(1, value_alignment)),
        "social": max(0, min(1, social_alignment)),
        "sexual": max(0, min(1, sexual_alignment)),
        "life_structure": max(0, min(1, life_alignment)),
    }


def compute_numerology_score(birthdate1: str, birthdate2: str) -> float:
    """Calculate numerology compatibility"""
    def life_path(bd: str) -> int:
        digits = bd.replace("-", "").replace("/", "")
        total = sum(int(d) for d in digits if d.isdigit())
        while total > 9:
            total = sum(int(d) for d in str(total))
        return total
    
    try:
        lp1 = life_path(birthdate1)
        lp2 = life_path(birthdate2)
        
        if lp1 == lp2:
            return 1.0
        elif abs(lp1 - lp2) <= 2:
            return 0.7
        else:
            return 0.3
    except:
        return 0.5


def compute_astrology_score(birthdate1: str, birthdate2: str) -> float:
    """Calculate astrology compatibility"""
    def zodiac(bd: str) -> str:
        try:
            parts = bd.split("-") if "-" in bd else bd.split("/")
            month, day = int(parts[1]), int(parts[2])
            
            signs = [
                ("Aquarius", (1, 20), (2, 18)),
                ("Pisces", (2, 19), (3, 20)),
                ("Aries", (3, 21), (4, 19)),
                ("Taurus", (4, 20), (5, 20)),
                ("Gemini", (5, 21), (6, 20)),
                ("Cancer", (6, 21), (7, 22)),
                ("Leo", (7, 23), (8, 22)),
                ("Virgo", (8, 23), (9, 22)),
                ("Libra", (9, 23), (10, 22)),
                ("Scorpio", (10, 23), (11, 21)),
                ("Sagittarius", (11, 22), (12, 21)),
                ("Capricorn", (12, 22), (1, 19)),
            ]
            
            for name, (m1, d1), (m2, d2) in signs:
                if (month == m1 and day >= d1) or (month == m2 and day <= d2) or (m1 > m2 and month in [m1, m2]):
                    return name
            return "Capricorn"
        except:
            return "Capricorn"
    
    def element(sign: str) -> str:
        if sign in ["Aries", "Leo", "Sagittarius"]:
            return "Fire"
        elif sign in ["Taurus", "Virgo", "Capricorn"]:
            return "Earth"
        elif sign in ["Gemini", "Libra", "Aquarius"]:
            return "Air"
        else:
            return "Water"
    
    try:
        sign1 = zodiac(birthdate1)
        sign2 = zodiac(birthdate2)
        elem1 = element(sign1)
        elem2 = element(sign2)
        
        if elem1 == elem2:
            return 1.0
        elif (elem1, elem2) in [("Fire", "Air"), ("Air", "Fire"), ("Earth", "Water"), ("Water", "Earth")]:
            return 0.7
        else:
            return 0.4
    except:
        return 0.5


def calculate_compatibility_internal(request: CompatibilityRequest) -> Dict:
    """Internal compatibility calculation"""
    # Extract traits
    traits1 = request.person1.get("traits", [])
    traits2 = request.person2.get("traits", [])
    
    if len(traits1) != 32:
        raise HTTPException(status_code=400, detail="Person1 must have 32 traits")
    if len(traits2) != 32:
        raise HTTPException(status_code=400, detail="Person2 must have 32 traits")
    
    # Create person vectors
    p1 = PersonVector32(traits=traits1)
    p2 = PersonVector32(traits=traits2)
    
    # Create resonance vector
    if request.resonance and len(request.resonance) == 7:
        r = ResonanceVector7(metrics=request.resonance)
    else:
        r = ResonanceVector7(metrics=[0.5] * 7)
    
    # Calculate compatibility
    model = CompatibilityModel()
    result = model.total_compatibility(p1, p2, r, feasibility=1.0)
    
    # Calculate dimension breakdown
    dimension_breakdown = calculate_dimension_alignment(p1, p2)
    
    # Calculate numerology/astrology if requested
    numerology_score = None
    astrology_score = None
    
    if request.include_numerology and request.birthdate1 and request.birthdate2:
        numerology_score = compute_numerology_score(request.birthdate1, request.birthdate2)
    
    if request.include_astrology and request.birthdate1 and request.birthdate2:
        astrology_score = compute_astrology_score(request.birthdate1, request.birthdate2)
    
    return {
        "compatibility_score": result["S_hat"],
        "trait_compatibility": result["C_traits"],
        "resonance_compatibility": result["C_res"],
        "total_compatibility": result["C_total"],
        "dimension_breakdown": dimension_breakdown,
        "numerology_score": numerology_score,
        "astrology_score": astrology_score,
    }


@router.post("/calculate", response_model=CompatibilityResponse)
async def calculate_compatibility(
    request: CompatibilityRequest,
    partner: Dict = Depends(verify_api_key_dependency),
    db: Session = Depends(get_db)
):
    """
    Calculate compatibility between two people.
    
    Requires API key authentication.
    Rate limited per partner tier.
    """
    start_time = datetime.utcnow()
    request_id = str(uuid.uuid4())
    
    try:
        # Check rate limits
        is_allowed, error_msg = check_rate_limit(partner["id"], "/api/v1/compatibility/calculate", db)
        if not is_allowed:
            raise HTTPException(status_code=429, detail=error_msg)
        
        # Calculate compatibility
        result = calculate_compatibility_internal(request)
        
        # Track usage
        response_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await track_api_usage(
            partner_id=partner["id"],
            endpoint="/api/v1/compatibility/calculate",
            method="POST",
            status_code=200,
            response_time=response_time,
            db=db
        )
        
        return CompatibilityResponse(
            compatibility_score=result["compatibility_score"],
            trait_compatibility=result["trait_compatibility"],
            resonance_compatibility=result["resonance_compatibility"],
            total_compatibility=result["total_compatibility"],
            dimension_breakdown=result["dimension_breakdown"],
            numerology_score=result["numerology_score"],
            astrology_score=result["astrology_score"],
            timestamp=datetime.utcnow().isoformat(),
            request_id=request_id,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        # Track error
        response_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await track_api_usage(
            partner_id=partner["id"],
            endpoint="/api/v1/compatibility/calculate",
            method="POST",
            status_code=500,
            response_time=response_time,
            db=db
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=BatchCompatibilityResponse)
async def batch_calculate(
    request: BatchCompatibilityRequest,
    partner: Dict = Depends(verify_api_key_dependency),
    db: Session = Depends(get_db)
):
    """
    Calculate compatibility for multiple pairs.
    
    Limited to 100 pairs per request.
    Higher rate limits for enterprise partners.
    """
    start_time = datetime.utcnow()
    
    # Check batch limits
    from api.auth import get_rate_limits_for_tier
    limits = get_rate_limits_for_tier(partner["tier"])
    
    if len(request.pairs) > limits["batch_limit"]:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {limits['batch_limit']} pairs per batch for {partner['tier']} tier"
        )
    
    # Check rate limits
    is_allowed, error_msg = check_rate_limit(partner["id"], "/api/v1/compatibility/batch", db)
    if not is_allowed:
        raise HTTPException(status_code=429, detail=error_msg)
    
    # Calculate compatibility for all pairs
    results = []
    for pair_request in request.pairs:
        try:
            result = calculate_compatibility_internal(pair_request)
            results.append(CompatibilityResponse(
                compatibility_score=result["compatibility_score"],
                trait_compatibility=result["trait_compatibility"],
                resonance_compatibility=result["resonance_compatibility"],
                total_compatibility=result["total_compatibility"],
                dimension_breakdown=result["dimension_breakdown"],
                numerology_score=result["numerology_score"],
                astrology_score=result["astrology_score"],
                timestamp=datetime.utcnow().isoformat(),
                request_id=str(uuid.uuid4()),
            ))
        except Exception as e:
            # Skip invalid pairs, continue with others
            continue
    
    # Track usage
    response_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
    await track_api_usage(
        partner_id=partner["id"],
        endpoint="/api/v1/compatibility/batch",
        method="POST",
        status_code=200,
        response_time=response_time,
        db=db,
        metadata={"batch_size": len(request.pairs), "results_count": len(results)}
    )
    
    return BatchCompatibilityResponse(
        results=results,
        count=len(results),
        timestamp=datetime.utcnow().isoformat(),
    )


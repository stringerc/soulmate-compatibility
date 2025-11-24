"""
FastAPI Web API for Soulmate Compatibility Framework

Provides REST endpoints for:
- Calculating compatibility between pairs
- Generating trait vectors from questionnaires
- Retrieving compatibility breakdowns
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import numpy as np

from base_model import (
    PersonVector32, ResonanceVector7, OutcomeVectorY,
    CompatibilityModel
)
from data_schema import Person, Pair, Dataset
from analysis import FeatureExtractor, ModelComparator, DecisionThresholds

app = FastAPI(
    title="Soulmate Compatibility API",
    description="API for calculating romantic compatibility using 32D trait vectors",
    version="1.0.0"
)

# CORS middleware - configure origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class PersonInput(BaseModel):
    """Input for a single person"""
    traits: List[float] = Field(..., description="32D trait vector", min_length=32, max_length=32)
    birthdate: Optional[str] = Field(None, description="Birthdate in YYYY-MM-DD format")
    name: Optional[str] = None


class PairInput(BaseModel):
    """Input for compatibility calculation"""
    person1: PersonInput
    person2: PersonInput
    resonance: Optional[List[float]] = Field(None, description="7D resonance vector", min_length=7, max_length=7)
    include_numerology: bool = True
    include_astrology: bool = True


class CompatibilityBreakdown(BaseModel):
    """Detailed compatibility breakdown"""
    trait_compatibility: float = Field(..., description="C_traits score")
    resonance_compatibility: float = Field(..., description="C_res score")
    total_compatibility: float = Field(..., description="C_total score")
    predicted_soulmate_score: float = Field(..., description="Ŝ predicted score")
    feasibility: float = Field(..., description="Feasibility constraint F")
    
    # Dimension breakdowns (optional)
    attachment_alignment: Optional[float] = None
    conflict_alignment: Optional[float] = None
    value_alignment: Optional[float] = None
    
    # Theory-derived features
    numerology_score: Optional[float] = None
    astrology_score: Optional[float] = None


class CompatibilityResult(BaseModel):
    """Full compatibility result"""
    success: bool
    breakdown: CompatibilityBreakdown
    soulmate_tier: bool = Field(..., description="Whether pair is in top 10%")
    percentile: float = Field(..., description="Compatibility percentile (0-100)")
    recommendations: List[str] = Field(default_factory=list)


# Helper Functions
def calculate_dimension_alignment(p1: PersonVector32, p2: PersonVector32) -> Dict[str, float]:
    """Calculate alignment for each dimension category"""
    v1 = np.array(p1.traits)
    v2 = np.array(p2.traits)
    
    # Attachment & Regulation (indices 0-4)
    attachment_diff = np.mean(np.abs(v1[0:5] - v2[0:5]))
    attachment_alignment = 1.0 - attachment_diff
    
    # Conflict & Communication (indices 5-9)
    conflict_diff = np.mean(np.abs(v1[5:10] - v2[5:10]))
    conflict_alignment = 1.0 - conflict_diff
    
    # Value Architecture (indices 15-20)
    value_diff = np.mean(np.abs(v1[15:21] - v2[15:21]))
    value_alignment = 1.0 - value_diff
    
    return {
        "attachment_alignment": max(0.0, min(1.0, attachment_alignment)),
        "conflict_alignment": max(0.0, min(1.0, conflict_alignment)),
        "value_alignment": max(0.0, min(1.0, value_alignment)),
    }


def compute_numerology_score(birthdate1: str, birthdate2: str) -> Optional[float]:
    """Compute numerology compatibility score"""
    if not birthdate1 or not birthdate2:
        return None
    
    def life_path_number(birthdate: str) -> int:
        digits = "".join(birthdate.split("-"))
        total = sum(int(d) for d in digits)
        while total > 9:
            total = sum(int(d) for d in str(total))
        return total
    
    lp1 = life_path_number(birthdate1)
    lp2 = life_path_number(birthdate2)
    
    if lp1 == lp2:
        return 1.0
    elif abs(lp1 - lp2) <= 2:
        return 0.7
    else:
        return 0.3


def compute_astrology_score(birthdate1: str, birthdate2: str) -> Optional[float]:
    """Compute astrology compatibility score"""
    if not birthdate1 or not birthdate2:
        return None
    
    def zodiac_sign(birthdate: str) -> str:
        month, day = map(int, birthdate.split("-")[1:])
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
        for sign, (m1, d1), (m2, d2) in signs:
            if (month == m1 and day >= d1) or (month == m2 and day <= d2):
                return sign
        return "Capricorn"
    
    def element(sign: str) -> str:
        fire = ["Aries", "Leo", "Sagittarius"]
        earth = ["Taurus", "Virgo", "Capricorn"]
        air = ["Gemini", "Libra", "Aquarius"]
        water = ["Cancer", "Scorpio", "Pisces"]
        
        if sign in fire:
            return "Fire"
        elif sign in earth:
            return "Earth"
        elif sign in air:
            return "Air"
        else:
            return "Water"
    
    sign1 = zodiac_sign(birthdate1)
    sign2 = zodiac_sign(birthdate2)
    elem1 = element(sign1)
    elem2 = element(sign2)
    
    if elem1 == elem2:
        return 1.0
    elif (elem1, elem2) in [("Fire", "Air"), ("Air", "Fire"), ("Earth", "Water"), ("Water", "Earth")]:
        return 0.7
    else:
        return 0.4


# API Endpoints
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Soulmate Compatibility API",
        "version": "1.0.0",
        "endpoints": {
            "/api/compatibility": "POST - Calculate compatibility",
            "/api/health": "GET - Health check",
            "/docs": "API documentation"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "soulmate-compatibility-api"}


@app.post("/api/compatibility", response_model=CompatibilityResult)
async def calculate_compatibility(pair: PairInput):
    """
    Calculate compatibility between two people.
    
    Returns detailed breakdown including:
    - Trait compatibility (C_traits)
    - Resonance compatibility (C_res)
    - Total compatibility (C_total)
    - Predicted soulmate score (Ŝ)
    - Dimension-specific alignments
    - Numerology/astrology scores (if birthdates provided)
    """
    try:
        # Validate trait vectors
        if len(pair.person1.traits) != 32:
            raise HTTPException(status_code=400, detail="Person1 must have exactly 32 traits")
        if len(pair.person2.traits) != 32:
            raise HTTPException(status_code=400, detail="Person2 must have exactly 32 traits")
        
        # Create person vectors
        p1 = PersonVector32(traits=pair.person1.traits)
        p2 = PersonVector32(traits=pair.person2.traits)
        
        # Create resonance vector (use provided or defaults)
        if pair.resonance and len(pair.resonance) == 7:
            r = ResonanceVector7(metrics=pair.resonance)
        else:
            # Default resonance (neutral)
            r = ResonanceVector7(metrics=[0.5] * 7)
        
        # Calculate compatibility
        model = CompatibilityModel()
        result = model.total_compatibility(p1, p2, r, feasibility=1.0)
        
        # Calculate dimension alignments
        alignments = calculate_dimension_alignment(p1, p2)
        
        # Calculate numerology/astrology scores if birthdates provided
        numerology_score = None
        astrology_score = None
        
        if pair.include_numerology and pair.person1.birthdate and pair.person2.birthdate:
            numerology_score = compute_numerology_score(
                pair.person1.birthdate,
                pair.person2.birthdate
            )
        
        if pair.include_astrology and pair.person1.birthdate and pair.person2.birthdate:
            astrology_score = compute_astrology_score(
                pair.person1.birthdate,
                pair.person2.birthdate
            )
        
        # Create breakdown
        breakdown = CompatibilityBreakdown(
            trait_compatibility=result["C_traits"],
            resonance_compatibility=result["C_res"],
            total_compatibility=result["C_total"],
            predicted_soulmate_score=result["S_hat"],
            feasibility=result["feasibility"],
            attachment_alignment=alignments["attachment_alignment"],
            conflict_alignment=alignments["conflict_alignment"],
            value_alignment=alignments["value_alignment"],
            numerology_score=numerology_score,
            astrology_score=astrology_score,
        )
        
        # Determine soulmate tier (top 10% - this is a placeholder)
        # In production, you'd compare against a distribution
        soulmate_tier = result["S_hat"] >= 0.7  # Placeholder threshold
        
        # Calculate percentile (placeholder - would need distribution)
        percentile = min(100.0, max(0.0, result["S_hat"] * 100))
        
        # Generate recommendations
        recommendations = []
        if breakdown.attachment_alignment < 0.5:
            recommendations.append("Consider working on emotional security and communication")
        if breakdown.conflict_alignment < 0.5:
            recommendations.append("Focus on conflict resolution strategies")
        if breakdown.value_alignment < 0.5:
            recommendations.append("Discuss core values and life goals")
        if not recommendations:
            recommendations.append("Strong compatibility across key dimensions!")
        
        return CompatibilityResult(
            success=True,
            breakdown=breakdown,
            soulmate_tier=soulmate_tier,
            percentile=percentile,
            recommendations=recommendations,
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating compatibility: {str(e)}")


@app.post("/api/batch-compatibility")
async def batch_compatibility(pairs: List[PairInput]):
    """
    Calculate compatibility for multiple pairs at once.
    Useful for finding best matches in a group.
    """
    results = []
    for pair in pairs:
        try:
            result = await calculate_compatibility(pair)
            results.append(result.dict())
        except Exception as e:
            results.append({"success": False, "error": str(e)})
    
    return {"results": results, "count": len(results)}


@app.get("/api/questionnaire-template")
async def get_questionnaire_template():
    """
    Returns template for 32D trait questionnaire.
    Frontend can use this to build the input form.
    """
    return {
        "dimensions": [
            {
                "category": "Attachment & Regulation",
                "dimensions": [
                    {"index": 0, "name": "A1_attachment_security", "question": "I feel secure in close relationships"},
                    {"index": 1, "name": "A2_abandonment_sensitivity", "question": "I worry about being abandoned"},
                    {"index": 2, "name": "A3_emotional_regulation", "question": "I can regulate my emotions well"},
                    {"index": 3, "name": "A4_coregulation_skill", "question": "I help my partner regulate their emotions"},
                    {"index": 4, "name": "A5_distress_tolerance", "question": "I handle relationship stress well"},
                ]
            },
            {
                "category": "Conflict & Communication",
                "dimensions": [
                    {"index": 5, "name": "C1_conflict_style", "question": "I prefer to address conflicts directly"},
                    {"index": 6, "name": "C2_repair_efficiency", "question": "I can repair relationship ruptures quickly"},
                    {"index": 7, "name": "C3_blame_responsibility_index", "question": "I take responsibility in conflicts"},
                    {"index": 8, "name": "C4_listening_depth", "question": "I listen deeply to my partner"},
                    {"index": 9, "name": "C5_metacommunication_skill", "question": "I can discuss our communication patterns"},
                ]
            },
            # ... (add remaining categories)
        ],
        "scale": {
            "min": 0.0,
            "max": 1.0,
            "labels": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


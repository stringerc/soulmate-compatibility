"""
FastAPI Backend for Soulmate Compatibility API
Standalone version for Render deployment
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import math

app = FastAPI(
    title="Soulmate Compatibility API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PersonInput(BaseModel):
    traits: List[float] = Field(..., min_length=32, max_length=32)
    birthdate: Optional[str] = None
    name: Optional[str] = None

class PairInput(BaseModel):
    person1: PersonInput
    person2: PersonInput
    resonance: Optional[List[float]] = Field(None, min_length=7, max_length=7)

def trait_distance(p1: List[float], p2: List[float]) -> float:
    """Calculate Euclidean distance between trait vectors"""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))

def trait_compatibility(p1: List[float], p2: List[float]) -> float:
    """C_traits = exp(-D_traits)"""
    return math.exp(-trait_distance(p1, p2))

def resonance_compatibility(r: List[float]) -> float:
    """C_res = β₁ R_mean + β₂ R_stab"""
    mean = sum(r) / len(r)
    variance = sum((x - mean) ** 2 for x in r) / len(r)
    stability = max(0, min(1, 1 - variance))
    return 0.5 * mean + 0.5 * stability

def total_compatibility(p1: List[float], p2: List[float], r: List[float]) -> dict:
    """Calculate total compatibility"""
    c_traits = trait_compatibility(p1, p2)
    c_res = resonance_compatibility(r)
    c_total = 0.6 * c_traits + 0.4 * c_res
    s_hat = c_total  # Simplified
    
    return {
        "c_traits": c_traits,
        "c_res": c_res,
        "c_total": c_total,
        "s_hat": s_hat,
    }

def numerology_score(birthdate1: str, birthdate2: str) -> float:
    """Calculate numerology compatibility"""
    def life_path(bd: str) -> int:
        digits = bd.replace("-", "")
        total = sum(int(d) for d in digits)
        while total > 9:
            total = sum(int(d) for d in str(total))
        return total
    
    lp1 = life_path(birthdate1)
    lp2 = life_path(birthdate2)
    
    if lp1 == lp2:
        return 1.0
    elif abs(lp1 - lp2) <= 2:
        return 0.7
    else:
        return 0.3

def astrology_score(birthdate1: str, birthdate2: str) -> float:
    """Calculate astrology compatibility"""
    def zodiac(bd: str) -> str:
        _, month, day = map(int, bd.split("-"))
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
    
    def element(sign: str) -> str:
        if sign in ["Aries", "Leo", "Sagittarius"]:
            return "Fire"
        elif sign in ["Taurus", "Virgo", "Capricorn"]:
            return "Earth"
        elif sign in ["Gemini", "Libra", "Aquarius"]:
            return "Air"
        else:
            return "Water"
    
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

@app.get("/")
async def root():
    return {"message": "Soulmate Compatibility API", "status": "running"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/compatibility")
async def calculate_compatibility(pair: PairInput):
    """Calculate compatibility between two people"""
    try:
        r = pair.resonance if pair.resonance else [0.5] * 7
        
        result = total_compatibility(pair.person1.traits, pair.person2.traits, r)
        
        numerology = None
        astrology = None
        
        if pair.person1.birthdate and pair.person2.birthdate:
            numerology = numerology_score(pair.person1.birthdate, pair.person2.birthdate)
            astrology = astrology_score(pair.person1.birthdate, pair.person2.birthdate)
        
        return {
            "success": True,
            "breakdown": {
                "trait_compatibility": result["c_traits"],
                "resonance_compatibility": result["c_res"],
                "total_compatibility": result["c_total"],
                "predicted_soulmate_score": result["s_hat"],
                "feasibility": 1.0,
                "numerology_score": numerology,
                "astrology_score": astrology,
            },
            "soulmate_tier": result["s_hat"] >= 0.7,
            "percentile": min(100.0, max(0.0, result["s_hat"] * 100)),
            "recommendations": ["Strong compatibility across key dimensions!"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))

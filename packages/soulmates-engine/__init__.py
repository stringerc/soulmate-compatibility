"""
Soulmates Engine Package
Compatibility calculation engine extracted from base_model and analysis
"""

from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from datetime import datetime
import sys
import os

# Add parent directory to path to import base_model
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from base_model import (
    PersonVector32,
    ResonanceVector7,
    OutcomeVectorY,
    CompatibilityModel,
)
from analysis import FeatureExtractor, ModelComparator, DecisionThresholds


@dataclass
class CompatibilityOptions:
    """Options for compatibility calculation"""
    allow_astrology: bool = True
    allow_numerology: bool = True
    model_version: str = "1.0.0"


@dataclass
class CompatibilitySnapshot:
    """Compatibility snapshot result"""
    user_a_id: str
    user_b_id: Optional[str]  # None if hypothetical
    model_version: str
    score_overall: float
    score_axes: Dict[str, float]  # emotional, logistical, values, etc.
    astro_used: bool
    num_used: bool
    soulmate_flag: bool
    debug_metrics: Optional[Dict[str, float]]  # r2, delta_f1, etc.
    explanation_summary: str
    explanation_details: Optional[Dict[str, Any]]
    created_at: datetime


async def computeCompatibilitySnapshot(
    user_a_id: str,
    user_b_or_hypothetical: Dict[str, Any],  # {userId?: string, hypotheticalProfile?: any}
    options: Optional[CompatibilityOptions] = None,
) -> CompatibilitySnapshot:
    """
    Compute compatibility snapshot between two users or a user and hypothetical profile.
    
    Args:
        user_a_id: ID of first user
        user_b_or_hypothetical: Either {userId: string} or {hypotheticalProfile: {...}}
        options: Compatibility calculation options
    
    Returns:
        CompatibilitySnapshot with scores, flags, and explanations
    """
    if options is None:
        options = CompatibilityOptions()
    
    # TODO: Load actual SoulProfile from database
    # For now, using placeholder logic
    
    # Extract profiles
    # user_a_profile = await load_soul_profile(user_a_id)
    # if user_b_or_hypothetical.get("userId"):
    #     user_b_profile = await load_soul_profile(user_b_or_hypothetical["userId"])
    # else:
    #     user_b_profile = user_b_or_hypothetical.get("hypotheticalProfile")
    
    # Placeholder: create vectors from profiles
    # In production, this would extract from SoulProfile.values_vector, etc.
    user_a_vector = PersonVector32(traits=[0.5] * 32)  # Placeholder
    user_b_vector = PersonVector32(traits=[0.5] * 32)  # Placeholder
    resonance = ResonanceVector7(metrics=[0.5] * 7)  # Placeholder
    
    # Run compatibility model
    model = CompatibilityModel()
    outcome = model.predict_outcome(user_a_vector, user_b_vector, resonance)
    soulmate_score = model.compute_soulmate_score(outcome)
    
    # Feature extraction and theory detection
    extractor = FeatureExtractor()
    features = extractor.extract_features(
        user_a_vector,
        user_b_vector,
        user_a_profile=None,  # TODO: pass actual profiles
        user_b_profile=None,
    )
    
    # Theory detection (astrology/numerology)
    comparator = ModelComparator()
    thresholds = DecisionThresholds()
    
    astro_used = False
    num_used = False
    
    if options.allow_astrology and features.get("astro_features"):
        # Run ablation study for astrology
        # In production, this would use actual theory evaluation
        astro_used = True  # Placeholder
    
    if options.allow_numerology and features.get("num_features"):
        num_used = True  # Placeholder
    
    # Compute axis breakdown
    score_axes = {
        "emotional": 0.7,  # Placeholder
        "logistical": 0.6,  # Placeholder
        "values": 0.8,  # Placeholder
        "life_path": 0.65,  # Placeholder
    }
    
    # Soulmate flag (top 10% threshold)
    soulmate_flag = soulmate_score >= 0.7  # Placeholder threshold
    
    # Generate explanation
    explanation_summary = f"Compatibility score: {soulmate_score:.2f}. "
    if astro_used:
        explanation_summary += "Astrology insights included. "
    if num_used:
        explanation_summary += "Numerology insights included. "
    
    explanation_details = {
        "trait_compatibility": model.compute_trait_compatibility(user_a_vector, user_b_vector),
        "resonance_compatibility": model.compute_resonance_compatibility(resonance),
        "outcome_breakdown": {
            "longevity": outcome.y1_longevity,
            "satisfaction": outcome.y2_satisfaction,
            "growth": outcome.y3_growth,
            "conflict_toxicity": outcome.y4_conflict_toxicity,
            "repair_efficiency": outcome.y5_repair_efficiency,
            "trajectory_alignment": outcome.y6_trajectory_alignment,
        },
    }
    
    return CompatibilitySnapshot(
        user_a_id=user_a_id,
        user_b_id=user_b_or_hypothetical.get("userId"),
        model_version=options.model_version,
        score_overall=soulmate_score,
        score_axes=score_axes,
        astro_used=astro_used,
        num_used=num_used,
        soulmate_flag=soulmate_flag,
        debug_metrics={"r2": 0.0, "delta_f1": 0.0},  # Placeholder
        explanation_summary=explanation_summary,
        explanation_details=explanation_details,
        created_at=datetime.utcnow(),
    )


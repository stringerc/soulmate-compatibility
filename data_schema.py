"""
Data Schema for Soulmate Compatibility Framework

Defines the structure for storing:
  - Persons (with 32D V vectors and optional astrology/numerology features)
  - Pairs (with R, Y, and computed S scores)
  - Theory-derived features for empirical testing
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from base_model import PersonVector32, ResonanceVector7, OutcomeVectorY


@dataclass
class Person:
    """
    Represents a single person in the dataset.
    
    Core fields:
      - id: unique identifier
      - V: 32D trait vector
      - metadata: birthdate, name, etc. (for deriving astrology/numerology)
    
    Optional theory-derived features (Experimental):
      - life_path_number: 1-9 from numerology
      - zodiac_sign: categorical zodiac sign
      - life_path_biases: derived trait biases from numerology
      - zodiac_biases: derived trait biases from astrology
    """
    id: str
    V: PersonVector32
    birthdate: Optional[str] = None  # YYYY-MM-DD format
    name: Optional[str] = None
    
    # Numerology features (Experimental)
    life_path_number: Optional[int] = None  # 1-9
    life_path_autonomy_bias: Optional[float] = None
    life_path_novelty_bias: Optional[float] = None
    life_path_abstraction_bias: Optional[float] = None
    
    # Astrology features (Experimental)
    zodiac_sign: Optional[str] = None  # e.g., "Aries", "Taurus", etc.
    zodiac_novelty_bias: Optional[float] = None
    zodiac_stability_bias: Optional[float] = None
    zodiac_abstraction_bias: Optional[float] = None
    zodiac_emotional_sensitivity: Optional[float] = None
    
    # Metadata
    created_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage"""
        return {
            "id": self.id,
            "V": self.V.traits,
            "birthdate": self.birthdate,
            "name": self.name,
            "life_path_number": self.life_path_number,
            "life_path_autonomy_bias": self.life_path_autonomy_bias,
            "life_path_novelty_bias": self.life_path_novelty_bias,
            "life_path_abstraction_bias": self.life_path_abstraction_bias,
            "zodiac_sign": self.zodiac_sign,
            "zodiac_novelty_bias": self.zodiac_novelty_bias,
            "zodiac_stability_bias": self.zodiac_stability_bias,
            "zodiac_abstraction_bias": self.zodiac_abstraction_bias,
            "zodiac_emotional_sensitivity": self.zodiac_emotional_sensitivity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "metadata": self.metadata,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Person':
        """Create from dictionary"""
        created_at = None
        if data.get("created_at"):
            created_at = datetime.fromisoformat(data["created_at"])
        
        return cls(
            id=data["id"],
            V=PersonVector32(traits=data["V"]),
            birthdate=data.get("birthdate"),
            name=data.get("name"),
            life_path_number=data.get("life_path_number"),
            life_path_autonomy_bias=data.get("life_path_autonomy_bias"),
            life_path_novelty_bias=data.get("life_path_novelty_bias"),
            life_path_abstraction_bias=data.get("life_path_abstraction_bias"),
            zodiac_sign=data.get("zodiac_sign"),
            zodiac_novelty_bias=data.get("zodiac_novelty_bias"),
            zodiac_stability_bias=data.get("zodiac_stability_bias"),
            zodiac_abstraction_bias=data.get("zodiac_abstraction_bias"),
            zodiac_emotional_sensitivity=data.get("zodiac_emotional_sensitivity"),
            created_at=created_at,
            metadata=data.get("metadata", {}),
        )


@dataclass
class Pair:
    """
    Represents a romantic pair with compatibility metrics.
    
    Core fields:
      - person_i_id, person_j_id: references to Person objects
      - R: 7D resonance vector
      - Y: 6D outcome vector
      - S: computed soulmate score
    
    Optional context:
      - context_resonances: R vectors across different contexts/timepoints
      - feasibility: F(i,j) constraint
    """
    person_i_id: str
    person_j_id: str
    R: ResonanceVector7
    Y: OutcomeVectorY
    S: float  # Computed soulmate score
    
    feasibility: float = 1.0
    context_resonances: List[ResonanceVector7] = field(default_factory=list)
    
    # Simulation fields
    S_true: Optional[float] = None  # Ground-truth S score (for simulation)
    soulmate_flag: Optional[int] = None  # 1 if soulmate-tier, 0 otherwise
    
    # Metadata
    created_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage"""
        return {
            "person_i_id": self.person_i_id,
            "person_j_id": self.person_j_id,
            "R": self.R.metrics,
            "Y": {
                "y1_longevity": self.Y.y1_longevity,
                "y2_satisfaction": self.Y.y2_satisfaction,
                "y3_growth": self.Y.y3_growth,
                "y4_conflict_toxicity": self.Y.y4_conflict_toxicity,
                "y5_repair_efficiency": self.Y.y5_repair_efficiency,
                "y6_trajectory_alignment": self.Y.y6_trajectory_alignment,
            },
            "S": self.S,
            "S_true": self.S_true,
            "soulmate_flag": self.soulmate_flag,
            "feasibility": self.feasibility,
            "context_resonances": [r.metrics for r in self.context_resonances],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "metadata": self.metadata,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Pair':
        """Create from dictionary"""
        created_at = None
        if data.get("created_at"):
            created_at = datetime.fromisoformat(data["created_at"])
        
        context_resonances = [
            ResonanceVector7(metrics=r) for r in data.get("context_resonances", [])
        ]
        
        y_data = data["Y"]
        return cls(
            person_i_id=data["person_i_id"],
            person_j_id=data["person_j_id"],
            R=ResonanceVector7(metrics=data["R"]),
            Y=OutcomeVectorY(
                y1_longevity=y_data["y1_longevity"],
                y2_satisfaction=y_data["y2_satisfaction"],
                y3_growth=y_data["y3_growth"],
                y4_conflict_toxicity=y_data["y4_conflict_toxicity"],
                y5_repair_efficiency=y_data["y5_repair_efficiency"],
                y6_trajectory_alignment=y_data["y6_trajectory_alignment"],
            ),
            S=data["S"],
            S_true=data.get("S_true"),
            soulmate_flag=data.get("soulmate_flag"),
            feasibility=data.get("feasibility", 1.0),
            context_resonances=context_resonances,
            created_at=created_at,
            metadata=data.get("metadata", {}),
        )


class Dataset:
    """
    Container for persons and pairs.
    
    Can be serialized to/from JSON for persistence.
    """
    
    def __init__(self):
        self.persons: Dict[str, Person] = {}
        self.pairs: List[Pair] = []
    
    def add_person(self, person: Person):
        """Add a person to the dataset"""
        self.persons[person.id] = person
    
    def add_pair(self, pair: Pair):
        """Add a pair to the dataset"""
        # Validate person IDs exist
        if pair.person_i_id not in self.persons:
            raise ValueError(f"Person {pair.person_i_id} not found")
        if pair.person_j_id not in self.persons:
            raise ValueError(f"Person {pair.person_j_id} not found")
        self.pairs.append(pair)
    
    def get_person(self, person_id: str) -> Optional[Person]:
        """Get a person by ID"""
        return self.persons.get(person_id)
    
    def get_pair_features(
        self,
        pair: Pair,
        include_numerology: bool = True,
        include_astrology: bool = True,
    ) -> Dict[str, Any]:
        """
        Extract features for a pair, including optional theory-derived features.
        
        Returns a dictionary suitable for ML model training:
          - V_i, V_j: 32D trait vectors
          - R: 7D resonance vector
          - Y: 6D outcome vector
          - S: soulmate score (target)
          - Optional: numerology and astrology features
        """
        person_i = self.get_person(pair.person_i_id)
        person_j = self.get_person(pair.person_j_id)
        
        if not person_i or not person_j:
            raise ValueError("Both persons must exist in dataset")
        
        features = {
            "V_i": person_i.V.traits,
            "V_j": person_j.V.traits,
            "R": pair.R.metrics,
            "Y": pair.Y.to_list(),
            "S": pair.S,
            "feasibility": pair.feasibility,
        }
        
        # Add numerology features if available
        if include_numerology:
            numerology_features = {}
            if person_i.life_path_number is not None:
                numerology_features["life_path_i"] = person_i.life_path_number
                numerology_features["life_path_autonomy_bias_i"] = person_i.life_path_autonomy_bias
                numerology_features["life_path_novelty_bias_i"] = person_i.life_path_novelty_bias
                numerology_features["life_path_abstraction_bias_i"] = person_i.life_path_abstraction_bias
            
            if person_j.life_path_number is not None:
                numerology_features["life_path_j"] = person_j.life_path_number
                numerology_features["life_path_autonomy_bias_j"] = person_j.life_path_autonomy_bias
                numerology_features["life_path_novelty_bias_j"] = person_j.life_path_novelty_bias
                numerology_features["life_path_abstraction_bias_j"] = person_j.life_path_abstraction_bias
            
            # Compatibility features (matching generative model structure)
            # Use the same logic as compute_num_feature() in simulation_soulmates.py
            if person_i.life_path_number is not None and person_j.life_path_number is not None:
                lp_i = person_i.life_path_number
                lp_j = person_j.life_path_number
                lp_diff = abs(lp_i - lp_j)
                
                # Compute single compatibility score matching generative model
                if lp_diff == 0:
                    num_compat = 1.0  # Exact match = best
                else:
                    class_i = lp_i % 3
                    class_j = lp_j % 3
                    if class_i == class_j:
                        num_compat = 0.7  # Same modulo class
                    elif lp_diff == 1:
                        num_compat = 0.5  # Adjacent
                    elif lp_diff <= 3:
                        num_compat = 0.2  # Close
                    else:
                        num_compat = -0.3  # Far apart
                
                # Single compatibility feature (matches generative model output)
                numerology_features["numerology_compatibility"] = num_compat
                
                # Also include raw features for flexibility
                numerology_features["life_path_i"] = lp_i
                numerology_features["life_path_j"] = lp_j
                numerology_features["life_path_diff"] = lp_diff
                numerology_features["life_path_modulo_match"] = (
                    1.0 if (lp_i % 3) == (lp_j % 3) else 0.0
                )
            
            features.update(numerology_features)
        
        # Add astrology features if available
        if include_astrology:
            astrology_features = {}
            if person_i.zodiac_sign:
                astrology_features["zodiac_i"] = person_i.zodiac_sign
                astrology_features["zodiac_novelty_bias_i"] = person_i.zodiac_novelty_bias
                astrology_features["zodiac_stability_bias_i"] = person_i.zodiac_stability_bias
                astrology_features["zodiac_abstraction_bias_i"] = person_i.zodiac_abstraction_bias
                astrology_features["zodiac_emotional_sensitivity_i"] = person_i.zodiac_emotional_sensitivity
            
            if person_j.zodiac_sign:
                astrology_features["zodiac_j"] = person_j.zodiac_sign
                astrology_features["zodiac_novelty_bias_j"] = person_j.zodiac_novelty_bias
                astrology_features["zodiac_stability_bias_j"] = person_j.zodiac_stability_bias
                astrology_features["zodiac_abstraction_bias_j"] = person_j.zodiac_abstraction_bias
                astrology_features["zodiac_emotional_sensitivity_j"] = person_j.zodiac_emotional_sensitivity
            
            # Compatibility features
            if person_i.zodiac_sign and person_j.zodiac_sign:
                astrology_features["zodiac_match"] = (
                    1.0 if person_i.zodiac_sign == person_j.zodiac_sign else 0.0
                )
                # Element compatibility (Fire, Earth, Air, Water)
                element_i = self._get_zodiac_element(person_i.zodiac_sign)
                element_j = self._get_zodiac_element(person_j.zodiac_sign)
                astrology_features["element_match"] = (
                    1.0 if element_i == element_j else 0.0
                )
                # Element compatibility score (same element = 1, compatible = 0.5, incompatible = 0)
                if element_i == element_j and element_i is not None:
                    astrology_features["element_compatibility"] = 1.0
                elif element_i and element_j:
                    # Fire-Air compatible, Earth-Water compatible
                    compatible_pairs = [("Fire", "Air"), ("Air", "Fire"), ("Earth", "Water"), ("Water", "Earth")]
                    astrology_features["element_compatibility"] = (
                        0.5 if (element_i, element_j) in compatible_pairs else 0.0
                    )
                else:
                    astrology_features["element_compatibility"] = 0.0
            
            features.update(astrology_features)
        
        return features
    
    @staticmethod
    def _get_zodiac_element(zodiac_sign: str) -> Optional[str]:
        """Map zodiac sign to element"""
        fire_signs = ["Aries", "Leo", "Sagittarius"]
        earth_signs = ["Taurus", "Virgo", "Capricorn"]
        air_signs = ["Gemini", "Libra", "Aquarius"]
        water_signs = ["Cancer", "Scorpio", "Pisces"]
        
        if zodiac_sign in fire_signs:
            return "Fire"
        elif zodiac_sign in earth_signs:
            return "Earth"
        elif zodiac_sign in air_signs:
            return "Air"
        elif zodiac_sign in water_signs:
            return "Water"
        return None
    
    def to_json(self, filepath: str):
        """Save dataset to JSON file"""
        data = {
            "persons": [p.to_dict() for p in self.persons.values()],
            "pairs": [p.to_dict() for p in self.pairs],
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    
    @classmethod
    def from_json(cls, filepath: str) -> 'Dataset':
        """Load dataset from JSON file"""
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        dataset = cls()
        for p_data in data["persons"]:
            dataset.add_person(Person.from_dict(p_data))
        
        for pair_data in data["pairs"]:
            dataset.add_pair(Pair.from_dict(pair_data))
        
        return dataset


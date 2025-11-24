# base_model.py

from dataclasses import dataclass, field
from typing import List, Dict, Optional
import math

@dataclass
class PersonVector32:
    """
    32D trait vector V ∈ R^32.
    Values are assumed normalized to [0,1] or z-scored.
    We keep it as a flat list for flexibility.
    """
    traits: List[float]  # len == 32

    def __post_init__(self):
        if len(self.traits) != 32:
            raise ValueError(f"PersonVector32 expects 32 dimensions, got {len(self.traits)}.")

@dataclass
class ResonanceVector7:
    """
    7D resonance vector R ∈ R^7 for a pair.
    R = [R1..R7], each normalized to [0,1] where possible.
    """
    metrics: List[float]  # len == 7

    def __post_init__(self):
        if len(self.metrics) != 7:
            raise ValueError(f"ResonanceVector7 expects 7 dimensions, got {len(self.metrics)}.")

    @property
    def mean(self) -> float:
        return sum(self.metrics) / len(self.metrics)

    @property
    def variance(self) -> float:
        m = self.mean
        return sum((x - m) ** 2 for x in self.metrics) / len(self.metrics)

    @property
    def stability(self) -> float:
        """
        Simple proxy: stability = 1 - variance (clamped to [0,1]).
        In a real implementation, "variance" would be across contexts/time,
        not across dimensions, but this is a placeholder.
        """
        v = self.variance
        s = 1.0 - v
        return max(0.0, min(1.0, s))

@dataclass
class OutcomeVectorY:
    """
    Outcome variables Y = [Y1..Y6] all normalized to [0,1] where higher is better,
    except that Y4 (toxicity) will be treated with a negative weight in S.
    """
    y1_longevity: float
    y2_satisfaction: float
    y3_growth: float
    y4_conflict_toxicity: float
    y5_repair_efficiency: float
    y6_trajectory_alignment: float

    def to_list(self) -> List[float]:
        return [
            self.y1_longevity,
            self.y2_satisfaction,
            self.y3_growth,
            self.y4_conflict_toxicity,
            self.y5_repair_efficiency,
            self.y6_trajectory_alignment,
        ]

@dataclass
class SoulmateScoreWeights:
    """
    Weights for S = w1*Y1 + w2*Y2 + w3*Y3 - w4*Y4 + w5*Y5 + w6*Y6
    """
    w1: float = 1.0
    w2: float = 1.0
    w3: float = 1.0
    w4: float = 1.0
    w5: float = 1.0
    w6: float = 1.0

@dataclass
class TraitWeights:
    """
    Weights α_k for each of the 32 trait dimensions.
    """
    alphas: List[float] = field(default_factory=lambda: [1.0] * 32)

    def __post_init__(self):
        if len(self.alphas) != 32:
            raise ValueError(f"TraitWeights expects 32 weights, got {len(self.alphas)}.")

@dataclass
class ResonanceWeights:
    """
    Weights β1, β2 for resonance mean and stability.
    """
    beta1: float = 0.5
    beta2: float = 0.5

@dataclass
class CompatibilityWeights:
    """
    Weights γ1, γ2 for combining trait compatibility and resonance compatibility.
    """
    gamma1: float = 0.5
    gamma2: float = 0.5

@dataclass
class CompatibilityModel:
    """
    Core compatibility computation:
      - D_traits
      - C_traits
      - C_res
      - feasibility F
      - total compatibility C
      - predicted soulmate score Ŝ
    """
    trait_weights: TraitWeights = field(default_factory=TraitWeights)
    resonance_weights: ResonanceWeights = field(default_factory=ResonanceWeights)
    compatibility_weights: CompatibilityWeights = field(default_factory=CompatibilityWeights)
    soulmate_score_weights: SoulmateScoreWeights = field(default_factory=SoulmateScoreWeights)

    def trait_distance(self, p1: PersonVector32, p2: PersonVector32) -> float:
        """
        D_traits(i,j) = sqrt(Σ α_k (V_ik − V_jk)^2)
        """
        if len(p1.traits) != 32 or len(p2.traits) != 32:
            raise ValueError("Both PersonVector32 instances must have 32 traits.")

        s = 0.0
        for a, v1, v2 in zip(self.trait_weights.alphas, p1.traits, p2.traits):
            s += a * (v1 - v2) ** 2
        return math.sqrt(s)

    def trait_compatibility(self, p1: PersonVector32, p2: PersonVector32) -> float:
        """
        C_traits(i,j) = exp(-D_traits(i,j))
        """
        d = self.trait_distance(p1, p2)
        return math.exp(-d)

    def resonance_compatibility(self, r: ResonanceVector7) -> float:
        """
        C_res(i,j) = β1 * R_mean + β2 * R_stab
        """
        b1 = self.resonance_weights.beta1
        b2 = self.resonance_weights.beta2
        return b1 * r.mean + b2 * r.stability

    def soulmate_score(self, y: OutcomeVectorY) -> float:
        """
        S = w1*Y1 + w2*Y2 + w3*Y3 - w4*Y4 + w5*Y5 + w6*Y6
        """
        w = self.soulmate_score_weights
        return (
            w.w1 * y.y1_longevity
            + w.w2 * y.y2_satisfaction
            + w.w3 * y.y3_growth
            - w.w4 * y.y4_conflict_toxicity
            + w.w5 * y.y5_repair_efficiency
            + w.w6 * y.y6_trajectory_alignment
        )

    def total_compatibility(
        self,
        p1: PersonVector32,
        p2: PersonVector32,
        r: ResonanceVector7,
        feasibility: float = 1.0,
    ) -> Dict[str, float]:
        """
        Compute:
          - C_traits
          - C_res
          - C
          - Ŝ (predicted soulmate score proxy)
        """
        feasibility = max(0.0, min(1.0, feasibility))

        c_traits = self.trait_compatibility(p1, p2)
        c_res = self.resonance_compatibility(r)

        g1 = self.compatibility_weights.gamma1
        g2 = self.compatibility_weights.gamma2
        c_total = g1 * c_traits + g2 * c_res

        s_hat = feasibility * c_total

        return {
            "C_traits": c_traits,
            "C_res": c_res,
            "C_total": c_total,
            "feasibility": feasibility,
            "S_hat": s_hat,
        }

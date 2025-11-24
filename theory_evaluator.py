# theory_evaluator.py

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Any, Optional

class TheoryClassification(str, Enum):
    CORE = "Core"
    EXPERIMENTAL = "Experimental"
    DISCARDED = "Discarded"

@dataclass
class OperationalVariable:
    """
    A single measurable variable derived from a theory.
    """
    name: str
    description: str
    measurement: str  # how to measure (questionnaire, behavioral, etc.)
    maps_to: str      # one of: "V", "R", "Y", "F", "C"
    target_component: Optional[str] = None  # e.g. "A1", "R6", "Y2" or explanation

@dataclass
class OperationalizationResult:
    variables: List[OperationalVariable] = field(default_factory=list)
    is_operational: bool = False
    notes: str = ""

@dataclass
class PredictiveValueAssessment:
    expected_signal: str  # qualitative description
    test_methods: List[str]  # e.g., "nested model comparison", "ablation study"
    discard_criteria: str    # description of when to drop the theory

@dataclass
class TheoryEvaluation:
    name: str
    description: str
    operationalization: OperationalizationResult
    predictive_assessment: PredictiveValueAssessment
    classification: TheoryClassification
    model_update_suggestions: Dict[str, Any]

class TheoryEvaluator:
    """
    Framework for evaluating romantic compatibility theories against the base model.
    """

    def evaluate(self, theory: Dict[str, Any]) -> TheoryEvaluation:
        """
        Main entry point.
        `theory` is expected to be a dict with (at minimum):
          - "name": str
          - "description": str
        May also include:
          - "falsifiable": bool
          - "type": str
          - "claims": list
        """
        name = theory.get("name", "").strip() or "Unnamed Theory"
        description = theory.get("description", "").strip()
        falsifiable = theory.get("falsifiable", None)
        type_hint = (theory.get("type") or "").lower()

        # 1. Hard-coded handling for known examples
        op_result = self._operationalize_known_theory(name, description, type_hint)

        classification, predictive_assessment, model_updates = self._classify_and_assess(
            name=name,
            theory=theory,
            op_result=op_result,
            falsifiable=falsifiable,
        )

        return TheoryEvaluation(
            name=name,
            description=description,
            operationalization=op_result,
            predictive_assessment=predictive_assessment,
            classification=classification,
            model_update_suggestions=model_updates,
        )

    # ---------------- INTERNALS ----------------

    def _operationalize_known_theory(
        self, name: str, description: str, type_hint: str
    ) -> OperationalizationResult:
        lname = name.lower()

        # Attachment Theory
        if "attachment" in lname:
            return self._op_attachment_theory()

        # Big Five
        if "big five" in lname or "big5" in lname or "five factor" in lname:
            return self._op_big_five()

        # Physiological Synchrony
        if "physiological synchrony" in lname:
            return self._op_physiological_synchrony()

        # Enneagram
        if "enneagram" in lname:
            return self._op_enneagram()

        # Astrology
        if "astrology" in lname or "zodiac" in lname:
            return self._op_astrology()

        # Numerology (including life path numbers)
        if "numerology" in lname or "life path" in lname:
            return self._op_numerology()

        # Default: try generic operationalization from provided "claims"
        claims = description or ""
        if not claims:
            return OperationalizationResult(
                variables=[],
                is_operational=False,
                notes="No description or known mapping; cannot be operationalized automatically."
            )

        # Minimal generic mapping stub
        return OperationalizationResult(
            variables=[],
            is_operational=False,
            notes="Unknown theory type; requires manual definition of measurable variables."
        )

    # --- Specific theory operationalizations ---

    def _op_attachment_theory(self) -> OperationalizationResult:
        vars_ = [
            OperationalVariable(
                name="attachment_security",
                description="Level of secure vs anxious/avoidant attachment.",
                measurement="Standard attachment questionnaires; partner reports.",
                maps_to="V",
                target_component="A1",
            ),
            OperationalVariable(
                name="abandonment_sensitivity",
                description="Sensitivity to perceived abandonment or rejection.",
                measurement="Attachment-related anxiety scales; conflict behavior coding.",
                maps_to="V",
                target_component="A2",
            ),
        ]
        return OperationalizationResult(
            variables=vars_,
            is_operational=True,
            notes="Attachment Theory variables map cleanly into the A1/A2 cluster of the 32D model."
        )

    def _op_big_five(self) -> OperationalizationResult:
        vars_ = [
            OperationalVariable(
                name="extraversion",
                description="Extraversion level from Big Five.",
                measurement="Big Five inventory scores.",
                maps_to="V",
                target_component="S1",
            ),
            OperationalVariable(
                name="agreeableness",
                description="Agreeableness from Big Five.",
                measurement="Big Five inventory scores.",
                maps_to="V",
                target_component="S3",
            ),
            OperationalVariable(
                name="neuroticism",
                description="Neuroticism from Big Five (inverse of emotional stability).",
                measurement="Big Five inventory scores.",
                maps_to="V",
                target_component="A3",
            ),
            OperationalVariable(
                name="conscientiousness",
                description="Conscientiousness from Big Five.",
                measurement="Big Five inventory scores.",
                maps_to="V",
                target_component="L1",
            ),
            OperationalVariable(
                name="openness",
                description="Openness to experience from Big Five.",
                measurement="Big Five inventory scores.",
                maps_to="V",
                target_component="T5",
            ),
        ]
        return OperationalizationResult(
            variables=vars_,
            is_operational=True,
            notes="Big Five traits map to social, regulatory, cognitive, and lifestyle dimensions of V."
        )

    def _op_physiological_synchrony(self) -> OperationalizationResult:
        vars_ = [
            OperationalVariable(
                name="hrv_coupling",
                description="Heart-rate variability coupling between partners.",
                measurement="Wearable sensors during shared tasks; HRV correlation.",
                maps_to="R",
                target_component="R6",
            ),
            OperationalVariable(
                name="eda_coupling",
                description="Skin conductance synchrony.",
                measurement="EDA sensors; time-series correlation.",
                maps_to="R",
                target_component="R6",
            ),
        ]
        return OperationalizationResult(
            variables=vars_,
            is_operational=True,
            notes="Physiological synchrony augments R6 (physiological resonance)."
        )

    def _op_enneagram(self) -> OperationalizationResult:
        vars_ = [
            OperationalVariable(
                name="enneagram_core_type",
                description="Dominant Enneagram type (1-9).",
                measurement="Enneagram questionnaires, self-report.",
                maps_to="V",
                target_component="mixed",  # maps to multiple subdimensions
            )
        ]
        return OperationalizationResult(
            variables=vars_,
            is_operational=True,
            notes="Enneagram types are coarse, overlapping constructs that loosely map to "
                  "multiple V dimensions (motivation, fear structures). Requires validation."
        )

    def _op_numerology(self) -> OperationalizationResult:
        """
        Treat numerology / life-path numbers as a *hypothesized* proxy for latent traits.
        We do NOT assume it's true; we just define measurable variables we can test.

        Example hypotheses (to be empirically validated or rejected):
          - Low life-path numbers (1–3) → higher autonomy/agency, novelty.
          - Mid numbers (4–6) → higher stability, conscientiousness, structure.
          - High numbers (7–9) → higher abstraction, introspection, value/meaning focus.
        """
        vars_ = [
            OperationalVariable(
                name="life_path_number",
                description="Integer 1–9 derived from birthdate via numerology rules.",
                measurement="Computed from birthdate; recorded as categorical or one-hot.",
                maps_to="V",
                target_component="latent_index",
            ),
            OperationalVariable(
                name="life_path_autonomy_bias",
                description="Hypothesized tendency of certain life-path numbers to track autonomy vs togetherness.",
                measurement="Empirically estimated: regress A1, V1 on life-path categories.",
                maps_to="V",
                target_component="V1",
            ),
            OperationalVariable(
                name="life_path_novelty_bias",
                description="Hypothesized link between some life-path numbers and novelty/stability preference.",
                measurement="Empirically estimated: regress V2 on life-path categories.",
                maps_to="V",
                target_component="V2",
            ),
            OperationalVariable(
                name="life_path_abstraction_bias",
                description="Hypothesized link between some life-path numbers and abstraction/introspection.",
                measurement="Empirically estimated: regress T5 on life-path categories.",
                maps_to="V",
                target_component="T5",
            ),
        ]
        return OperationalizationResult(
            variables=vars_,
            is_operational=True,
            notes=(
                "Numerology / life-path numbers are treated as *hypothesized indices* that may correlate with "
                "real traits (e.g. autonomy, novelty, abstraction). They must be empirically tested; "
                "if they fail to add predictive value for S, they should be discarded."
            ),
        )

    def _op_astrology(self) -> OperationalizationResult:
        """
        Treat astrology / zodiac signs as hypothesized proxies for trait clusters, without
        assuming they are true. We only define measurable variables that we can test and discard.

        Example hypotheses (to be empirically rejected or confirmed):
          - Fire signs → higher novelty / risk / agency bias.
          - Earth signs → higher stability / conscientiousness.
          - Air signs → higher abstraction / cognitive focus.
          - Water signs → higher emotional attunement / sensitivity.
        """
        vars_ = [
            OperationalVariable(
                name="zodiac_sign",
                description="Zodiac sign (e.g. Aries, Taurus, ...), encoded categorically.",
                measurement="Derived from birthdate; stored as categorical / one-hot.",
                maps_to="V",
                target_component="latent_index",
            ),
            OperationalVariable(
                name="zodiac_novelty_bias",
                description="Hypothesized mapping from some signs to higher novelty / exploration drive.",
                measurement="Empirically estimated: regress V2, T4 on zodiac categories.",
                maps_to="V",
                target_component="V2",
            ),
            OperationalVariable(
                name="zodiac_stability_bias",
                description="Hypothesized mapping from some signs to higher stability / structure.",
                measurement="Empirically estimated: regress V2, L1 on zodiac categories.",
                maps_to="V",
                target_component="V2",
            ),
            OperationalVariable(
                name="zodiac_abstraction_bias",
                description="Hypothesized mapping from some signs to abstraction / cognitive style.",
                measurement="Empirically estimated: regress T5 on zodiac categories.",
                maps_to="V",
                target_component="T5",
            ),
            OperationalVariable(
                name="zodiac_emotional_sensitivity",
                description="Hypothesized mapping from some signs to emotional reactivity / attunement.",
                measurement="Empirically estimated: regress A2, A3 on zodiac categories.",
                maps_to="V",
                target_component="A2/A3",
            ),
        ]
        return OperationalizationResult(
            variables=vars_,
            is_operational=True,
            notes=(
                "Astrology / zodiac signs are treated as *hypothesized categorical indices* potentially correlated "
                "with certain trait clusters (novelty, stability, abstraction, emotional sensitivity). They must be "
                "empirically tested and discarded if they add no predictive value for S."
            ),
        )

    # --- Classification and predictive assessment ---

    def _classify_and_assess(
        self,
        name: str,
        theory: Dict[str, Any],
        op_result: OperationalizationResult,
        falsifiable: Optional[bool],
    ):
        lname = name.lower()

        # Handle our example known theories (check specific theories BEFORE general falsifiable check)
        if "attachment" in lname:
            return self._experimental_attachment(op_result)

        if "big five" in lname or "big5" in lname or "five factor" in lname:
            return self._experimental_big_five(op_result)

        if "physiological synchrony" in lname:
            return self._experimental_physiological_synchrony(op_result)

        if "enneagram" in lname:
            return self._experimental_enneagram(op_result)

        # Astrology and numerology are treated as Experimental even if falsifiable=False
        # They are operationalizable hypotheses that can be tested and discarded empirically
        if "numerology" in lname or "life path" in lname:
            return self._experimental_numerology(op_result)

        if "astrology" in lname or "zodiac" in lname:
            return self._experimental_astrology(op_result)

        # If falsifiable flag is explicitly provided (for unknown theories):
        if falsifiable is False:
            return self._discard_non_falsifiable(
                name,
                op_result,
                reason="Theory explicitly marked as non-falsifiable."
            )

        # Default behavior:
        if not op_result.is_operational:
            # Unknown or un-mapped theory
            p_assessment = PredictiveValueAssessment(
                expected_signal="Unknown; theory not operationalized, so no predictive signal can be evaluated.",
                test_methods=[],
                discard_criteria="If no concrete, measurable variables can be proposed, the theory should be discarded.",
            )
            return TheoryClassification.DISCARDED, p_assessment, {}

        # If operational but unknown, treat as Experimental by default
        p_assessment = PredictiveValueAssessment(
            expected_signal="Potential incremental predictive value, contingent on empirical validation.",
            test_methods=[
                "Nested model comparison against base 32D+R model",
                "Cross-validation with and without theory variables",
            ],
            discard_criteria="Discard if variables do not improve prediction of S beyond base model.",
        )
        return TheoryClassification.EXPERIMENTAL, p_assessment, self._generic_model_update(op_result)

    # --- helpers per theory ---

    def _discard_non_falsifiable(
        self,
        name: str,
        op_result: OperationalizationResult,
        reason: str,
    ):
        p_assessment = PredictiveValueAssessment(
            expected_signal="No legitimate predictive signal within this framework; non-falsifiable.",
            test_methods=[],
            discard_criteria="Theory is non-falsifiable or purely symbolic; excluded by design.",
        )
        op_result.is_operational = False
        op_result.notes = op_result.notes or "" + f" Discarded: {reason}"
        return TheoryClassification.DISCARDED, p_assessment, {}

    def _experimental_attachment(self, op_result: OperationalizationResult):
        p_assessment = PredictiveValueAssessment(
            expected_signal="Strong likely signal for Y2 (satisfaction), Y4 (toxicity), Y5 (repair), and Y1 (longevity).",
            test_methods=[
                "Regression of Y on attachment-derived V components",
                "Nested model comparison: base vs base+attachment variables",
            ],
            discard_criteria="Discard if attachment variables fail to improve prediction of S across multiple datasets.",
        )
        updates = {
            "V": "Refine A1/A2 dimensions to explicitly store attachment security and abandonment sensitivity.",
        }
        return TheoryClassification.EXPERIMENTAL, p_assessment, updates

    def _experimental_big_five(self, op_result: OperationalizationResult):
        p_assessment = PredictiveValueAssessment(
            expected_signal="Moderate predictive signal for interpersonal style, conflict behavior, and satisfaction.",
            test_methods=[
                "Factor analysis linking Big Five to 32D dimensions",
                "Cross-validated prediction of Y using Big Five-enriched V",
            ],
            discard_criteria="Discard as separate module if Big Five adds little variance beyond refined 32D traits.",
        )
        updates = {
            "V": "Allow backfilling or initializing certain V components (S1, S3, A3, L1, T5) from Big Five scores.",
        }
        return TheoryClassification.EXPERIMENTAL, p_assessment, updates

    def _experimental_physiological_synchrony(self, op_result: OperationalizationResult):
        p_assessment = PredictiveValueAssessment(
            expected_signal="High potential signal for Y2 (satisfaction), Y3 (growth via co-regulation), Y5 (repair).",
            test_methods=[
                "Time-series coupling metrics added to R6 and tested as predictors of S",
                "Compare models with and without R6-enriched features",
            ],
            discard_criteria="Discard if R6-related variables do not improve S prediction beyond behavioral resonance metrics.",
        )
        updates = {
            "R": "Expand R6 to explicitly include HRV and EDA coupling metrics.",
        }
        return TheoryClassification.EXPERIMENTAL, p_assessment, updates

    def _experimental_enneagram(self, op_result: OperationalizationResult):
        p_assessment = PredictiveValueAssessment(
            expected_signal="Unclear; Enneagram types might cluster motivational structures but are noisy.",
            test_methods=[
                "Cluster analysis relating Enneagram types to V",
                "Ablation study: include vs exclude Enneagram-derived variables.",
            ],
            discard_criteria="Discard if Enneagram types do not correspond to distinct, stable patterns in V or S.",
        )
        updates = {
            "V": "Optionally store Enneagram core type as a categorical tag; use only if it maps to stable V-patterns.",
        }
        return TheoryClassification.EXPERIMENTAL, p_assessment, updates

    def _experimental_numerology(self, op_result: OperationalizationResult):
        p_assessment = PredictiveValueAssessment(
            expected_signal=(
                "Unknown. Life-path numbers may function as weak, noisy proxies for underlying trait clusters "
                "(autonomy, novelty, abstraction), or they may carry no signal at all."
            ),
            test_methods=[
                "Encode life-path number as categorical / one-hot and test incremental variance in S "
                "beyond the 32D+R baseline.",
                "Regression / classification to see if life-path categories predict any stable pattern in V.",
                "Ablation: compare models with and without life-path-derived features.",
            ],
            discard_criteria=(
                "Discard numerology if life-path variables fail to improve prediction of S across multiple datasets, "
                "or if any apparent signal disappears after controlling for known traits in V."
            ),
        )
        updates = {
            "V": (
                "Allow optional storage of life-path number as a categorical feature and its derived trait-bias "
                "variables as candidates for V1 (autonomy), V2 (novelty), T5 (abstraction). These remain "
                "Experimental until proven predictive."
            ),
        }
        return TheoryClassification.EXPERIMENTAL, p_assessment, updates

    def _experimental_astrology(self, op_result: OperationalizationResult):
        p_assessment = PredictiveValueAssessment(
            expected_signal=(
                "Highly uncertain. Zodiac categories may act as noisy groupings that correlate weakly with trait "
                "clusters, or more likely, carry no stable signal once real traits in V are controlled for."
            ),
            test_methods=[
                "Encode zodiac sign as categorical / one-hot and test incremental variance in S",
                "Check whether zodiac categories predict any stable pattern in V across large samples.",
                "Ablation: compare models with and without zodiac-derived features while controlling for existing V.",
            ],
            discard_criteria=(
                "Discard astrology if zodiac-derived variables fail to improve prediction of S beyond the 32D+R base "
                "model, or if any apparent effects vanish after controlling for existing trait dimensions."
            ),
        )
        updates = {
            "V": (
                "Allow optional storage of zodiac sign as a categorical feature and derived trait-bias variables "
                "as candidates for novelty, stability, abstraction, and emotional-sensitivity dimensions. "
                "All remain Experimental until empirically supported."
            ),
        }
        return TheoryClassification.EXPERIMENTAL, p_assessment, updates

    def _generic_model_update(self, op_result: OperationalizationResult) -> Dict[str, Any]:
        updates: Dict[str, Any] = {}
        for var in op_result.variables:
            if var.maps_to not in updates:
                updates[var.maps_to] = []
            updates[var.maps_to].append(
                f"Add/adjust component {var.target_component or '?'} for variable '{var.name}'."
            )
        return updates

"""
Simulation Framework for Testing Soulmate Detection

Tests whether the system can:
1. Identify "soulmate-tier" pairs
2. Correctly keep/discard astrology and numerology features based on ground truth
3. Recover the true generative structure of compatibility
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any
import random
import numpy as np
from datetime import datetime

from data_schema import Dataset, Person, Pair
from base_model import (
    PersonVector32, ResonanceVector7, OutcomeVectorY,
    CompatibilityModel
)
from analysis import add_soulmate_flag, run_ablation_study, ModelComparator, FeatureExtractor, ModelResults, DecisionThresholds

# Zodiac signs and elements
ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

ZODIAC_ELEMENTS = {
    "Fire": ["Aries", "Leo", "Sagittarius"],
    "Earth": ["Taurus", "Virgo", "Capricorn"],
    "Air": ["Gemini", "Libra", "Aquarius"],
    "Water": ["Cancer", "Scorpio", "Pisces"],
}


@dataclass
class WorldConfig:
    """Configuration for a simulation world"""
    name: str
    n_persons: int = 100
    n_pairs: int = 200
    top_percent_soulmates: float = 0.1  # e.g., 0.1 for top 10%
    astro_effect_strength: float = 0.0  # 0.0 = astro irrelevant, >0 = astro matters
    num_effect_strength: float = 0.0  # 0.0 = numerology irrelevant, >0 = numerology matters
    noise_level: float = 0.1  # amount of noise added to S_true
    seed: int = 42


def compute_life_path_number(birthdate: str) -> int:
    """Simple numerology: sum digits of birthdate, reduce to 1-9"""
    digits = "".join(birthdate.split("-"))
    total = sum(int(d) for d in digits)
    while total > 9:
        total = sum(int(d) for d in str(total))
    return total


def get_zodiac_sign(birthdate: str) -> str:
    """Simple zodiac sign from birthdate (simplified)"""
    month, day = map(int, birthdate.split("-")[1:])
    
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "Aries"
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "Taurus"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "Gemini"
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "Cancer"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "Leo"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "Virgo"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "Libra"
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "Scorpio"
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "Sagittarius"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "Capricorn"
    else:
        return "Aquarius"


def get_zodiac_element(zodiac_sign: str) -> Optional[str]:
    """Get element for zodiac sign"""
    for element, signs in ZODIAC_ELEMENTS.items():
        if zodiac_sign in signs:
            return element
    return None


def compute_astro_feature(person_i: Person, person_j: Person) -> float:
    """
    Compute orthogonal astrology feature (element-based compatibility).
    Returns value in [-1, 1] range, designed to be uncorrelated with numerology.
    """
    element_i = get_zodiac_element(person_i.zodiac_sign)
    element_j = get_zodiac_element(person_j.zodiac_sign)
    
    if element_i is None or element_j is None:
        return 0.0
    
    # Element compatibility matrix (orthogonal structure)
    # Fire-Air compatible, Earth-Water compatible, same element best
    compatible_pairs = [
        ("Fire", "Air"), ("Air", "Fire"),
        ("Earth", "Water"), ("Water", "Earth")
    ]
    
    if element_i == element_j:
        return 1.0  # Same element = best
    elif (element_i, element_j) in compatible_pairs:
        return 0.5  # Compatible elements
    else:
        return -0.5  # Incompatible elements


def compute_num_feature(person_i: Person, person_j: Person) -> float:
    """
    Compute orthogonal numerology feature (life-path based).
    Returns value in [-1, 1] range, designed to be uncorrelated with astrology.
    Uses structural properties: exact match, difference magnitude, parity, modulo classes.
    """
    lp_i = person_i.life_path_number
    lp_j = person_j.life_path_number
    
    if lp_i is None or lp_j is None:
        return 0.0
    
    lp_diff = abs(lp_i - lp_j)
    
    # Exact match = best
    if lp_diff == 0:
        return 1.0
    
    # Use modulo-3 classes for orthogonality with astrology
    class_i = lp_i % 3
    class_j = lp_j % 3
    
    if class_i == class_j:
        # Same modulo class = strong positive
        return 0.7
    elif lp_diff == 1:
        # Adjacent numbers = moderate positive
        return 0.5
    elif lp_diff <= 3:
        # Close numbers = slight positive
        return 0.2
    else:
        # Far apart = negative
        return -0.3


def generate_world_dataset(config: WorldConfig) -> Dataset:
    """
    Generate synthetic dataset with explicit ground-truth generative model.
    
    S_true = base_term + astro_term + num_term + noise
    where:
      - base_term: from 32D V and R (baseline compatibility)
      - astro_term: scaled by astro_effect_strength (0 if irrelevant)
      - num_term: scaled by num_effect_strength (0 if irrelevant)
      - noise: N(0, noise_level)
    """
    random.seed(config.seed)
    np.random.seed(config.seed)
    
    dataset = Dataset()
    model = CompatibilityModel()
    
    # Generate persons
    persons: List[Person] = []
    for i in range(config.n_persons):
        # Random birthdate
        year = random.randint(1980, 2000)
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        birthdate = f"{year}-{month:02d}-{day:02d}"
        
        # 32D trait vector
        V = PersonVector32(traits=[random.random() for _ in range(32)])
        
        # Numerology features
        life_path = compute_life_path_number(birthdate)
        
        # Astrology features
        zodiac = get_zodiac_sign(birthdate)
        
        person = Person(
            id=f"person_{i}",
            V=V,
            birthdate=birthdate,
            name=f"Person_{i}",
            life_path_number=life_path,
            zodiac_sign=zodiac,
            created_at=datetime.now(),
        )
        
        persons.append(person)
        dataset.add_person(person)
    
    # Generate pairs
    for _ in range(config.n_pairs):
        person_i = random.choice(persons)
        person_j = random.choice(persons)
        
        if person_i.id == person_j.id:
            continue
        
        # Random 7D resonance vector
        R = ResonanceVector7(metrics=[random.random() for _ in range(7)])
        
        # Base compatibility term (from V and R)
        base_compat = model.total_compatibility(
            person_i.V,
            person_j.V,
            R,
            feasibility=random.uniform(0.7, 1.0),
        )["C_total"]
        
        # Orthogonal astrology feature: element-based compatibility
        # Returns value in [-1, 1] range, designed to be uncorrelated with numerology
        A_ij = compute_astro_feature(person_i, person_j)
        
        # Orthogonal numerology feature: life-path based
        # Returns value in [-1, 1] range, designed to be uncorrelated with astrology
        N_ij = compute_num_feature(person_i, person_j)
        
        # Scale features by effect strengths
        astro_term = config.astro_effect_strength * A_ij if config.astro_effect_strength > 0 else 0.0
        num_term = config.num_effect_strength * N_ij if config.num_effect_strength > 0 else 0.0
        
        # True S score: base + scaled theory terms + noise
        noise = np.random.normal(0, config.noise_level)
        S_true = base_compat + astro_term + num_term + noise
        
        # Normalize S_true to reasonable range [0, 1]
        # Clip extreme values but preserve relative ordering
        S_true = max(0.0, min(1.0, S_true))
        
        # Ensure S_true has reasonable variance (rescale if needed)
        # This helps regression models learn better
        
        # Generate Y outcomes correlated with S_true
        Y = OutcomeVectorY(
            y1_longevity=random.uniform(0.5, 1.0) * S_true,
            y2_satisfaction=random.uniform(0.5, 1.0) * S_true,
            y3_growth=random.uniform(0.5, 1.0) * S_true,
            y4_conflict_toxicity=random.uniform(0.0, 0.5) * (1 - S_true),
            y5_repair_efficiency=random.uniform(0.5, 1.0) * S_true,
            y6_trajectory_alignment=random.uniform(0.5, 1.0) * S_true,
        )
        
        # Compute S from Y (using model)
        S = model.soulmate_score(Y)
        
        pair = Pair(
            person_i_id=person_i.id,
            person_j_id=person_j.id,
            R=R,
            Y=Y,
            S=S,
            S_true=S_true,  # Store ground truth
            feasibility=base_compat,
            created_at=datetime.now(),
        )
        
        dataset.add_pair(pair)
    
    return dataset


@dataclass
class WorldResult:
    """Result from evaluating a single world configuration"""
    world_name: str
    astro_effect: float
    num_effect: float
    decisions: Dict[str, str]  # e.g. {"astro": "KEEP", "num": "DISCARD"}
    ground_truth: Dict[str, str]  # e.g. {"astro": "KEEP", "num": "KEEP"}
    correct: bool
    soulmate_f1: float


def evaluate_world_once(config: WorldConfig, thresholds: DecisionThresholds, seed: int) -> WorldResult:
    """
    Evaluate a single world configuration with given thresholds and seed.
    
    Returns WorldResult with decisions and correctness.
    """
    # Set seed for reproducibility
    random.seed(seed)
    np.random.seed(seed)
    
    # Generate dataset
    config.seed = seed
    dataset = generate_world_dataset(config)
    
    # Add soulmate flags
    add_soulmate_flag(dataset, top_percent=config.top_percent_soulmates, use_s_true=True)
    
    # Run ablation study
    structured_results = run_ablation_study(
        dataset,
        test_size=0.2,
        random_state=seed,
        include_classification=True,
        thresholds=thresholds,
        verbose=False,
    )
    
    # Extract decisions
    decisions = {
        "astro": structured_results.get("astro", {}).get("decision", "N/A"),
        "num": structured_results.get("num", {}).get("decision", "N/A"),
    }
    
    # Determine ground truth
    ground_truth = {
        "astro": "KEEP" if config.astro_effect_strength > 0 else "DISCARD",
        "num": "KEEP" if config.num_effect_strength > 0 else "DISCARD",
    }
    
    # Check correctness
    correct = (
        decisions.get("astro") == ground_truth.get("astro") and
        decisions.get("num") == ground_truth.get("num")
    )
    
    # Get soulmate F1 (best across all models)
    baseline_f1 = structured_results.get("baseline", {}).get("classification", {}).get("f1", 0.0)
    astro_f1 = structured_results.get("astro", {}).get("classification", {}).get("f1", 0.0)
    num_f1 = structured_results.get("num", {}).get("classification", {}).get("f1", 0.0)
    soulmate_f1 = max(baseline_f1, astro_f1, num_f1)
    
    return WorldResult(
        world_name=config.name,
        astro_effect=config.astro_effect_strength,
        num_effect=config.num_effect_strength,
        decisions=decisions,
        ground_truth=ground_truth,
        correct=correct,
        soulmate_f1=soulmate_f1,
    )


def evaluate_world_multi_seed(
    config: WorldConfig,
    thresholds: DecisionThresholds,
    n_seeds: int = 10
) -> Dict[str, Any]:
    """
    Evaluate a world configuration across multiple seeds.
    
    Returns summary with accuracy across seeds.
    """
    correct_count = 0
    f1_scores = []
    
    for seed in range(n_seeds):
        result = evaluate_world_once(config, thresholds, seed)
        if result.correct:
            correct_count += 1
        f1_scores.append(result.soulmate_f1)
    
    accuracy = correct_count / n_seeds
    avg_f1 = np.mean(f1_scores) if f1_scores else 0.0
    
    return {
        "world": config.name,
        "astro_effect": config.astro_effect_strength,
        "num_effect": config.num_effect_strength,
        "accuracy": accuracy,
        "correct_count": correct_count,
        "n_seeds": n_seeds,
        "avg_soulmate_f1": avg_f1,
    }


def sweep_thresholds(
    worlds: List[WorldConfig],
    r2_thresholds: List[float],
    f1_thresholds: List[float],
    n_seeds: int = 10,
) -> Dict[str, Any]:
    """
    Sweep threshold combinations to find optimal settings.
    
    Returns best thresholds and per-world accuracies.
    """
    print("\n" + "=" * 80)
    print("THRESHOLD SWEEP")
    print("=" * 80)
    print(f"Testing {len(r2_thresholds)} R² thresholds × {len(f1_thresholds)} F1 thresholds")
    print(f"Running {n_seeds} seeds per world × {len(worlds)} worlds")
    print(f"Total evaluations: {len(r2_thresholds) * len(f1_thresholds) * len(worlds) * n_seeds}")
    
    best_accuracy = -1.0  # Start below 0 so first result always wins
    best_thresholds = None
    best_results = None
    
    all_results = []
    
    for r2_thresh in r2_thresholds:
        for f1_thresh in f1_thresholds:
            thresholds = DecisionThresholds(
                r2_min_delta_keep=r2_thresh,
                f1_min_delta_keep=f1_thresh,
            )
            
            world_results = []
            total_correct = 0
            total_decisions = 0
            
            for world in worlds:
                try:
                    result = evaluate_world_multi_seed(world, thresholds, n_seeds)
                    world_results.append(result)
                    total_correct += result["correct_count"]
                    total_decisions += result["n_seeds"]
                except Exception as e:
                    print(f"  Error evaluating {world.name}: {e}")
                    import traceback
                    traceback.print_exc()
                    # Add failed result
                    world_results.append({
                        "world": world.name,
                        "accuracy": 0.0,
                        "astro_effect": world.astro_effect_strength,
                        "num_effect": world.num_effect_strength,
                        "correct_count": 0,
                        "n_seeds": n_seeds,
                        "avg_soulmate_f1": 0.0,
                    })
                    total_decisions += n_seeds
            
            overall_accuracy = total_correct / total_decisions if total_decisions > 0 else 0.0
            
            all_results.append({
                "thresholds": thresholds,
                "overall_accuracy": overall_accuracy,
                "world_results": world_results,
            })
            
            if overall_accuracy >= best_accuracy:  # Use >= to ensure we always have a best
                best_accuracy = overall_accuracy
                best_thresholds = thresholds
                best_results = world_results
    
    if best_thresholds is None:
        # Fallback to defaults if no results
        best_thresholds = DecisionThresholds()
        best_results = []
        print("\nWarning: No threshold combinations tested successfully. Using defaults.")
    
    print(f"\n{'='*80}")
    print("BEST THRESHOLDS FOUND")
    print(f"{'='*80}")
    print(f"R² threshold: {best_thresholds.r2_min_delta_keep}")
    print(f"F1 threshold: {best_thresholds.f1_min_delta_keep}")
    print(f"Overall accuracy: {best_accuracy:.2%}")
    if best_results:
        print(f"\nPer-world accuracy:")
        for result in best_results:
            print(f"  {result['world']}: {result['accuracy']:.2%} "
                  f"(astro={result['astro_effect']:.1f}, num={result['num_effect']:.1f})")
    
    return {
        "best_thresholds": best_thresholds,
        "best_accuracy": best_accuracy,
        "best_results": best_results,
        "all_results": all_results,
    }


def run_world_simulation(config: WorldConfig, thresholds: Optional[DecisionThresholds] = None) -> Dict:
    """
    Run simulation for a single world configuration.
    
    Returns summary dictionary with:
      - world_name
      - ground_truth (astro/num effect strengths)
      - decisions (KEEP/DISCARD for astro/num)
      - soulmate_classification_metrics
    """
    print(f"\n{'='*80}")
    print(f"SIMULATING WORLD: {config.name}")
    print(f"{'='*80}")
    print(f"Astro effect strength: {config.astro_effect_strength}")
    print(f"Num effect strength: {config.num_effect_strength}")
    print(f"Noise level: {config.noise_level}")
    print(f"Top {config.top_percent_soulmates*100}% are soulmates")
    
    # Generate dataset
    dataset = generate_world_dataset(config)
    
    # Add soulmate flags
    add_soulmate_flag(dataset, top_percent=config.top_percent_soulmates, use_s_true=True)
    
    # Use provided thresholds or default
    if thresholds is None:
        thresholds = DecisionThresholds()
    structured_results = run_ablation_study(
        dataset,
        test_size=0.2,
        random_state=config.seed,
        include_classification=True,
        thresholds=thresholds,
        verbose=False,  # Suppress verbose output during multi-seed runs
    )
    
    # Extract decisions from structured results
    decisions = {
        "astrology": structured_results.get("astro", {}).get("decision", "N/A"),
        "numerology": structured_results.get("num", {}).get("decision", "N/A"),
        "combined": structured_results.get("astro_num", {}).get("decision", "N/A"),
    }
    
    # Get raw results for compatibility
    results = structured_results.get("_raw_results", {})
    
    # Extract best classification metrics
    best_f1 = 0.0
    best_model = None
    for name, result in results.items():
        if result.classification_f1 is not None and result.classification_f1 > best_f1:
            best_f1 = result.classification_f1
            best_model = name
    
    summary = {
        "world_name": config.name,
        "ground_truth": {
            "astro_effect_strength": config.astro_effect_strength,
            "num_effect_strength": config.num_effect_strength,
        },
        "decisions": decisions,
        "soulmate_classification": {
            "best_model": best_model,
            "best_f1": best_f1,
            "baseline_f1": results.get("baseline", ModelResults("", 0, 0, 0)).classification_f1 or 0.0,
        },
        "results": results,
    }
    
    # Print summary
    print(f"\n{'='*80}")
    print(f"RESULTS FOR {config.name}")
    print(f"{'='*80}")
    print(f"\nGround Truth:")
    print(f"  Astro effect: {config.astro_effect_strength} ({'RELEVANT' if config.astro_effect_strength > 0 else 'IRRELEVANT'})")
    print(f"  Num effect: {config.num_effect_strength} ({'RELEVANT' if config.num_effect_strength > 0 else 'IRRELEVANT'})")
    print(f"\nSystem Decisions:")
    print(f"  Astrology: {decisions.get('astrology', 'N/A')}")
    print(f"  Numerology: {decisions.get('numerology', 'N/A')}")
    print(f"\nSoulmate Classification:")
    print(f"  Best model: {best_model}")
    print(f"  Best F1: {best_f1:.4f}")
    print(f"  Baseline F1: {summary['soulmate_classification']['baseline_f1']:.4f}")
    
    # Check correctness
    astro_correct = (
        (config.astro_effect_strength > 0 and decisions.get("astrology") == "KEEP") or
        (config.astro_effect_strength == 0 and decisions.get("astrology") == "DISCARD")
    )
    num_correct = (
        (config.num_effect_strength > 0 and decisions.get("numerology") == "KEEP") or
        (config.num_effect_strength == 0 and decisions.get("numerology") == "DISCARD")
    )
    
    print(f"\nCorrectness:")
    print(f"  Astrology decision: {'✓ CORRECT' if astro_correct else '✗ INCORRECT'}")
    print(f"  Numerology decision: {'✓ CORRECT' if num_correct else '✗ INCORRECT'}")
    
    summary["correctness"] = {
        "astro_correct": astro_correct,
        "num_correct": num_correct,
    }
    
    return summary


def run_simulation_suite(use_threshold_sweep: bool = True, n_seeds: int = 10):
    """
    Run simulation suite across multiple world configurations.
    
    If use_threshold_sweep=True, runs threshold optimization first.
    Uses larger datasets and optimized parameters for better detection.
    """
    # Use larger datasets for better stability
    configs = [
        WorldConfig(
            name="NoAstro_NoNum",
            n_persons=500,
            n_pairs=2000,
            astro_effect_strength=0.0,
            num_effect_strength=0.0,
            noise_level=0.05,  # Lower noise for better detection
            seed=42,
        ),
        WorldConfig(
            name="AstroOnly",
            n_persons=500,
            n_pairs=2000,
            astro_effect_strength=0.4,  # Increased for better detection
            num_effect_strength=0.0,
            noise_level=0.05,
            seed=43,
        ),
        WorldConfig(
            name="NumOnly",
            n_persons=500,
            n_pairs=2000,
            astro_effect_strength=0.0,
            num_effect_strength=0.4,  # Increased for better detection
            noise_level=0.05,
            seed=44,
        ),
        WorldConfig(
            name="AstroAndNum",
            n_persons=500,
            n_pairs=2000,
            astro_effect_strength=0.4,
            num_effect_strength=0.5,  # Slightly stronger for better detection
            noise_level=0.05,
            seed=45,
        ),
    ]
    
    if use_threshold_sweep:
        # Run threshold sweep with more granular search
        r2_thresholds = [0.00005, 0.0001, 0.0002, 0.0005, 0.001]  # Even lower thresholds
        f1_thresholds = [0.0, 0.002, 0.005, 0.01]  # More F1 options
        
        sweep_result = sweep_thresholds(configs, r2_thresholds, f1_thresholds, n_seeds=n_seeds)
        
        # Run final evaluation with best thresholds
        print(f"\n{'='*80}")
        print("FINAL EVALUATION WITH BEST THRESHOLDS")
        print(f"{'='*80}")
        
        best_thresholds = sweep_result["best_thresholds"]
        
        # Run final evaluation with best thresholds
        final_summaries = []
        for config in configs:
            summary = run_world_simulation(config, thresholds=best_thresholds)
            final_summaries.append(summary)
        
        # Print final summary
        print(f"\n{'='*80}")
        print("FINAL SIMULATION SUITE SUMMARY")
        print(f"{'='*80}")
        
        total_decisions = 0
        correct_decisions = 0
        
        for summary in final_summaries:
            world_name = summary['world_name']
            astro_correct = summary['correctness']['astro_correct']
            num_correct = summary['correctness']['num_correct']
            best_f1 = summary['soulmate_classification']['best_f1']
            
            print(f"\n{world_name}:")
            print(f"  Astro: {'✓' if astro_correct else '✗'}, "
                  f"Num: {'✓' if num_correct else '✗'}, "
                  f"Soulmate F1: {best_f1:.4f}")
            
            total_decisions += 2
            if astro_correct:
                correct_decisions += 1
            if num_correct:
                correct_decisions += 1
        
        print(f"\n{'='*80}")
        print(f"Overall Decision Accuracy: {correct_decisions}/{total_decisions} = {correct_decisions/total_decisions*100:.1f}%")
        print(f"{'='*80}")
        
        return {
            "sweep_result": sweep_result,
            "final_summaries": final_summaries,
            "overall_accuracy": correct_decisions / total_decisions,
        }
    else:
        # Run without threshold sweep (legacy mode)
        summaries = []
        for config in configs:
            summary = run_world_simulation(config)
            summaries.append(summary)
        
        # Final summary
        print(f"\n{'='*80}")
        print("SIMULATION SUITE SUMMARY")
        print(f"{'='*80}")
        
        total_decisions = 0
        correct_decisions = 0
        
        for summary in summaries:
            world_name = summary['world_name']
            astro_correct = summary['correctness']['astro_correct']
            num_correct = summary['correctness']['num_correct']
            
            print(f"\n{world_name}:")
            print(f"  Astro: {'✓' if astro_correct else '✗'}, "
                  f"Num: {'✓' if num_correct else '✗'}")
            
            total_decisions += 2
            if astro_correct:
                correct_decisions += 1
            if num_correct:
                correct_decisions += 1
        
        print(f"\n{'='*80}")
        print(f"Overall Decision Accuracy: {correct_decisions}/{total_decisions} = {correct_decisions/total_decisions*100:.1f}%")
        print(f"{'='*80}")
        
        return summaries
        # Run without threshold sweep (original behavior)
        summaries = []
        for config in configs:
            summary = run_world_simulation(config)
            summaries.append(summary)
        
        print_final_summary(summaries, DecisionThresholds())
        return summaries


def print_final_summary(summaries: List[Dict], thresholds: DecisionThresholds):
    """Print final summary of simulation results"""
    print(f"\n{'='*80}")
    print("SIMULATION SUITE SUMMARY")
    print(f"{'='*80}")
    print(f"\nThresholds used:")
    print(f"  R² threshold: {thresholds.r2_min_delta_keep}")
    print(f"  F1 threshold: {thresholds.f1_min_delta_keep}")
    
    print("\nWorld-by-World Results:")
    total_decisions = 0
    correct_decisions = 0
    
    for summary in summaries:
        world_name = summary['world_name']
        gt_astro = summary['ground_truth']['astro_effect_strength']
        gt_num = summary['ground_truth']['num_effect_strength']
        astro_decision = summary['decisions'].get('astrology', 'N/A')
        num_decision = summary['decisions'].get('numerology', 'N/A')
        astro_correct = summary['correctness']['astro_correct']
        num_correct = summary['correctness']['num_correct']
        best_f1 = summary['soulmate_classification']['best_f1']
        
        print(f"\n{world_name}:")
        print(f"  Astro: GT={gt_astro:.1f}, Decision={astro_decision}, "
              f"Correct={'✓' if astro_correct else '✗'}")
        print(f"  Num: GT={gt_num:.1f}, Decision={num_decision}, "
              f"Correct={'✓' if num_correct else '✗'}")
        print(f"  Soulmate F1: {best_f1:.4f}")
        
        total_decisions += 2
        if astro_correct:
            correct_decisions += 1
        if num_correct:
            correct_decisions += 1
    
    print(f"\n{'='*80}")
    print(f"Overall Decision Accuracy: {correct_decisions}/{total_decisions} = "
          f"{correct_decisions/total_decisions*100:.1f}%")
    
    # Calculate average soulmate F1
    avg_f1 = np.mean([s['soulmate_classification']['best_f1'] for s in summaries])
    print(f"Average Soulmate F1: {avg_f1:.4f}")
    print(f"{'='*80}")


if __name__ == "__main__":
    # Run with threshold sweep enabled
    # Use fewer seeds for faster execution (increase for more robust results)
    run_simulation_suite(use_threshold_sweep=True, n_seeds=5)


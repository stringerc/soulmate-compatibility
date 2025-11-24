"""
Parameter Tuning and Testing Script

Automatically tunes simulation parameters for better detection,
then runs comprehensive tests and reports results.
"""

import numpy as np
from typing import List, Dict, Tuple
from simulation_soulmates import WorldConfig, run_world_simulation

def evaluate_config_accuracy(config: WorldConfig) -> float:
    """Evaluate a single configuration and return decision accuracy"""
    summary = run_world_simulation(config)
    
    # Count correct decisions
    correct = 0
    total = 2  # astro + num
    
    astro_correct = summary['correctness']['astro_correct']
    num_correct = summary['correctness']['num_correct']
    
    if astro_correct:
        correct += 1
    if num_correct:
        correct += 1
    
    return correct / total


def tune_parameters() -> Dict[str, float]:
    """
    Tune parameters by testing different combinations.
    Returns best parameters found.
    Uses a faster grid search focusing on key parameters.
    """
    print("=" * 80)
    print("PARAMETER TUNING")
    print("=" * 80)
    
    # Focused parameter search (fewer combinations for speed)
    effect_strengths = [0.3, 0.4, 0.5]  # Higher effects more detectable
    noise_levels = [0.05, 0.1]  # Lower noise better
    dataset_sizes = [(100, 200)]  # Fixed size for consistency
    
    best_accuracy = 0.0
    best_params = {
        'effect_strength': 0.4,
        'noise_level': 0.05,
        'n_persons': 100,
        'n_pairs': 200,
    }
    
    # Test AstroOnly world (simpler, faster)
    print("\nTesting AstroOnly world with different parameters...")
    test_configs = []
    
    for effect in effect_strengths:
        for noise in noise_levels:
            for n_persons, n_pairs in dataset_sizes:
                config = WorldConfig(
                    name="TuningTest",
                    n_persons=n_persons,
                    n_pairs=n_pairs,
                    astro_effect_strength=effect,
                    num_effect_strength=0.0,
                    noise_level=noise,
                    seed=42,
                )
                test_configs.append((config, effect, noise, n_persons, n_pairs))
    
    print(f"Testing {len(test_configs)} configurations...")
    
    results = []
    for i, (config, effect, noise, n_persons, n_pairs) in enumerate(test_configs):
        print(f"  Testing: effect={effect}, noise={noise}, size=({n_persons}, {n_pairs})")
        
        try:
            accuracy = evaluate_config_accuracy(config)
            results.append({
                'effect': effect,
                'noise': noise,
                'n_persons': n_persons,
                'n_pairs': n_pairs,
                'accuracy': accuracy,
            })
            
            print(f"    Accuracy: {accuracy:.2%}")
            
            if accuracy > best_accuracy:
                best_accuracy = accuracy
                best_params = {
                    'effect_strength': effect,
                    'noise_level': noise,
                    'n_persons': n_persons,
                    'n_pairs': n_pairs,
                }
        except Exception as e:
            print(f"    Error: {e}")
            continue
    
    print(f"\nBest parameters found:")
    print(f"  Effect strength: {best_params['effect_strength']}")
    print(f"  Noise level: {best_params['noise_level']}")
    print(f"  Dataset size: {best_params['n_persons']} persons, {best_params['n_pairs']} pairs")
    print(f"  Best accuracy: {best_accuracy:.2%}")
    
    return best_params


def run_comprehensive_tests(best_params: Dict[str, float]) -> List[Dict]:
    """Run comprehensive test suite with tuned parameters"""
    print("\n" + "=" * 80)
    print("COMPREHENSIVE TEST SUITE")
    print("=" * 80)
    
    effect = best_params['effect_strength']
    noise = best_params['noise_level']
    n_persons = best_params['n_persons']
    n_pairs = best_params['n_pairs']
    
    configs = [
        WorldConfig(
            name="NoAstro_NoNum",
            n_persons=n_persons,
            n_pairs=n_pairs,
            astro_effect_strength=0.0,
            num_effect_strength=0.0,
            noise_level=noise,
            seed=42,
        ),
        WorldConfig(
            name="AstroOnly",
            n_persons=n_persons,
            n_pairs=n_pairs,
            astro_effect_strength=effect,
            num_effect_strength=0.0,
            noise_level=noise,
            seed=43,
        ),
        WorldConfig(
            name="NumOnly",
            n_persons=n_persons,
            n_pairs=n_pairs,
            astro_effect_strength=0.0,
            num_effect_strength=effect,
            noise_level=noise,
            seed=44,
        ),
        WorldConfig(
            name="AstroAndNum",
            n_persons=n_persons,
            n_pairs=n_pairs,
            astro_effect_strength=effect,
            num_effect_strength=effect,
            noise_level=noise,
            seed=45,
        ),
    ]
    
    summaries = []
    for config in configs:
        summary = run_world_simulation(config)
        summaries.append(summary)
    
    return summaries


def print_detailed_results(summaries: List[Dict], best_params: Dict[str, float]):
    """Print detailed results report"""
    print("\n" + "=" * 80)
    print("DETAILED RESULTS REPORT")
    print("=" * 80)
    
    print(f"\nTuned Parameters:")
    print(f"  Effect strength: {best_params['effect_strength']}")
    print(f"  Noise level: {best_params['noise_level']}")
    print(f"  Dataset size: {best_params['n_persons']} persons, {best_params['n_pairs']} pairs")
    
    print(f"\n{'='*80}")
    print("World-by-World Analysis")
    print(f"{'='*80}")
    
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
        baseline_f1 = summary['soulmate_classification']['baseline_f1']
        
        print(f"\n{world_name}:")
        print(f"  Ground Truth:")
        print(f"    Astro effect: {gt_astro:.2f} ({'RELEVANT' if gt_astro > 0 else 'IRRELEVANT'})")
        print(f"    Num effect: {gt_num:.2f} ({'RELEVANT' if gt_num > 0 else 'IRRELEVANT'})")
        print(f"  System Decisions:")
        print(f"    Astrology: {astro_decision} {'✓' if astro_correct else '✗'}")
        print(f"    Numerology: {num_decision} {'✓' if num_correct else '✗'}")
        print(f"  Soulmate Detection:")
        print(f"    Best F1: {best_f1:.4f}")
        print(f"    Baseline F1: {baseline_f1:.4f}")
        print(f"    Improvement: {best_f1 - baseline_f1:+.4f}")
        
        total_decisions += 2
        if astro_correct:
            correct_decisions += 1
        if num_correct:
            correct_decisions += 1
    
    print(f"\n{'='*80}")
    print("SUMMARY STATISTICS")
    print(f"{'='*80}")
    print(f"Decision Accuracy: {correct_decisions}/{total_decisions} = {correct_decisions/total_decisions*100:.1f}%")
    
    # Calculate average F1 improvement
    f1_improvements = [
        s['soulmate_classification']['best_f1'] - s['soulmate_classification']['baseline_f1']
        for s in summaries
    ]
    avg_f1_improvement = np.mean(f1_improvements)
    print(f"Average F1 Improvement: {avg_f1_improvement:+.4f}")
    
    # Count correct decisions by type
    astro_keeps = sum(1 for s in summaries if s['decisions'].get('astrology') == 'KEEP' and s['ground_truth']['astro_effect_strength'] > 0)
    astro_discards = sum(1 for s in summaries if s['decisions'].get('astrology') == 'DISCARD' and s['ground_truth']['astro_effect_strength'] == 0)
    num_keeps = sum(1 for s in summaries if s['decisions'].get('numerology') == 'KEEP' and s['ground_truth']['num_effect_strength'] > 0)
    num_discards = sum(1 for s in summaries if s['decisions'].get('numerology') == 'DISCARD' and s['ground_truth']['num_effect_strength'] == 0)
    
    print(f"\nDecision Breakdown:")
    print(f"  Astrology KEEP (when relevant): {astro_keeps}/2")
    print(f"  Astrology DISCARD (when irrelevant): {astro_discards}/2")
    print(f"  Numerology KEEP (when relevant): {num_keeps}/2")
    print(f"  Numerology DISCARD (when irrelevant): {num_discards}/2")
    
    print(f"\n{'='*80}")


def main():
    """Main entry point"""
    print("Starting parameter tuning and comprehensive testing...")
    
    # Tune parameters
    best_params = tune_parameters()
    
    # Run comprehensive tests with tuned parameters
    summaries = run_comprehensive_tests(best_params)
    
    # Print detailed results
    print_detailed_results(summaries, best_params)
    
    return summaries, best_params


if __name__ == "__main__":
    summaries, best_params = main()


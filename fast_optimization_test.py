"""
Fast optimization test with reduced parameters for quick verification
"""
from simulation_soulmates import (
    WorldConfig, DecisionThresholds, sweep_thresholds, run_world_simulation
)

print("="*80)
print("FAST OPTIMIZATION TEST")
print("="*80)

# Smaller datasets for speed, but still larger than original
worlds = [
    WorldConfig(
        name="NoAstro_NoNum",
        n_persons=200,  # Reduced from 500 for speed
        n_pairs=800,    # Reduced from 2000
        astro_effect_strength=0.0,
        num_effect_strength=0.0,
        noise_level=0.05,
        seed=42,
    ),
    WorldConfig(
        name="AstroOnly",
        n_persons=200,
        n_pairs=800,
        astro_effect_strength=0.4,
        num_effect_strength=0.0,
        noise_level=0.05,
        seed=43,
    ),
    WorldConfig(
        name="NumOnly",
        n_persons=200,
        n_pairs=800,
        astro_effect_strength=0.0,
        num_effect_strength=0.4,
        noise_level=0.05,
        seed=44,
    ),
    WorldConfig(
        name="AstroAndNum",
        n_persons=200,
        n_pairs=800,
        astro_effect_strength=0.4,
        num_effect_strength=0.5,
        noise_level=0.05,
        seed=45,
    ),
]

# Smaller threshold grid for speed
r2_thresholds = [0.0001, 0.0005, 0.001]
f1_thresholds = [0.0, 0.005]

print(f"\nRunning threshold sweep...")
print(f"  Worlds: {len(worlds)}")
print(f"  R² thresholds: {r2_thresholds}")
print(f"  F1 thresholds: {f1_thresholds}")
print(f"  Seeds per world: 3 (reduced for speed)")

sweep_result = sweep_thresholds(worlds, r2_thresholds, f1_thresholds, n_seeds=3)

print(f"\n{'='*80}")
print("OPTIMIZATION RESULTS")
print(f"{'='*80}")
print(f"\nBest Thresholds:")
print(f"  R² threshold: {sweep_result['best_thresholds'].r2_min_delta_keep}")
print(f"  F1 threshold: {sweep_result['best_thresholds'].f1_min_delta_keep}")
print(f"\nBest Overall Accuracy: {sweep_result['best_accuracy']:.2%}")

print(f"\nPer-World Accuracy:")
for result in sweep_result['best_results']:
    print(f"  {result['world']:15s}: {result['accuracy']:6.2%} "
          f"(astro={result['astro_effect']:.1f}, num={result['num_effect']:.1f}, "
          f"F1={result['avg_soulmate_f1']:.3f})")

# Run final evaluation with best thresholds
print(f"\n{'='*80}")
print("FINAL EVALUATION WITH BEST THRESHOLDS")
print(f"{'='*80}")

best_thresholds = sweep_result['best_thresholds']
final_summaries = []

for world in worlds:
    print(f"\nEvaluating {world.name}...")
    summary = run_world_simulation(world, thresholds=best_thresholds)
    final_summaries.append(summary)

# Final summary
print(f"\n{'='*80}")
print("FINAL SUMMARY")
print(f"{'='*80}")

total_decisions = 0
correct_decisions = 0
f1_scores = []

for summary in final_summaries:
    world_name = summary['world_name']
    astro_correct = summary['correctness']['astro_correct']
    num_correct = summary['correctness']['num_correct']
    best_f1 = summary['soulmate_classification']['best_f1']
    
    print(f"\n{world_name}:")
    print(f"  Astro: {'✓ CORRECT' if astro_correct else '✗ INCORRECT'}")
    print(f"  Num: {'✓ CORRECT' if num_correct else '✗ INCORRECT'}")
    print(f"  Soulmate F1: {best_f1:.4f}")
    
    total_decisions += 2
    if astro_correct:
        correct_decisions += 1
    if num_correct:
        correct_decisions += 1
    
    f1_scores.append(best_f1)

print(f"\n{'='*80}")
print(f"Overall Decision Accuracy: {correct_decisions}/{total_decisions} = {correct_decisions/total_decisions*100:.1f}%")
print(f"Average Soulmate F1: {sum(f1_scores)/len(f1_scores):.4f}")
print(f"{'='*80}")

if correct_decisions == total_decisions:
    print("\n🎉 PERFECT SCORE! 100% accuracy achieved!")
else:
    print(f"\n⚠️  {total_decisions - correct_decisions} decision(s) incorrect")


"""
Quick test to verify the optimization pipeline works
"""
from simulation_soulmates import (
    WorldConfig, DecisionThresholds, 
    evaluate_world_once, sweep_thresholds
)

# Quick test with small dataset
test_config = WorldConfig(
    name="TestWorld",
    n_persons=100,
    n_pairs=200,
    astro_effect_strength=0.3,
    num_effect_strength=0.0,
    noise_level=0.05,
    seed=42,
)

thresholds = DecisionThresholds(r2_min_delta_keep=0.001, f1_min_delta_keep=0.0)

print("Testing single world evaluation...")
result = evaluate_world_once(test_config, thresholds, seed=42)
print(f"✓ World: {result.world_name}")
print(f"✓ Correct: {result.correct}")
print(f"✓ Decisions: {result.decisions}")
print(f"✓ Ground truth: {result.ground_truth}")
print(f"✓ Soulmate F1: {result.soulmate_f1:.4f}")

print("\n" + "="*80)
print("Quick threshold sweep test (2 thresholds × 2 worlds)...")
worlds = [
    WorldConfig(name="NoAstro", n_persons=100, n_pairs=200, 
                astro_effect_strength=0.0, num_effect_strength=0.0, noise_level=0.05, seed=42),
    WorldConfig(name="AstroOnly", n_persons=100, n_pairs=200,
                astro_effect_strength=0.3, num_effect_strength=0.0, noise_level=0.05, seed=43),
]

r2_thresholds = [0.0005, 0.001]
f1_thresholds = [0.0]

sweep_result = sweep_thresholds(worlds, r2_thresholds, f1_thresholds, n_seeds=3)
print(f"\n✓ Best accuracy: {sweep_result['best_accuracy']:.2%}")
print(f"✓ Best R² threshold: {sweep_result['best_thresholds'].r2_min_delta_keep}")
print("✓ Quick test completed successfully!")


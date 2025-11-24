"""
Debug script to investigate why numerology isn't being detected in AstroAndNum world
"""

from simulation_soulmates import WorldConfig, generate_world_dataset, add_soulmate_flag
from analysis import run_ablation_study, DecisionThresholds
import numpy as np

# Create AstroAndNum world
config = WorldConfig(
    name="AstroAndNum_Debug",
    n_persons=500,
    n_pairs=2000,
    astro_effect_strength=0.4,
    num_effect_strength=0.5,
    noise_level=0.05,
    seed=45,
)

print("Generating dataset...")
dataset = generate_world_dataset(config)
add_soulmate_flag(dataset, top_percent=0.1, use_s_true=True)

print("\nRunning ablation study...")
thresholds = DecisionThresholds(r2_min_delta_keep=0.0002, f1_min_delta_keep=0.01)
results = run_ablation_study(dataset, thresholds=thresholds, verbose=False)

print("\n" + "="*80)
print("DEBUG: Detailed Metrics")
print("="*80)

baseline = results["baseline"]
astro = results.get("astro", {})
num = results.get("num", {})

print(f"\nBaseline:")
print(f"  R²: {baseline['regression']['r2']:.6f}")
print(f"  F1: {baseline['classification']['f1']:.6f}")

if astro:
    print(f"\nAstrology:")
    print(f"  R²: {astro['regression']['r2']:.6f}")
    print(f"  ΔR²: {astro['regression']['delta_r2']:.6f}")
    print(f"  F1: {astro['classification']['f1']:.6f}")
    print(f"  ΔF1: {astro['classification']['delta_f1']:.6f}")
    print(f"  Decision: {astro.get('decision', 'N/A')}")

if num:
    print(f"\nNumerology:")
    print(f"  R²: {num['regression']['r2']:.6f}")
    print(f"  ΔR²: {num['regression']['delta_r2']:.6f}")
    print(f"  F1: {num['classification']['f1']:.6f}")
    print(f"  ΔF1: {num['classification']['delta_f1']:.6f}")
    print(f"  Decision: {num.get('decision', 'N/A')}")

# Check feature extraction
from analysis import FeatureExtractor
extractor = FeatureExtractor(dataset)

X_baseline, y_baseline, names_baseline = extractor.extract_baseline_features()
X_num, y_num, names_num = extractor.extract_with_numerology()

print(f"\nFeature counts:")
print(f"  Baseline: {len(names_baseline)} features")
print(f"  + Numerology: {len(names_num)} features")
print(f"  Added: {len(names_num) - len(names_baseline)} numerology features")

# Check if numerology features are actually different
if len(names_num) > len(names_baseline):
    new_features = [n for n in names_num if n not in names_baseline]
    print(f"\nNew numerology features: {new_features[:10]}...")  # Show first 10


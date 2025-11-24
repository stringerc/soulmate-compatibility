# Simulation Framework for Soulmate Detection

## Overview

The `simulation_soulmates.py` script tests whether the system can:
1. Identify "soulmate-tier" pairs (top 10% by S score)
2. Correctly keep/discard astrology and numerology features based on ground truth
3. Recover the true generative structure of compatibility

## How It Works

### World Configurations

Four simulation worlds test different scenarios:

1. **NoAstro_NoNum**: Neither astrology nor numerology matter (both effect strengths = 0.0)
2. **AstroOnly**: Only astrology matters (astro_effect_strength = 0.3, num = 0.0)
3. **NumOnly**: Only numerology matters (num_effect_strength = 0.3, astro = 0.0)
4. **AstroAndNum**: Both matter (both effect strengths = 0.3)

### Generative Model

For each world, pairs are generated with:

```
S_true = base_compatibility + astro_term + num_term + noise
```

Where:
- **base_compatibility**: From 32D V traits and 7D R resonance (always present)
- **astro_term**: Zodiac element compatibility, scaled by `astro_effect_strength`
- **num_term**: Life-path number compatibility, scaled by `num_effect_strength`
- **noise**: Gaussian noise with standard deviation `noise_level`

### Evaluation

For each world:
1. Generate synthetic dataset with ground-truth S_true
2. Label top 10% as "soulmates" (soulmate_flag = 1)
3. Run ablation study comparing:
   - Baseline (32D V + 7D R)
   - + Numerology features
   - + Astrology features
   - + Both
4. Check if system correctly:
   - KEEPs features when effect_strength > 0
   - DISCARDs features when effect_strength = 0
5. Measure soulmate classification performance (F1 score)

## Usage

```bash
python simulation_soulmates.py
```

## Output

The script prints:
- For each world:
  - Ground truth effect strengths
  - System decisions (KEEP/DISCARD)
  - Soulmate classification metrics
  - Correctness of decisions
- Overall summary:
  - Decision accuracy across all worlds
  - Best soulmate F1 scores

## Interpreting Results

### Expected Behavior

- **NoAstro_NoNum**: Should DISCARD both (✓ when correct)
- **AstroOnly**: Should KEEP astrology, DISCARD numerology
- **NumOnly**: Should DISCARD astrology, KEEP numerology
- **AstroAndNum**: Should KEEP both

### Current Limitations

The simulation may show:
- Low F1 scores for soulmate detection (imbalanced classes, small effect sizes)
- Incorrect KEEP/DISCARD decisions when effect strengths are small relative to noise
- Perfect R² scores (overfitting or too simple data)

### Improving Results

To improve detection:
1. Increase effect strengths (e.g., 0.5 instead of 0.3)
2. Reduce noise level (e.g., 0.05 instead of 0.1)
3. Increase dataset size (more persons/pairs)
4. Use better models (RandomForest, XGBoost instead of OLS)
5. Adjust threshold for KEEP/DISCARD (currently 1% R² improvement)

## Files Modified

### `data_schema.py`
- Added `S_true` field to Pair (ground-truth score)
- Added `soulmate_flag` field to Pair (binary label)

### `analysis.py`
- Added `add_soulmate_flag()` function
- Extended `ModelResults` with classification metrics
- Extended `ModelComparator.compare_models()` to support classification
- Added `get_decisions()` method to extract KEEP/DISCARD decisions

### `simulation_soulmates.py` (NEW)
- `WorldConfig` dataclass for world configurations
- `generate_world_dataset()` with explicit generative model
- `run_world_simulation()` for single world evaluation
- `run_simulation_suite()` for all four worlds

## Next Steps

1. **Tune parameters**: Adjust effect strengths, noise levels, thresholds
2. **Better models**: Replace OLS with scikit-learn models
3. **More worlds**: Test intermediate effect strengths, interaction effects
4. **Real data**: Apply to actual relationship datasets
5. **Visualization**: Plot decision boundaries, feature importance

## Example Output

```
SIMULATING WORLD: NoAstro_NoNum
Astro effect strength: 0.0
Num effect strength: 0.0
...
System Decisions:
  Astrology: DISCARD ✓
  Numerology: DISCARD ✓

SIMULATION SUITE SUMMARY
Overall Accuracy: 4/8 = 50.0%
```

The framework successfully tests whether the system can discover ground-truth structure and make correct KEEP/DISCARD decisions.


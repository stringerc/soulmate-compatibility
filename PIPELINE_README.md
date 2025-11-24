# Empirical Testing Pipeline

This document describes how to move from theory evaluation to empirical testing of astrology and numerology features.

## Overview

The pipeline consists of:

1. **Theory Evaluation** (`theory_evaluator.py`) - Operationalizes theories
2. **Data Schema** (`data_schema.py`) - Defines storage structure
3. **Analysis Pipeline** (`analysis.py`) - Runs ablation studies
4. **Data Generation** (`generate_sample_data.py`) - Creates synthetic datasets

## Quick Start

### 1. Generate Sample Data

```bash
python generate_sample_data.py
```

This creates `sample_data.json` with:
- 100 synthetic persons (with V, numerology, astrology features)
- 200 synthetic pairs (with R, Y, S scores)

### 2. Run Ablation Study

```python
from data_schema import Dataset
from analysis import run_ablation_study

# Load dataset
dataset = Dataset.from_json("sample_data.json")

# Run comparison
results = run_ablation_study(dataset)
```

This compares:
- **Baseline**: 32D V + 7D R only
- **+ Numerology**: Baseline + life-path features
- **+ Astrology**: Baseline + zodiac features  
- **+ All**: Baseline + numerology + astrology

### 3. Interpret Results

The pipeline automatically recommends:
- ✓ **KEEP** if R² improvement > 1% threshold
- ✗ **DISCARD** if no significant improvement

## Data Schema

### Person Structure

```python
Person(
    id: str,
    V: PersonVector32,  # 32D trait vector
    
    # Numerology (Experimental)
    life_path_number: int,  # 1-9
    life_path_autonomy_bias: float,
    life_path_novelty_bias: float,
    life_path_abstraction_bias: float,
    
    # Astrology (Experimental)
    zodiac_sign: str,
    zodiac_novelty_bias: float,
    zodiac_stability_bias: float,
    zodiac_abstraction_bias: float,
    zodiac_emotional_sensitivity: float,
)
```

### Pair Structure

```python
Pair(
    person_i_id: str,
    person_j_id: str,
    R: ResonanceVector7,  # 7D resonance
    Y: OutcomeVectorY,     # 6D outcomes
    S: float,              # Soulmate score
    feasibility: float,
)
```

## Feature Extraction

The `FeatureExtractor` class extracts features for ML training:

```python
from analysis import FeatureExtractor

extractor = FeatureExtractor(dataset)

# Baseline features (V + R only)
X_baseline, y, names = extractor.extract_baseline_features()

# With numerology
X_num, y, names = extractor.extract_with_numerology()

# With astrology
X_ast, y, names = extractor.extract_with_astrology()

# With all
X_all, y, names = extractor.extract_with_all()
```

Features include:
- **V_i, V_j**: 32D trait vectors (flattened)
- **R**: 7D resonance vector (flattened)
- **Y**: 6D outcome vector (flattened)
- **S**: Target variable (soulmate score)
- **Numerology**: life_path_number, biases, match indicators
- **Astrology**: zodiac_sign, biases, element compatibility

## Model Comparison

The `ModelComparator` trains linear regression models and compares:

```python
from analysis import ModelComparator

comparator = ModelComparator(extractor)
results = comparator.compare_models(test_size=0.2)

comparator.print_comparison(results)
```

Metrics computed:
- **R² Score**: Coefficient of determination
- **MSE**: Mean squared error
- **MAE**: Mean absolute error
- **Improvement**: Change vs baseline

## Custom Models

To use scikit-learn or other ML libraries:

```python
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from analysis import FeatureExtractor

extractor = FeatureExtractor(dataset)
X, y, feature_names = extractor.extract_with_all()

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)

# Evaluate
from sklearn.metrics import r2_score, mean_squared_error
y_pred = model.predict(X_test)
r2 = r2_score(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)

print(f"R²: {r2:.4f}, MSE: {mse:.4f}")
```

## Real Data Integration

To use real data:

1. **Load your dataset**:
   ```python
   dataset = Dataset()
   
   # Add persons
   for person_data in your_person_data:
       person = Person(
           id=person_data["id"],
           V=PersonVector32(traits=person_data["traits"]),
           birthdate=person_data.get("birthdate"),
           # ... add numerology/astrology features if available
       )
       dataset.add_person(person)
   
   # Add pairs
   for pair_data in your_pair_data:
       pair = Pair(
           person_i_id=pair_data["person_i"],
           person_j_id=pair_data["person_j"],
           R=ResonanceVector7(metrics=pair_data["resonance"]),
           Y=OutcomeVectorY(**pair_data["outcomes"]),
           S=pair_data["soulmate_score"],
       )
       dataset.add_pair(pair)
   
   # Save
   dataset.to_json("real_data.json")
   ```

2. **Run analysis**:
   ```python
   from analysis import run_ablation_study
   results = run_ablation_study(dataset)
   ```

## Next Steps

1. **Collect real data**: Survey couples, measure V/R/Y
2. **Derive features**: Compute numerology/astrology from birthdates
3. **Run ablation**: Compare models with/without theory features
4. **Make decision**: Keep or discard based on empirical results

## Notes

- The current `analysis.py` uses simple OLS regression
- For better results, use scikit-learn (RandomForest, XGBoost, etc.)
- Consider cross-validation instead of single train/test split
- Add feature importance analysis to understand which features matter
- Consider interaction terms (e.g., numerology × astrology)

## Files

- `data_schema.py`: Data structures (Person, Pair, Dataset)
- `analysis.py`: Feature extraction and model comparison
- `generate_sample_data.py`: Synthetic data generation
- `theory_evaluator.py`: Theory operationalization (already built)
- `base_model.py`: Core compatibility model (already built)


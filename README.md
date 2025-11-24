# Soulmate Compatibility Theory Evaluation Framework

A rigorous computational framework for evaluating theories about romantic compatibility ("soulmates") and determining whether they can be integrated into a measurable, falsifiable model.

## Overview

This system implements a theory audit and integration framework that:

1. **Operationalizes** theories into measurable variables
2. **Evaluates predictive value** through statistical testing strategies
3. **Classifies** theories as Core, Experimental, or Discarded
4. **Proposes model updates** based on validated theories

## Base Model Architecture

### Person Representation: 32-Dimensional Vector (V ∈ ℝ³²)

The model represents each person as a 32-dimensional vector across 7 categories:

- **Attachment & Regulation (5D)**: A₁-A₅
- **Conflict & Communication (5D)**: C₁-C₅
- **Cognitive & Decision Style (5D)**: T₁-T₅
- **Value Architecture (6D)**: V₁-V₆
- **Social & Interpersonal Style (5D)**: S₁-S₅
- **Sexual System (3D)**: X₁-X₃
- **Life Structure (3D)**: L₁-L₃

### Resonance System: 7-Dimensional Interaction Vector (R ∈ ℝ⁷)

- R₁: Conversational tempo synchrony
- R₂: Prosodic entrainment
- R₃: Semantic alignment
- R₄: Emotional state coupling
- R₅: Conflict trajectory resonance
- R₆: Physiological synchrony
- R₇: Behavioral alignment

### Compatibility Function

```
C(i,j) = γ₁ C_traits + γ₂ C_res
Ŝ(i,j) = F(i,j) · C(i,j)
```

Where:
- `C_traits` = exp(-D_traits) (trait distance compatibility)
- `C_res` = β₁ R_mean + β₂ R_stab (resonance compatibility)
- `F(i,j)` = feasibility constraint [0,1]

## Usage

### Interactive Mode

```bash
python main.py
```

### Evaluate from JSON

```bash
python main.py theory.json
```

### Run Example Evaluations

```bash
python theory_examples.py
```

### Programmatic Usage

```python
from base_model import CompatibilityModel, PersonVector, ResonanceVector
from theory_evaluator import TheoryEvaluator

# Initialize
base_model = CompatibilityModel()
evaluator = TheoryEvaluator(base_model)

# Evaluate a theory
evaluation = evaluator.evaluate_theory(
    theory_name="Attachment Theory",
    theory_description="...",
    proposed_variables=[
        {
            'name': 'Attachment Security',
            'description': '...',
            'measurement_method': 'ECR-R scale',
            'proposed_type': 'PERSON_TRAIT'
        }
    ]
)

# Get final architecture
architecture = evaluator.generate_final_model_architecture()
```

## Theory Evaluation Process

### 1. Operationalization

Each theory must be translated into measurable variables:
- **Person Traits**: Map to V dimensions or propose new ones
- **Resonance Metrics**: Map to R dimensions or propose new ones
- **Outcome Modifiers**: Modify Y interpretation
- **Feasibility Constraints**: Modify F function
- **Compatibility Weights**: Adjust C weights

### 2. Predictive Value Analysis

For each variable:
- Specify predictive signal
- Explain mechanism of action
- Propose test method (ablation, nested models, cross-validation)
- Define discard criteria

### 3. Theory Classification

Theories are classified as:
- **Core**: Measurable, predictive, integrate cleanly
- **Experimental**: Operationalizable but need empirical validation
- **Discarded**: Unmeasurable, unfalsifiable, or no predictive gain

### 4. Model Refinement

Based on validated theories:
- Update V dimensions
- Update R dimensions
- Modify Y interpretation
- Adjust F constraints
- Update C weights

## Example Theory Evaluations

The `theory_examples.py` module includes evaluations of:

- ✅ **Attachment Theory** (Core) - Highly operationalizable
- ✅ **Big Five Personality** (Experimental) - Operationalizable, may overlap
- ✅ **Physiological Synchrony** (Core) - Maps to R₆
- ⚠️ **Enneagram** (Experimental) - Partially operationalizable
- ❌ **Astrology** (Discarded) - Not falsifiable
- ❌ **Numerology** (Discarded) - Symbolic, not measurable

## Constraints

- **No mystical/spiritual reasoning**: Everything must reduce to measurable variables
- **Falsifiable only**: Theories must be testable to be considered
- **Brutally precise**: Weak or symbolic frameworks are discarded
- **Predictive value required**: Theories must improve prediction to be integrated

## File Structure

```
soul mate/
├── base_model.py          # Core model definitions (DO NOT ALTER)
├── theory_evaluator.py    # Theory evaluation framework
├── theory_examples.py     # Example theory evaluations
├── main.py                # CLI interface
└── README.md              # This file
```

## Output Format

Each evaluation produces:

1. **Operational Mapping**: Variables → model components
2. **Predictive Value & Testing Strategy**: Mechanism and test methods
3. **Theory Classification**: Core / Experimental / Discarded
4. **Model Updates**: Proposed changes to V, R, Y, F, C
5. **Recommendation**: Integrate, test, or discard

## Requirements

- Python 3.8+
- numpy
- dataclasses (built-in)
- enum (built-in)

## License

This framework is designed for rigorous scientific evaluation of compatibility theories. Use responsibly and maintain falsifiability standards.


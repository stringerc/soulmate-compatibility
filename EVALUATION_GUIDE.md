# Theory Evaluation Guide

## How to Use the Framework

### Step 1: Define Your Theory

When proposing a theory, you must provide:

1. **Theory Name**: Clear identifier
2. **Theory Description**: What the theory claims
3. **Proposed Variables**: List of measurable variables

For each variable, specify:
- **Name**: Variable identifier
- **Description**: What it represents
- **Measurement Method**: How to measure it (must be falsifiable)
- **Proposed Type**: PERSON_TRAIT, RESONANCE_METRIC, OUTCOME_MODIFIER, or FEASIBILITY_CONSTRAINT
- **Expected Mechanism**: How it improves prediction
- **Validation Criteria**: How to validate measurements

### Step 2: Evaluation Process

The framework automatically:

1. **Operationalizes** variables → maps to model components
2. **Analyzes predictive value** → determines mechanism and test methods
3. **Classifies** → Core / Experimental / Discarded
4. **Proposes updates** → suggests model modifications

### Step 3: Classification Criteria

#### Core Theories
- Variables are measurable and validated
- Show empirical predictive value
- Integrate cleanly into model
- **Action**: Integrate into base model

#### Experimental Theories
- Variables are operationalizable
- Measurement methods specified
- Need empirical validation
- **Action**: Test with data before integration

#### Discarded Theories
- Variables are unmeasurable
- Not falsifiable
- No clear predictive mechanism
- Symbolic/metaphysical without operationalization
- **Action**: Reject

## Example: Evaluating a New Theory

### Good Theory (Operationalizable)

```python
evaluation = evaluator.evaluate_theory(
    theory_name="Conflict Resolution Styles",
    theory_description="Different conflict resolution styles predict compatibility",
    proposed_variables=[
        {
            'name': 'Conflict Resolution Style',
            'description': 'Collaborative, competitive, accommodating, avoiding, compromising',
            'measurement_method': 'Thomas-Kilmann Conflict Mode Instrument (TKI), 30 items',
            'proposed_type': 'PERSON_TRAIT',
            'expected_mechanism': 'Maps to C1 (conflict style) and C2 (repair efficiency)',
            'validation_criteria': 'Test-retest reliability > 0.75, convergent validity'
        }
    ]
)
```

**Expected Result**: Experimental (needs validation) or Core (if validated)

### Bad Theory (Non-Operationalizable)

```python
evaluation = evaluator.evaluate_theory(
    theory_name="Cosmic Energy Alignment",
    theory_description="Cosmic energy vibrations determine compatibility",
    proposed_variables=[
        {
            'name': 'Cosmic Vibration Frequency',
            'description': 'Frequency of cosmic energy',
            'measurement_method': 'Meditation and intuition',  # Not falsifiable!
            'proposed_type': 'PERSON_TRAIT',
            'expected_mechanism': 'Unclear - no causal mechanism'
        }
    ]
)
```

**Expected Result**: Discarded (not falsifiable, no measurement method)

## Improving Classification

The current classification is conservative - it marks theories as Experimental if they have any measurement method, even if not falsifiable. To improve:

1. **Add falsifiability checks**: Verify measurement methods are testable
2. **Require causal mechanisms**: Theories must explain HOW they predict
3. **Empirical validation**: Use test data to move Experimental → Core
4. **Manual review**: Human judgment for edge cases

## Integration Workflow

1. **Propose Theory** → Get evaluation
2. **If Experimental**: Collect data, run tests
3. **If Validated**: Move to Core, integrate into model
4. **If Invalidated**: Move to Discarded
5. **Update Model**: Apply proposed updates from Core theories

## Model Updates

When a theory is classified as Core:

- **New V dimensions** → Add to PersonVector
- **New R dimensions** → Add to ResonanceVector  
- **Y modifications** → Update OutcomeVector interpretation
- **F modifications** → Update feasibility function
- **C modifications** → Adjust compatibility weights

## Best Practices

1. **Be specific**: Vague measurement methods → Discarded
2. **Cite sources**: Reference validated instruments
3. **Explain mechanisms**: How does it improve prediction?
4. **Define tests**: What statistical tests will validate it?
5. **Set thresholds**: When will you discard it?

## Common Pitfalls

❌ **Too vague**: "Personality traits" without measurement method  
❌ **Not falsifiable**: "Spiritual connection" without operationalization  
❌ **No mechanism**: "Birth date determines compatibility" without causal explanation  
❌ **Symbolic only**: Numerology, astrology without measurable variables  

✅ **Good**: "Attachment security measured by ECR-R scale, predicts relationship satisfaction via conflict resolution pathways"


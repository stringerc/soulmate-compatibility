# theory_examples.py
#
# Expected classifications:
#   • Attachment Theory → Experimental
#   • Big Five Personality → Experimental
#   • Physiological Synchrony → Experimental
#   • Enneagram → Experimental
#   • Astrology → Experimental (symbolic, needs validation)
#   • Numerology → Experimental (symbolic, needs validation)

from theory_evaluator import TheoryEvaluator

def run_examples():
    evaluator = TheoryEvaluator()

    examples = [
        {
            "name": "Attachment Theory",
            "description": "Classical attachment theory describing secure, anxious, avoidant, disorganized patterns.",
            "falsifiable": True,
            "type": "psychological",
        },
        {
            "name": "Big Five Personality",
            "description": "Five-factor model (OCEAN): Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism.",
            "falsifiable": True,
            "type": "personality",
        },
        {
            "name": "Physiological Synchrony",
            "description": "Heart-rate and skin-conductance coupling as predictors of co-regulation and bond strength.",
            "falsifiable": True,
            "type": "biophysiological",
        },
        {
            "name": "Enneagram",
            "description": "Nine-type personality model focusing on core fears and motivations.",
            "falsifiable": True,
            "type": "personality",
        },
        {
            "name": "Astrology",
            "description": "Zodiac-based personality and compatibility system based on birth date and planetary positions.",
            "falsifiable": False,
            "type": "symbolic",
        },
        {
            "name": "Numerology",
            "description": "Derivative of names and birthdates into numbers, used to infer traits and compatibility.",
            "falsifiable": False,
            "type": "symbolic",
        },
    ]

    for ex in examples:
        result = evaluator.evaluate(ex)
        print("=" * 80)
        print(f"Theory: {result.name}")
        print(f"Classification: {result.classification}")
        print("\nOperationalization:")
        print(f"  is_operational: {result.operationalization.is_operational}")
        print(f"  notes: {result.operationalization.notes}")
        for v in result.operationalization.variables:
            print(f"    - {v.name} -> maps_to={v.maps_to}, target={v.target_component}")

        print("\nPredictive Assessment:")
        print(f"  expected_signal: {result.predictive_assessment.expected_signal}")
        print(f"  test_methods:")
        for m in result.predictive_assessment.test_methods:
            print(f"    - {m}")
        print(f"  discard_criteria: {result.predictive_assessment.discard_criteria}")

        print("\nModel Update Suggestions:")
        for comp, updates in result.model_update_suggestions.items():
            if isinstance(updates, list):
                print(f"  {comp}:")
                for u in updates:
                    print(f"    - {u}")
            else:
                print(f"  {comp}: {updates}")
        print()

if __name__ == "__main__":
    run_examples()

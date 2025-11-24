# main.py

import json
import sys
from typing import Dict, Any
from theory_evaluator import TheoryEvaluator

def load_theory_from_json(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def print_evaluation(result):
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
    print("=" * 80)

def interactive_mode():
    print("Romantic Compatibility Theory Evaluator (interactive mode)")
    print("Press Ctrl+C or enter empty name to exit.\n")

    evaluator = TheoryEvaluator()

    while True:
        try:
            name = input("Theory name: ").strip()
            if not name:
                print("Exiting.")
                break

            description = input("Short description: ").strip()
            fals_str = input("Is this theory falsifiable? [y/n/?]: ").strip().lower()
            if fals_str.startswith("y"):
                falsifiable = True
            elif fals_str.startswith("n"):
                falsifiable = False
            else:
                falsifiable = None

            type_hint = input("Theory type (e.g., psychological, symbolic, etc.): ").strip()

            theory = {
                "name": name,
                "description": description,
                "falsifiable": falsifiable,
                "type": type_hint,
            }

            result = evaluator.evaluate(theory)
            print_evaluation(result)

        except KeyboardInterrupt:
            print("\nExiting.")
            break

def main():
    args = sys.argv[1:]
    evaluator = TheoryEvaluator()

    if not args:
        # Interactive mode
        interactive_mode()
    else:
        # JSON input mode
        path = args[0]
        try:
            theory = load_theory_from_json(path)
        except Exception as e:
            print(f"Error loading JSON from {path}: {e}")
            sys.exit(1)

        result = evaluator.evaluate(theory)
        print_evaluation(result)

if __name__ == "__main__":
    main()

"""
Generate Sample Dataset for Testing

Creates a synthetic dataset with:
  - Persons with 32D V vectors
  - Optional numerology/astrology features
  - Pairs with R, Y, and computed S scores
"""

import random
import json
from datetime import datetime
from typing import List

from data_schema import Dataset, Person, Pair
from base_model import (
    PersonVector32, ResonanceVector7, OutcomeVectorY,
    CompatibilityModel
)

# Zodiac signs
ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]


def compute_life_path_number(birthdate: str) -> int:
    """
    Simple numerology: sum digits of birthdate, reduce to 1-9.
    
    Example: 1990-05-15 -> 1+9+9+0+0+5+1+5 = 30 -> 3+0 = 3
    """
    digits = "".join(birthdate.split("-"))
    total = sum(int(d) for d in digits)
    
    while total > 9:
        total = sum(int(d) for d in str(total))
    
    return total


def get_zodiac_sign(birthdate: str) -> str:
    """
    Simple zodiac sign from birthdate (ignoring year, just month-day).
    This is simplified - real astrology uses exact dates.
    """
    month, day = map(int, birthdate.split("-")[1:])
    
    # Simplified zodiac mapping (approximate)
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "Aries"
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "Taurus"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "Gemini"
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "Cancer"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "Leo"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "Virgo"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "Libra"
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "Scorpio"
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "Sagittarius"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "Capricorn"
    else:
        return "Aquarius"


def generate_person(
    person_id: str,
    include_numerology: bool = True,
    include_astrology: bool = True,
) -> Person:
    """Generate a synthetic person"""
    # Random birthdate
    year = random.randint(1980, 2000)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    birthdate = f"{year}-{month:02d}-{day:02d}"
    
    # 32D trait vector (random normalized values)
    V = PersonVector32(traits=[random.random() for _ in range(32)])
    
    person = Person(
        id=person_id,
        V=V,
        birthdate=birthdate,
        name=f"Person_{person_id}",
        created_at=datetime.now(),
    )
    
    # Add numerology features
    if include_numerology:
        life_path = compute_life_path_number(birthdate)
        person.life_path_number = life_path
        # Hypothesized biases (random for now, but could be based on life_path)
        person.life_path_autonomy_bias = random.random() * 0.3 + (life_path / 9.0) * 0.2
        person.life_path_novelty_bias = random.random() * 0.3 + ((life_path % 3) / 3.0) * 0.2
        person.life_path_abstraction_bias = random.random() * 0.3 + ((life_path // 3) / 3.0) * 0.2
    
    # Add astrology features
    if include_astrology:
        zodiac = get_zodiac_sign(birthdate)
        person.zodiac_sign = zodiac
        # Hypothesized biases (random for now)
        person.zodiac_novelty_bias = random.random() * 0.3
        person.zodiac_stability_bias = random.random() * 0.3
        person.zodiac_abstraction_bias = random.random() * 0.3
        person.zodiac_emotional_sensitivity = random.random() * 0.3
    
    return person


def generate_pair(
    person_i: Person,
    person_j: Person,
    model: CompatibilityModel,
) -> Pair:
    """Generate a synthetic pair with R, Y, and computed S"""
    # Random 7D resonance vector
    R = ResonanceVector7(metrics=[random.random() for _ in range(7)])
    
    # Compute compatibility
    compat_result = model.total_compatibility(
        person_i.V,
        person_j.V,
        R,
        feasibility=random.uniform(0.7, 1.0),
    )
    
    # Generate outcome vector Y (correlated with compatibility)
    base_satisfaction = compat_result["C_total"]
    Y = OutcomeVectorY(
        y1_longevity=random.uniform(0.5, 1.0) * base_satisfaction,
        y2_satisfaction=random.uniform(0.5, 1.0) * base_satisfaction,
        y3_growth=random.uniform(0.5, 1.0) * base_satisfaction,
        y4_conflict_toxicity=random.uniform(0.0, 0.5) * (1 - base_satisfaction),
        y5_repair_efficiency=random.uniform(0.5, 1.0) * base_satisfaction,
        y6_trajectory_alignment=random.uniform(0.5, 1.0) * base_satisfaction,
    )
    
    # Compute soulmate score
    S = model.soulmate_score(Y)
    
    return Pair(
        person_i_id=person_i.id,
        person_j_id=person_j.id,
        R=R,
        Y=Y,
        S=S,
        feasibility=compat_result["feasibility"],
        created_at=datetime.now(),
    )


def generate_sample_dataset(
    n_persons: int = 100,
    n_pairs: int = 200,
    include_numerology: bool = True,
    include_astrology: bool = True,
    seed: int = 42,
) -> Dataset:
    """Generate a complete synthetic dataset"""
    random.seed(seed)
    
    dataset = Dataset()
    model = CompatibilityModel()
    
    # Generate persons
    persons: List[Person] = []
    for i in range(n_persons):
        person = generate_person(
            f"person_{i}",
            include_numerology=include_numerology,
            include_astrology=include_astrology,
        )
        persons.append(person)
        dataset.add_person(person)
    
    # Generate pairs
    for _ in range(n_pairs):
        person_i = random.choice(persons)
        person_j = random.choice(persons)
        
        if person_i.id == person_j.id:
            continue  # Skip self-pairs
        
        pair = generate_pair(person_i, person_j, model)
        dataset.add_pair(pair)
    
    return dataset


if __name__ == "__main__":
    print("Generating sample dataset...")
    dataset = generate_sample_dataset(
        n_persons=100,
        n_pairs=200,
        include_numerology=True,
        include_astrology=True,
    )
    
    output_file = "sample_data.json"
    dataset.to_json(output_file)
    print(f"✓ Generated {len(dataset.persons)} persons and {len(dataset.pairs)} pairs")
    print(f"✓ Saved to {output_file}")
    
    # Quick test of analysis pipeline
    print("\nRunning quick ablation study...")
    from analysis import run_ablation_study
    results = run_ablation_study(dataset, test_size=0.2)
    print("\n✓ Analysis complete!")


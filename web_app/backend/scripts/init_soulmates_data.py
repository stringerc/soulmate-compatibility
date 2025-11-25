"""
Initialize Soulmates Data
Creates default plans and seed data for development
"""

import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal
from database.soulmates_models import SoulmatesPlan, SoulmatesPlanTier

def init_soulmates_data():
    """Create default soulmates plans"""
    db = SessionLocal()
    
    try:
        # Check if plans already exist
        existing = db.query(SoulmatesPlan).first()
        if existing:
            print("✅ Soulmates plans already exist, skipping initialization")
            return
        
        # Create default plans
        plans = [
            SoulmatesPlan(
                slug="free",
                tier=SoulmatesPlanTier.FREE,
                name="Free",
                description="Basic features for self-discovery",
                is_active=True,
                max_comp_explorer_runs_per_month=5,
                max_active_bonds=0,
                includes_resonance_lab=False,
            ),
            SoulmatesPlan(
                slug="plus",
                tier=SoulmatesPlanTier.PLUS,
                name="Plus",
                description="Unlimited compatibility exploration",
                is_active=True,
                max_comp_explorer_runs_per_month=None,  # Unlimited
                max_active_bonds=1,
                includes_resonance_lab=False,
            ),
            SoulmatesPlan(
                slug="couple-premium",
                tier=SoulmatesPlanTier.COUPLE_PREMIUM,
                name="Couple Premium",
                description="Full couple features with Resonance Lab",
                is_active=True,
                max_comp_explorer_runs_per_month=None,  # Unlimited
                max_active_bonds=None,  # Unlimited
                includes_resonance_lab=True,
            ),
        ]
        
        for plan in plans:
            db.add(plan)
        
        db.commit()
        print("✅ Default soulmates plans created successfully")
        
    except Exception as e:
        print(f"❌ Error initializing soulmates data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_soulmates_data()


"""
Database Migration Script for Soulmates Models
Creates all soulmates-related tables
"""

import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import engine, init_db
from database.soulmates_models import Base

def migrate_soulmates():
    """Create all soulmates tables"""
    print("Creating soulmates tables...")
    
    try:
        # Create all tables defined in soulmates_models
        Base.metadata.create_all(bind=engine)
        print("✅ Soulmates tables created successfully")
        
        # Also initialize base tables if needed
        init_db()
        
    except Exception as e:
        print(f"⚠️  Warning: Could not create tables: {e}")
        print("💡 This is OK if you don't have PostgreSQL running yet.")
        print("   The app will still start, but database features won't work.")
        print("   To set up the database:")
        print("   1. Install PostgreSQL")
        print("   2. Create a database: createdb soulmate_db")
        print("   3. Set DATABASE_URL in .env")
        print("   4. Run this script again")
        # Don't exit - allow app to start without DB

if __name__ == "__main__":
    migrate_soulmates()


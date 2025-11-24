#!/usr/bin/env python3
"""
Database initialization script for Render deployment
Run this once after the database is created to set up the schema
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.connection import init_db, engine
from database.models import Base

def main():
    """Initialize the database schema"""
    print("Initializing database schema...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Schema initialized successfully!")
        print(f"Database URL: {os.getenv('DATABASE_URL', 'Not set')[:50]}...")
        return 0
    except Exception as e:
        print(f"Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())

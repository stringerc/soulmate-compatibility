#!/usr/bin/env python3
"""
Database initialization script
Creates all tables from schema.sql
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.connection import engine, init_db
from database.models import Base

def main():
    """Initialize database"""
    print("Initializing database...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        # Run any additional initialization
        print("✅ Database initialization complete")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()


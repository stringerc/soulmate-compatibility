"""
Database connection and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
import os
from typing import Generator

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/soulmate_b2b"
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # Use NullPool for serverless environments
    echo=False,  # Set to True for SQL debugging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get database session
    Usage: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    try:
        from database.models import Base
        # Only create tables if DATABASE_URL is set
        if DATABASE_URL and "postgresql" in DATABASE_URL.lower():
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables created successfully")
        else:
            print("⚠️  DATABASE_URL not set or invalid, skipping table creation")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")
        # Don't fail startup if database isn't available


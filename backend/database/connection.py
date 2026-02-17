"""
Database connection and session management
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use SQLite for local development, PostgreSQL for production
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./digital_twin.db"
)

# Handle SQLite's check_same_thread limitation
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables"""
    from models import Patient, Scan, Segmentation, Mesh, Simulation, SimulationResult
    Base.metadata.create_all(bind=engine)

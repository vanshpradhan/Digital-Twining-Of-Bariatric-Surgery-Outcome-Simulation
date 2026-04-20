"""
Database seed script
Populate the database with sample data for development
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal, create_tables
from models import Patient, Scan, Simulation
from datetime import datetime, date
import uuid


def seed_database():
    """Seed the database with sample data"""
    create_tables()
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Patient).count() > 0:
            print("Database already seeded. Skipping...")
            return
        
        # Create sample patients
        patients = [
            Patient(
                id=uuid.uuid4(),
                name="John Smith",
                date_of_birth=date(1979, 5, 15),
                medical_record_number="P-2024-001",
                gender="Male",
                weight_kg="105",
                height_cm="175",
                bmi="34.3",
                notes="Scheduled for sleeve gastrectomy"
            ),
            Patient(
                id=uuid.uuid4(),
                name="Sarah Johnson",
                date_of_birth=date(1972, 8, 22),
                medical_record_number="P-2024-002",
                gender="Female",
                weight_kg="92",
                height_cm="162",
                bmi="35.1",
                notes="Post-operative follow-up"
            ),
            Patient(
                id=uuid.uuid4(),
                name="Michael Brown",
                date_of_birth=date(1985, 12, 3),
                medical_record_number="P-2024-003",
                gender="Male",
                weight_kg="125",
                height_cm="180",
                bmi="38.6",
                notes="Initial consultation"
            ),
        ]
        
        for patient in patients:
            db.add(patient)
        
        db.commit()
        print(f"Successfully seeded {len(patients)} patients")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == '__main__':
    seed_database()

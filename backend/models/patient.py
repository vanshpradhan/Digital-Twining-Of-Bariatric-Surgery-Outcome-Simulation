"""
Patient database model
"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Date, DateTime, Text
from sqlalchemy.orm import relationship
from database.connection import Base


class Patient(Base):
    """Patient model for storing patient information"""
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    medical_record_number = Column(String(100), unique=True, nullable=True)
    gender = Column(String(20), nullable=True)
    weight_kg = Column(String(20), nullable=True)
    height_cm = Column(String(20), nullable=True)
    bmi = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    scans = relationship("Scan", back_populates="patient", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="patient", cascade="all, delete-orphan")

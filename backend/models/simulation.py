"""
Simulation database models
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from database.connection import Base


class Simulation(Base):
    """Simulation model for tracking simulation runs"""
    __tablename__ = "simulations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=True)
    name = Column(String(255), nullable=True)
    status = Column(String(50), default="pending")
    simulation_type = Column(String(100), nullable=True)
    parameters = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="simulations")
    result = relationship("SimulationResult", back_populates="simulation", uselist=False, cascade="all, delete-orphan")


class SimulationResult(Base):
    """SimulationResult model for storing FEM analysis results"""
    __tablename__ = "simulation_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    simulation_id = Column(String(36), ForeignKey("simulations.id"), nullable=False)
    max_von_mises_stress = Column(Float, nullable=True)
    max_principal_strain = Column(Float, nullable=True)
    stress_distribution = Column(JSON, nullable=True)
    strain_distribution = Column(JSON, nullable=True)
    failure_zones = Column(JSON, nullable=True)
    leak_probability = Column(Float, nullable=True)
    recommended_stapler = Column(String(100), nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    simulation = relationship("Simulation", back_populates="result")

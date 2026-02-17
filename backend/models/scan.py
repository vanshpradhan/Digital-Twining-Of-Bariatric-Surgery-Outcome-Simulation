"""
Scan and Segmentation database models
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from database.connection import Base


class Scan(Base):
    """Scan model for storing CT/MRI scan information"""
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=True)
    modality = Column(String(50), nullable=True)
    scan_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="uploaded")
    metadata_json = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="scans")
    segmentation = relationship("Segmentation", back_populates="scan", uselist=False, cascade="all, delete-orphan")


class Segmentation(Base):
    """Segmentation model for storing segmentation results"""
    __tablename__ = "segmentations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False)
    mask_path = Column(String(500), nullable=True)
    mesh_path = Column(String(500), nullable=True)
    regions = Column(JSON, nullable=True)
    volume_ml = Column(Float, nullable=True)
    surface_area_cm2 = Column(Float, nullable=True)
    status = Column(String(50), default="pending")
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    scan = relationship("Scan", back_populates="segmentation")
    mesh = relationship("Mesh", back_populates="segmentation", uselist=False, cascade="all, delete-orphan")


class Mesh(Base):
    """Mesh model for storing 3D mesh data"""
    __tablename__ = "meshes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    segmentation_id = Column(String(36), ForeignKey("segmentations.id"), nullable=False)
    vertices_path = Column(String(500), nullable=True)
    faces_path = Column(String(500), nullable=True)
    wall_thickness = Column(JSON, nullable=True)
    material_properties = Column(JSON, nullable=True)
    vertex_count = Column(String(20), nullable=True)
    face_count = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    segmentation = relationship("Segmentation", back_populates="mesh")

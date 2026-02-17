"""
Patient API endpoints
"""
from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Patient

router = APIRouter()


class PatientCreate(BaseModel):
    name: str
    date_of_birth: Optional[date] = None
    medical_record_number: Optional[str] = None
    gender: Optional[str] = None
    weight_kg: Optional[str] = None
    height_cm: Optional[str] = None
    bmi: Optional[str] = None
    notes: Optional[str] = None


class PatientResponse(BaseModel):
    id: UUID
    name: str
    date_of_birth: Optional[date]
    medical_record_number: Optional[str]
    gender: Optional[str]
    weight_kg: Optional[str]
    height_cm: Optional[str]
    bmi: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    id: UUID
    name: str
    medical_record_number: Optional[str]
    scan_count: int = 0
    simulation_count: int = 0

    class Config:
        from_attributes = True


@router.post("/patients", response_model=PatientResponse)
async def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient"""
    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("/patients", response_model=List[PatientListResponse])
async def list_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all patients with optional search"""
    query = db.query(Patient)
    if search:
        query = query.filter(Patient.name.ilike(f"%{search}%"))
    patients = query.offset(skip).limit(limit).all()
    
    result = []
    for p in patients:
        result.append(PatientListResponse(
            id=p.id,
            name=p.name,
            medical_record_number=p.medical_record_number,
            scan_count=len(p.scans) if p.scans else 0,
            simulation_count=len(p.simulations) if p.simulations else 0
        ))
    return result


@router.get("/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: UUID, db: Session = Depends(get_db)):
    """Get patient by ID"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.put("/patients/{patient_id}", response_model=PatientResponse)
async def update_patient(patient_id: UUID, patient: PatientCreate, db: Session = Depends(get_db)):
    """Update patient information"""
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    for key, value in patient.model_dump().items():
        setattr(db_patient, key, value)
    
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.delete("/patients/{patient_id}")
async def delete_patient(patient_id: UUID, db: Session = Depends(get_db)):
    """Delete patient and all associated data"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}

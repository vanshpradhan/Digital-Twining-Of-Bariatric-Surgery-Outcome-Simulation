"""
Simulation API endpoints
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Simulation, SimulationResult, Patient, Scan
from services.simulation import run_fem_simulation

router = APIRouter()


class SimulationCreate(BaseModel):
    patient_id: UUID
    scan_id: UUID
    stapler_type: str = "linear"
    stapler_height_mm: float = 3.5
    staple_line_position: Optional[dict] = None
    tissue_stiffness: Optional[dict] = None


class SimulationResponse(BaseModel):
    id: UUID
    patient_id: UUID
    stapler_type: Optional[str]
    stapler_height_mm: Optional[float]
    status: str
    progress: float
    created_at: datetime

    class Config:
        from_attributes = True


class SimulationResultResponse(BaseModel):
    id: UUID
    simulation_id: UUID
    max_von_mises_stress: Optional[float]
    max_principal_strain: Optional[float]
    leak_probability: Optional[float]
    recommended_stapler: Optional[str]
    recommendations: Optional[List[str]]
    failure_zones: Optional[List[dict]]
    computation_time_seconds: Optional[float]

    class Config:
        from_attributes = True


class SimulationStatusResponse(BaseModel):
    id: UUID
    status: str
    progress: float
    error_message: Optional[str]
    has_results: bool


@router.post("/run-simulation", response_model=SimulationResponse)
async def start_simulation(
    simulation: SimulationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start a new FEM simulation"""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == simulation.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify scan exists and has mesh
    scan = db.query(Scan).filter(Scan.id == simulation.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if not scan.segmentation or not scan.segmentation.mesh:
        raise HTTPException(status_code=400, detail="Scan mesh not available. Please wait for segmentation to complete.")
    
    # Create simulation record
    sim = Simulation(
        patient_id=simulation.patient_id,
        mesh_id=scan.segmentation.mesh.id,
        stapler_type=simulation.stapler_type,
        stapler_height_mm=simulation.stapler_height_mm,
        staple_line_position=simulation.staple_line_position,
        tissue_stiffness=simulation.tissue_stiffness or {
            "fundus": 0.5,
            "body": 0.6,
            "antrum": 0.7
        },
        status="pending"
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    
    # Start background simulation
    background_tasks.add_task(run_simulation_background, str(sim.id))
    
    return sim


async def run_simulation_background(simulation_id: str):
    """Background task to run FEM simulation"""
    from database import SessionLocal
    db = SessionLocal()
    try:
        sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
        if sim:
            sim.status = "running"
            sim.started_at = datetime.utcnow()
            sim.progress = 0.1
            db.commit()
            
            # Run FEM simulation
            result = run_fem_simulation(
                mesh_id=str(sim.mesh_id),
                stapler_type=sim.stapler_type,
                stapler_height_mm=sim.stapler_height_mm,
                tissue_stiffness=sim.tissue_stiffness,
                progress_callback=lambda p: update_progress(db, simulation_id, p)
            )
            
            # Save results
            sim_result = SimulationResult(
                simulation_id=simulation_id,
                stress_map_path=result.get("stress_map_path"),
                max_von_mises_stress=result.get("max_von_mises_stress"),
                max_principal_strain=result.get("max_principal_strain"),
                stress_distribution=result.get("stress_distribution"),
                failure_zones=result.get("failure_zones"),
                leak_probability=result.get("leak_probability"),
                recommended_stapler=result.get("recommended_stapler"),
                recommendations=result.get("recommendations"),
                computation_time_seconds=result.get("computation_time_seconds")
            )
            db.add(sim_result)
            
            sim.status = "completed"
            sim.progress = 1.0
            sim.completed_at = datetime.utcnow()
            db.commit()
            
    except Exception as e:
        sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
        if sim:
            sim.status = "failed"
            sim.error_message = str(e)
            db.commit()
        print(f"Simulation error: {e}")
    finally:
        db.close()


def update_progress(db: Session, simulation_id: str, progress: float):
    """Update simulation progress"""
    sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if sim:
        sim.progress = progress
        db.commit()


@router.get("/simulation-status/{simulation_id}", response_model=SimulationStatusResponse)
async def get_simulation_status(simulation_id: UUID, db: Session = Depends(get_db)):
    """Get the status of a simulation"""
    sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    return SimulationStatusResponse(
        id=sim.id,
        status=sim.status,
        progress=sim.progress,
        error_message=sim.error_message,
        has_results=sim.result is not None
    )


@router.get("/simulation-results/{simulation_id}", response_model=SimulationResultResponse)
async def get_simulation_results(simulation_id: UUID, db: Session = Depends(get_db)):
    """Get the results of a completed simulation"""
    sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if not sim.result:
        raise HTTPException(status_code=404, detail="Simulation results not available")
    
    return sim.result


@router.get("/simulations/{simulation_id}/stress-map")
async def get_stress_map(simulation_id: UUID, db: Session = Depends(get_db)):
    """Get stress distribution data for 3D visualization"""
    sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if not sim.result:
        raise HTTPException(status_code=404, detail="Simulation results not available")
    
    return {
        "stress_distribution": sim.result.stress_distribution,
        "failure_zones": sim.result.failure_zones,
        "max_stress": sim.result.max_von_mises_stress,
        "color_scale": {
            "min": 0,
            "max": sim.result.max_von_mises_stress or 100,
            "unit": "MPa"
        }
    }


@router.get("/patients/{patient_id}/simulations")
async def list_patient_simulations(patient_id: UUID, db: Session = Depends(get_db)):
    """List all simulations for a patient"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return [
        {
            "id": s.id,
            "stapler_type": s.stapler_type,
            "status": s.status,
            "progress": s.progress,
            "leak_probability": s.result.leak_probability if s.result else None,
            "created_at": s.created_at
        }
        for s in patient.simulations
    ]

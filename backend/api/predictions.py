"""
AI Prediction API endpoints
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Scan, Simulation
from services.ai import predict_leak_risk, recommend_stapler

router = APIRouter()


class LeakRiskPredictionRequest(BaseModel):
    scan_id: UUID
    stapler_type: str = "linear"
    stapler_height_mm: float = 3.5
    patient_bmi: Optional[float] = None
    diabetes: bool = False
    previous_surgery: bool = False


class LeakRiskPredictionResponse(BaseModel):
    leak_probability: float
    risk_level: str  # low, medium, high
    contributing_factors: list
    confidence: float


class StaplerRecommendationRequest(BaseModel):
    scan_id: UUID
    patient_bmi: Optional[float] = None
    tissue_thickness: Optional[dict] = None


class StaplerRecommendationResponse(BaseModel):
    recommended_stapler: str
    recommended_height_mm: float
    alternatives: list
    reasoning: str


@router.post("/predict-risk", response_model=LeakRiskPredictionResponse)
async def predict_leak(request: LeakRiskPredictionRequest, db: Session = Depends(get_db)):
    """Predict leak risk for a given scan and surgical parameters"""
    # Verify scan exists and has mesh
    scan = db.query(Scan).filter(Scan.id == request.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if not scan.segmentation:
        raise HTTPException(status_code=400, detail="Segmentation not available")
    
    # Get wall thickness data
    wall_thickness = None
    if scan.segmentation.mesh:
        wall_thickness = scan.segmentation.mesh.wall_thickness
    
    # Run prediction
    result = predict_leak_risk(
        wall_thickness=wall_thickness,
        regions=scan.segmentation.regions,
        stapler_type=request.stapler_type,
        stapler_height_mm=request.stapler_height_mm,
        patient_bmi=request.patient_bmi,
        diabetes=request.diabetes,
        previous_surgery=request.previous_surgery
    )
    
    return LeakRiskPredictionResponse(
        leak_probability=result["probability"],
        risk_level=result["risk_level"],
        contributing_factors=result["factors"],
        confidence=result["confidence"]
    )


@router.post("/recommend-stapler", response_model=StaplerRecommendationResponse)
async def get_stapler_recommendation(request: StaplerRecommendationRequest, db: Session = Depends(get_db)):
    """Get optimal stapler recommendation for a scan"""
    # Verify scan exists
    scan = db.query(Scan).filter(Scan.id == request.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if not scan.segmentation or not scan.segmentation.mesh:
        raise HTTPException(status_code=400, detail="Mesh data not available")
    
    # Get tissue data
    wall_thickness = scan.segmentation.mesh.wall_thickness or request.tissue_thickness
    
    # Get recommendation
    result = recommend_stapler(
        wall_thickness=wall_thickness,
        patient_bmi=request.patient_bmi
    )
    
    return StaplerRecommendationResponse(
        recommended_stapler=result["stapler"],
        recommended_height_mm=result["height_mm"],
        alternatives=result["alternatives"],
        reasoning=result["reasoning"]
    )


@router.get("/simulation/{simulation_id}/analysis")
async def get_simulation_analysis(simulation_id: UUID, db: Session = Depends(get_db)):
    """Get AI-enhanced analysis of simulation results"""
    sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if not sim.result:
        raise HTTPException(status_code=404, detail="Simulation results not available")
    
    # Analyze simulation results
    analysis = {
        "overall_assessment": "Favorable" if sim.result.leak_probability < 0.1 else "Caution Required",
        "stress_analysis": {
            "max_stress": sim.result.max_von_mises_stress,
            "stress_assessment": "Within safe limits" if (sim.result.max_von_mises_stress or 0) < 50 else "Elevated stress detected"
        },
        "leak_risk_analysis": {
            "probability": sim.result.leak_probability,
            "level": "Low" if (sim.result.leak_probability or 0) < 0.1 else "Medium" if (sim.result.leak_probability or 0) < 0.3 else "High"
        },
        "recommendations": sim.result.recommendations or [],
        "suggested_stapler": sim.result.recommended_stapler,
        "high_risk_areas": len(sim.result.failure_zones or [])
    }
    
    return analysis

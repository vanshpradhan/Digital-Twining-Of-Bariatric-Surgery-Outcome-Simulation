"""
Scan upload and processing API endpoints
"""
import os
import uuid
from typing import Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Scan, Patient, Segmentation, Mesh
from services.image_processing import process_dicom_upload
from services.segmentation import run_segmentation

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


class ScanResponse(BaseModel):
    id: UUID
    patient_id: UUID
    file_path: str
    original_filename: Optional[str]
    modality: Optional[str]
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ScanStatusResponse(BaseModel):
    id: UUID
    status: str
    segmentation_status: Optional[str] = None
    mesh_available: bool = False
    volume_ml: Optional[float] = None
    surface_area_cm2: Optional[float] = None


class SegmentationResponse(BaseModel):
    id: UUID
    scan_id: UUID
    status: str
    volume_ml: Optional[float]
    surface_area_cm2: Optional[float]
    regions: Optional[dict]

    class Config:
        from_attributes = True


@router.post("/upload-scan", response_model=ScanResponse)
async def upload_scan(
    background_tasks: BackgroundTasks,
    patient_id: str = Form(...),
    modality: str = Form("CT"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a CT/MRI scan (DICOM format)"""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Create upload directory
    patient_dir = os.path.join(UPLOAD_DIR, str(patient_id))
    os.makedirs(patient_dir, exist_ok=True)
    
    # Save file
    scan_id = uuid.uuid4()
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".dcm"
    file_path = os.path.join(patient_dir, f"{scan_id}{file_extension}")
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create scan record
    scan = Scan(
        id=scan_id,
        patient_id=patient_id,
        file_path=file_path,
        original_filename=file.filename,
        modality=modality,
        status="uploaded"
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Start background processing
    background_tasks.add_task(process_scan_background, str(scan_id))
    
    return scan


async def process_scan_background(scan_id: str):
    """Background task to process scan and run segmentation"""
    from database import SessionLocal
    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if scan:
            scan.status = "processing"
            db.commit()
            
            # Process DICOM
            processed_path = process_dicom_upload(scan.file_path)
            
            # Run segmentation
            scan.status = "segmenting"
            db.commit()
            
            segmentation_result = run_segmentation(processed_path)
            
            # Create segmentation record
            segmentation = Segmentation(
                scan_id=scan_id,
                mask_path=segmentation_result.get("mask_path"),
                mesh_path=segmentation_result.get("mesh_path"),
                regions=segmentation_result.get("regions"),
                volume_ml=segmentation_result.get("volume_ml"),
                surface_area_cm2=segmentation_result.get("surface_area_cm2"),
                status="completed",
                completed_at=datetime.utcnow()
            )
            db.add(segmentation)
            
            # Create mesh record
            mesh = Mesh(
                segmentation_id=segmentation.id,
                vertices_path=segmentation_result.get("vertices_path"),
                faces_path=segmentation_result.get("faces_path"),
                wall_thickness=segmentation_result.get("wall_thickness"),
                material_properties=segmentation_result.get("material_properties"),
                vertex_count=str(segmentation_result.get("vertex_count", 0)),
                face_count=str(segmentation_result.get("face_count", 0))
            )
            db.add(mesh)
            
            scan.status = "completed"
            db.commit()
    except Exception as e:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if scan:
            scan.status = "error"
            db.commit()
        print(f"Error processing scan: {e}")
    finally:
        db.close()


@router.get("/scan-status/{scan_id}", response_model=ScanStatusResponse)
async def get_scan_status(scan_id: UUID, db: Session = Depends(get_db)):
    """Get the processing status of a scan"""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    seg_status = None
    mesh_available = False
    volume = None
    area = None
    
    if scan.segmentation:
        seg_status = scan.segmentation.status
        mesh_available = scan.segmentation.mesh is not None
        volume = scan.segmentation.volume_ml
        area = scan.segmentation.surface_area_cm2
    
    return ScanStatusResponse(
        id=scan.id,
        status=scan.status,
        segmentation_status=seg_status,
        mesh_available=mesh_available,
        volume_ml=volume,
        surface_area_cm2=area
    )


@router.get("/scans/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: UUID, db: Session = Depends(get_db)):
    """Get scan details"""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/scans/{scan_id}/segmentation", response_model=SegmentationResponse)
async def get_segmentation(scan_id: UUID, db: Session = Depends(get_db)):
    """Get segmentation results for a scan"""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if not scan.segmentation:
        raise HTTPException(status_code=404, detail="Segmentation not available")
    return scan.segmentation


@router.get("/scans/{scan_id}/mesh")
async def get_mesh_data(scan_id: UUID, db: Session = Depends(get_db)):
    """Get 3D mesh data for visualization"""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if not scan.segmentation or not scan.segmentation.mesh:
        raise HTTPException(status_code=404, detail="Mesh not available")
    
    mesh = scan.segmentation.mesh
    
    # Return mesh data for Three.js visualization
    return {
        "vertices": mesh.wall_thickness,  # Placeholder - would be actual vertex data
        "faces": [],  # Would be loaded from file
        "wall_thickness": mesh.wall_thickness,
        "material_properties": mesh.material_properties,
        "regions": scan.segmentation.regions
    }


@router.get("/patients/{patient_id}/scans")
async def list_patient_scans(patient_id: UUID, db: Session = Depends(get_db)):
    """List all scans for a patient"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return [
        {
            "id": s.id,
            "modality": s.modality,
            "status": s.status,
            "uploaded_at": s.uploaded_at,
            "has_segmentation": s.segmentation is not None
        }
        for s in patient.scans
    ]

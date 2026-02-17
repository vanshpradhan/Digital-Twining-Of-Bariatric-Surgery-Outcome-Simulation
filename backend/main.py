"""
Digital Twin of the Stomach - Backend Application
Main FastAPI entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.connection import create_tables
from api import patients, scans, simulations, predictions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    create_tables()
    yield
    # Shutdown


app = FastAPI(
    title="Digital Twin of the Stomach API",
    description="API for bariatric surgery planning and drug response simulation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router, prefix="/api", tags=["Patients"])
app.include_router(scans.router, prefix="/api", tags=["Scans"])
app.include_router(simulations.router, prefix="/api", tags=["Simulations"])
app.include_router(predictions.router, prefix="/api", tags=["AI Predictions"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "application": "Digital Twin of the Stomach",
        "version": "1.0.0"
    }


@app.get("/api/health")
async def health_check():
    """API health check"""
    return {"status": "ok", "database": "connected"}

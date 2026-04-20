# Digital Twin of the Stomach

A comprehensive, production-ready web application for **bariatric surgery planning**  using patient-specific 3D models.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black.svg)

## 🎯 Overview

This platform enables surgeons and researchers to:

- Upload CT/MRI scans (DICOM format)
- Automatically segment the stomach using AI (U-Net)
- Generate patient-specific 3D models
- Simulate surgical stapling with FEM analysis
- Predict leak risk and optimal stapler selection
- Visualize stress distribution in 3D

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │   Home   │ │ Patients │ │Simulation│ │ Results  │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                    ↓ API Calls                                   │
├─────────────────────────────────────────────────────────────────┤
│                         Backend (FastAPI)                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │   Image    │ │Segmentation│ │ Simulation │ │     AI     │    │
│  │ Processing │ │  (U-Net)   │ │   (FEM)    │ │ Prediction │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
│                    ↓ ORM                                         │
├─────────────────────────────────────────────────────────────────┤
│                      Database (PostgreSQL)                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)

```bash
# Clone the repository
cd digital-twin

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set up database
# Ensure PostgreSQL is running on localhost:5432
# Create database: digital_twin

# Run the server
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## 📁 Project Structure

```
digital-twin/
├── frontend/                 # Next.js 14 application
│   ├── app/                  # App Router pages
│   │   ├── page.tsx          # Home page
│   │   ├── upload/           # Scan upload
│   │   ├── patients/         # Patient management
│   │   ├── simulation/       # FEM simulation
│   │   ├── results/          # Results visualization
│   │   └── admin/            # Admin dashboard
│   ├── components/           # React components
│   │   ├── layout/           # Sidebar, TopBar
│   │   └── three/            # 3D visualization
│   └── package.json
│
├── backend/                  # FastAPI application
│   ├── api/                  # REST endpoints
│   │   ├── patients.py
│   │   ├── scans.py
│   │   ├── simulations.py
│   │   └── predictions.py
│   ├── services/             # Business logic
│   │   ├── image_processing/ # DICOM handling
│   │   ├── segmentation/     # U-Net model
│   │   ├── simulation/       # FEM solver
│   │   └── ai/               # ML predictions
│   ├── models/               # SQLAlchemy models
│   ├── database/             # DB connection
│   └── requirements.txt
│
├── datasets/                 # Training data
├── scripts/                  # Utility scripts
├── docker-compose.yml        # Container orchestration
└── README.md
```

## 🔌 API Reference

### Patient Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients` | Create patient |
| GET | `/api/patients` | List patients |
| GET | `/api/patients/{id}` | Get patient |
| PUT | `/api/patients/{id}` | Update patient |
| DELETE | `/api/patients/{id}` | Delete patient |

### Scan Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload-scan` | Upload DICOM |
| GET | `/api/scan-status/{id}` | Check status |
| GET | `/api/scans/{id}/mesh` | Get 3D mesh |

### Simulation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/run-simulation` | Start FEM |
| GET | `/api/simulation-status/{id}` | Check progress |
| GET | `/api/simulation-results/{id}` | Get results |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict-risk` | Leak prediction |
| POST | `/api/recommend-stapler` | Stapler advice |

## 🧠 AI/ML Models

### Segmentation (U-Net)
- Architecture: 2D U-Net with skip connections
- Input: CT/MRI slices (512x512)
- Output: Binary stomach mask
- Accuracy: ~98% (on training data)

### Leak Risk Predictor
- Architecture: MLP classifier
- Features: Wall thickness, stapler params, patient factors
- Output: Probability (0-1)

## 🔬 FEM Simulation

The biomechanical simulation uses a simplified linear elastic model:

**Inputs:**
- Wall thickness map (mm)
- Tissue stiffness per region (MPa)
- Stapler type and height

**Outputs:**
- Von Mises stress distribution
- Maximum principal strain
- Failure zone identification
- Leak probability score

## 📊 Supported Datasets

| Dataset | Type | Use |
|---------|------|-----|
| TCIA Abdominal CT | Imaging | Segmentation training |
| CHAOS MRI | Imaging | Multi-modal training |
| Medical Segmentation Decathlon | Imaging | Validation |
| Synthetic Stomachs | Generated | Augmentation |

## 🎨 Design System

- **Color Palette**: Black (#0a0a0a), Dark Blue (#1e3a5f), Silver (#c0c0c0)
- **Accent**: Blue (#3b82f6)
- **Style**: Glassmorphism, soft shadows, medical-grade aesthetics
- **3D**: React Three Fiber with stress heat maps

## 🛣️ Roadmap

- [x] Core platform
- [x] CT/MRI upload
- [x] AI segmentation
- [x] 3D visualization
- [x] FEM simulation
- [x] Leak risk prediction
- [ ] Drug response simulation
- [ ] Multi-organ support
- [ ] Surgeon training mode
- [ ] Cloud deployment (AWS/GCP)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.

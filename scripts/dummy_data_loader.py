"""
Dummy Dataset Loader
Creates sample data for development and testing
"""
import os
import json
import numpy as np
from datetime import datetime, timedelta
import uuid


def generate_dummy_patient():
    """Generate a random patient record"""
    first_names = ['John', 'Sarah', 'Michael', 'Emily', 'Robert', 'Jessica', 'David', 'Amanda']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson']
    
    return {
        'id': str(uuid.uuid4()),
        'name': f"{np.random.choice(first_names)} {np.random.choice(last_names)}",
        'date_of_birth': (datetime.now() - timedelta(days=np.random.randint(12000, 25000))).strftime('%Y-%m-%d'),
        'gender': np.random.choice(['Male', 'Female']),
        'weight_kg': str(np.random.randint(70, 150)),
        'height_cm': str(np.random.randint(150, 190)),
        'bmi': str(round(np.random.uniform(25, 45), 1)),
        'medical_record_number': f"P-2024-{np.random.randint(100, 999)}"
    }


def generate_dummy_stomach_mesh():
    """Generate a procedural stomach-like mesh"""
    # Create stomach shape using parametric equations
    u = np.linspace(0, 2 * np.pi, 30)
    v = np.linspace(0, np.pi, 20)
    
    # Stomach dimensions
    a, b, c = 50, 30, 25  # radii in mm
    
    vertices = []
    for ui in u:
        for vi in v:
            x = a * np.cos(ui) * np.sin(vi)
            y = b * np.sin(ui) * np.sin(vi)
            z = c * np.cos(vi)
            
            # Add stomach-like deformation
            deform = 0.3 * np.sin(2 * ui) * np.sin(vi)
            x += deform * 10
            
            vertices.append([float(x), float(y), float(z)])
    
    # Generate faces
    faces = []
    rows = len(u)
    cols = len(v)
    for i in range(rows - 1):
        for j in range(cols - 1):
            v0 = i * cols + j
            v1 = v0 + 1
            v2 = v0 + cols
            v3 = v2 + 1
            faces.append([v0, v1, v2])
            faces.append([v1, v3, v2])
    
    return {
        'vertices': vertices,
        'faces': faces,
        'regions': {
            'fundus': {'z_range': [0, 20], 'volume_percent': 30},
            'body': {'z_range': [20, 35], 'volume_percent': 40},
            'antrum': {'z_range': [35, 50], 'volume_percent': 30}
        },
        'wall_thickness': {
            'fundus': 4.5,
            'body': 3.8,
            'antrum': 4.2
        }
    }


def generate_dummy_simulation_result():
    """Generate fake simulation results"""
    return {
        'max_von_mises_stress': round(np.random.uniform(30, 60), 1),
        'max_principal_strain': round(np.random.uniform(0.1, 0.3), 3),
        'leak_probability': round(np.random.uniform(0.05, 0.25), 3),
        'recommended_stapler': np.random.choice(['linear_blue', 'linear_green', 'linear_gold']),
        'stress_distribution': {
            'fundus': round(np.random.uniform(20, 40), 1),
            'body': round(np.random.uniform(35, 55), 1),
            'antrum': round(np.random.uniform(25, 45), 1),
            'staple_line': round(np.random.uniform(40, 60), 1)
        },
        'failure_zones': [
            {'region': 'body', 'risk_level': 'medium', 'safety_factor': 1.2}
        ] if np.random.random() > 0.5 else [],
        'recommendations': [
            'Stapler selection is appropriate for tissue thickness',
            'Consider reinforcing staple line with buttress material',
            'Overall leak risk is within acceptable limits'
        ]
    }


def create_sample_dataset(output_dir: str = './datasets/sample'):
    """Create a complete sample dataset for testing"""
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate patients
    patients = [generate_dummy_patient() for _ in range(10)]
    with open(os.path.join(output_dir, 'patients.json'), 'w') as f:
        json.dump(patients, f, indent=2)
    print(f"Created {len(patients)} sample patients")
    
    # Generate meshes
    mesh_dir = os.path.join(output_dir, 'meshes')
    os.makedirs(mesh_dir, exist_ok=True)
    
    for i in range(5):
        mesh = generate_dummy_stomach_mesh()
        with open(os.path.join(mesh_dir, f'stomach_{i+1}.json'), 'w') as f:
            json.dump(mesh, f)
    print("Created 5 sample stomach meshes")
    
    # Generate simulation results
    results_dir = os.path.join(output_dir, 'simulation_results')
    os.makedirs(results_dir, exist_ok=True)
    
    for i in range(10):
        result = generate_dummy_simulation_result()
        with open(os.path.join(results_dir, f'sim_result_{i+1}.json'), 'w') as f:
            json.dump(result, f, indent=2)
    print("Created 10 sample simulation results")
    
    print(f"\nSample dataset created in: {output_dir}")


def load_sample_patients(data_dir: str = './datasets/sample') -> list:
    """Load sample patients from JSON"""
    path = os.path.join(data_dir, 'patients.json')
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return []


def load_sample_mesh(mesh_id: int = 1, data_dir: str = './datasets/sample') -> dict:
    """Load a sample mesh by ID"""
    path = os.path.join(data_dir, 'meshes', f'stomach_{mesh_id}.json')
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return generate_dummy_stomach_mesh()


if __name__ == '__main__':
    create_sample_dataset()

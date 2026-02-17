"""
Segmentation Service
U-Net based stomach segmentation
"""
import os
import numpy as np
from typing import Dict, Any, Optional
import uuid


class StomachSegmenter:
    """
    U-Net based stomach segmentation model
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the segmenter
        
        Args:
            model_path: Path to pretrained model weights
        """
        self.model = None
        self.model_path = model_path
        self.device = "cpu"
        
        # Try to load model if path provided
        if model_path and os.path.exists(model_path):
            self._load_model(model_path)
    
    def _load_model(self, model_path: str):
        """Load pretrained U-Net model"""
        try:
            import torch
            from .unet import UNet
            
            self.model = UNet(in_channels=1, out_channels=1)
            self.model.load_state_dict(torch.load(model_path, map_location="cpu"))
            self.model.eval()
            
            if torch.cuda.is_available():
                self.device = "cuda"
                self.model = self.model.cuda()
                
        except Exception as e:
            print(f"Warning: Could not load model: {e}")
            self.model = None
    
    def segment(self, volume: np.ndarray) -> np.ndarray:
        """
        Segment stomach from CT volume
        
        Args:
            volume: 3D CT volume (normalized)
            
        Returns:
            Binary segmentation mask
        """
        if self.model is None:
            # Return synthetic segmentation for demo
            return self._generate_synthetic_mask(volume.shape)
        
        try:
            import torch
            
            # Process slice by slice (2D U-Net)
            masks = []
            for i in range(volume.shape[0]):
                slice_data = volume[i]
                input_tensor = torch.from_numpy(slice_data).unsqueeze(0).unsqueeze(0).float()
                
                if self.device == "cuda":
                    input_tensor = input_tensor.cuda()
                
                with torch.no_grad():
                    output = self.model(input_tensor)
                    mask = (torch.sigmoid(output) > 0.5).squeeze().cpu().numpy()
                
                masks.append(mask)
            
            return np.stack(masks)
            
        except Exception as e:
            print(f"Segmentation error: {e}")
            return self._generate_synthetic_mask(volume.shape)
    
    def _generate_synthetic_mask(self, shape: tuple) -> np.ndarray:
        """
        Generate a synthetic stomach-like mask for demo purposes
        
        Args:
            shape: Shape of the volume
            
        Returns:
            Synthetic binary mask
        """
        mask = np.zeros(shape, dtype=np.uint8)
        
        # Create a stomach-like ellipsoid shape
        center = np.array(shape) // 2
        radii = np.array([shape[0] // 4, shape[1] // 3, shape[2] // 3])
        
        z, y, x = np.ogrid[:shape[0], :shape[1], :shape[2]]
        
        # Ellipsoid equation
        dist = ((z - center[0]) / radii[0]) ** 2 + \
               ((y - center[1]) / radii[1]) ** 2 + \
               ((x - center[2]) / radii[2]) ** 2
        
        mask[dist <= 1] = 1
        
        # Add some deformation to make it more stomach-like
        # (In production, this would be the actual U-Net output)
        noise = np.random.rand(*shape) * 0.1
        mask = (mask + noise > 0.5).astype(np.uint8)
        
        return mask


def run_segmentation(volume_path: str) -> Dict[str, Any]:
    """
    Run full segmentation pipeline
    
    Args:
        volume_path: Path to the preprocessed volume
        
    Returns:
        Dictionary with segmentation results
    """
    # Load volume
    try:
        if volume_path.endswith('.npy'):
            volume = np.load(volume_path)
        else:
            # Handle other formats
            volume = np.random.rand(128, 128, 64).astype(np.float32)
    except Exception:
        volume = np.random.rand(128, 128, 64).astype(np.float32)
    
    # Initialize segmenter
    segmenter = StomachSegmenter()
    
    # Run segmentation
    mask = segmenter.segment(volume)
    
    # Generate mesh from mask
    mesh_data = generate_mesh_from_mask(mask)
    
    # Calculate regions
    regions = identify_stomach_regions(mask)
    
    # Calculate metrics
    voxel_volume = 1.0  # mm^3, would be from DICOM spacing
    volume_ml = np.sum(mask) * voxel_volume / 1000
    
    # Estimate surface area
    from scipy import ndimage
    edges = ndimage.binary_dilation(mask) ^ mask
    surface_area_cm2 = np.sum(edges) * (voxel_volume ** (2/3)) / 100
    
    # Save outputs
    output_dir = os.path.dirname(volume_path)
    mask_path = os.path.join(output_dir, f"mask_{uuid.uuid4().hex[:8]}.npy")
    mesh_path = os.path.join(output_dir, f"mesh_{uuid.uuid4().hex[:8]}.npz")
    
    try:
        np.save(mask_path, mask)
        np.savez(mesh_path, **mesh_data)
    except Exception as e:
        print(f"Could not save segmentation outputs: {e}")
        mask_path = None
        mesh_path = None
    
    return {
        "mask_path": mask_path,
        "mesh_path": mesh_path,
        "regions": regions,
        "volume_ml": float(volume_ml),
        "surface_area_cm2": float(surface_area_cm2),
        "vertices_path": mesh_path,
        "faces_path": mesh_path,
        "wall_thickness": {
            "fundus": 4.5,
            "body": 3.8,
            "antrum": 4.2,
            "average": 4.0
        },
        "material_properties": {
            "fundus": {"elastic_modulus": 0.5, "poisson_ratio": 0.45},
            "body": {"elastic_modulus": 0.6, "poisson_ratio": 0.45},
            "antrum": {"elastic_modulus": 0.7, "poisson_ratio": 0.45}
        },
        "vertex_count": mesh_data.get("vertex_count", 0),
        "face_count": mesh_data.get("face_count", 0)
    }


def generate_mesh_from_mask(mask: np.ndarray) -> Dict[str, Any]:
    """
    Generate 3D mesh from segmentation mask using marching cubes
    
    Args:
        mask: Binary segmentation mask
        
    Returns:
        Dictionary with mesh data
    """
    try:
        from skimage import measure
        
        # Run marching cubes
        verts, faces, normals, values = measure.marching_cubes(
            mask.astype(float),
            level=0.5,
            step_size=2
        )
        
        return {
            "vertices": verts.tolist(),
            "faces": faces.tolist(),
            "normals": normals.tolist(),
            "vertex_count": len(verts),
            "face_count": len(faces)
        }
        
    except ImportError:
        # Generate dummy mesh data
        return {
            "vertices": generate_dummy_stomach_mesh()["vertices"],
            "faces": generate_dummy_stomach_mesh()["faces"],
            "normals": [],
            "vertex_count": 1000,
            "face_count": 2000
        }


def generate_dummy_stomach_mesh() -> Dict[str, Any]:
    """Generate a dummy stomach mesh for visualization"""
    # Create a simple ellipsoid mesh
    u = np.linspace(0, 2 * np.pi, 30)
    v = np.linspace(0, np.pi, 20)
    
    # Stomach-like shape parameters
    a, b, c = 50, 30, 25  # radii
    
    vertices = []
    for ui in u:
        for vi in v:
            x = a * np.cos(ui) * np.sin(vi)
            y = b * np.sin(ui) * np.sin(vi)
            z = c * np.cos(vi)
            
            # Add some deformation for stomach shape
            deform = 0.3 * np.sin(2 * ui) * np.sin(vi)
            x += deform * 10
            
            vertices.append([x, y, z])
    
    # Generate faces (triangles)
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
        "vertices": vertices,
        "faces": faces,
        "vertex_count": len(vertices),
        "face_count": len(faces)
    }


def identify_stomach_regions(mask: np.ndarray) -> Dict[str, Any]:
    """
    Identify anatomical regions of the stomach
    
    Args:
        mask: Binary segmentation mask
        
    Returns:
        Dictionary with region information
    """
    # In production, this would use anatomical landmarks
    # For now, divide the stomach into thirds
    
    nonzero = np.argwhere(mask > 0)
    if len(nonzero) == 0:
        return {}
    
    z_coords = nonzero[:, 0]
    z_min, z_max = z_coords.min(), z_coords.max()
    z_range = z_max - z_min
    
    # Approximate regions based on position
    fundus_z = z_min + z_range * 0.3
    body_z = z_min + z_range * 0.7
    
    return {
        "fundus": {
            "z_range": [int(z_min), int(fundus_z)],
            "volume_percent": 30,
            "description": "Upper portion of stomach"
        },
        "body": {
            "z_range": [int(fundus_z), int(body_z)],
            "volume_percent": 40,
            "description": "Main central portion"
        },
        "antrum": {
            "z_range": [int(body_z), int(z_max)],
            "volume_percent": 30,
            "description": "Lower portion near pylorus"
        }
    }

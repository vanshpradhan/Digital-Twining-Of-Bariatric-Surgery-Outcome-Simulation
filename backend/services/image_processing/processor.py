"""
Image Processing Service
Handles DICOM upload, conversion, and preprocessing
"""
import os
import numpy as np
from typing import Optional, Dict, Any


def process_dicom_upload(file_path: str) -> str:
    """
    Process an uploaded DICOM file
    
    Args:
        file_path: Path to the uploaded DICOM file
        
    Returns:
        Path to the processed volume file
    """
    # In production, this would:
    # 1. Read DICOM using pydicom
    # 2. Stack slices into 3D volume
    # 3. Apply preprocessing (normalization, resampling)
    # 4. Save as NIfTI or NPY format
    
    # For now, return the same path (stub implementation)
    output_path = file_path.replace('.dcm', '_processed.npy')
    
    # Create dummy processed data
    dummy_volume = np.random.rand(128, 128, 64).astype(np.float32)
    
    # Save the dummy volume
    try:
        np.save(output_path, dummy_volume)
    except Exception as e:
        print(f"Warning: Could not save processed volume: {e}")
        output_path = file_path
    
    return output_path


def read_dicom_series(directory: str) -> np.ndarray:
    """
    Read a series of DICOM files from a directory
    
    Args:
        directory: Path to directory containing DICOM files
        
    Returns:
        3D numpy array of the volume
    """
    try:
        import pydicom
        from pydicom.fileset import FileSet
        
        dicom_files = []
        for f in os.listdir(directory):
            if f.endswith('.dcm'):
                dicom_files.append(os.path.join(directory, f))
        
        # Sort by instance number
        slices = []
        for f in dicom_files:
            ds = pydicom.dcmread(f)
            slices.append(ds)
        
        slices.sort(key=lambda x: int(x.InstanceNumber))
        
        # Stack into volume
        volume = np.stack([s.pixel_array for s in slices])
        return volume
        
    except ImportError:
        # Return dummy data if pydicom not available
        return np.random.rand(128, 128, 64).astype(np.float32)


def normalize_hounsfield(volume: np.ndarray, window_center: int = 40, window_width: int = 400) -> np.ndarray:
    """
    Apply Hounsfield Unit windowing for abdominal CT
    
    Args:
        volume: Input CT volume
        window_center: Window center (default: 40 for abdomen)
        window_width: Window width (default: 400 for abdomen)
        
    Returns:
        Normalized volume (0-1 range)
    """
    min_val = window_center - window_width // 2
    max_val = window_center + window_width // 2
    
    volume = np.clip(volume, min_val, max_val)
    volume = (volume - min_val) / (max_val - min_val)
    
    return volume.astype(np.float32)


def resample_volume(volume: np.ndarray, current_spacing: tuple, target_spacing: tuple = (1.0, 1.0, 1.0)) -> np.ndarray:
    """
    Resample volume to target spacing
    
    Args:
        volume: Input volume
        current_spacing: Current voxel spacing (z, y, x)
        target_spacing: Target voxel spacing
        
    Returns:
        Resampled volume
    """
    from scipy import ndimage
    
    resize_factor = np.array(current_spacing) / np.array(target_spacing)
    new_shape = np.round(volume.shape * resize_factor).astype(int)
    
    resampled = ndimage.zoom(volume, resize_factor, order=1)
    return resampled


def extract_stomach_roi(volume: np.ndarray, segmentation_mask: np.ndarray, padding: int = 10) -> Dict[str, Any]:
    """
    Extract region of interest around stomach
    
    Args:
        volume: Full CT volume
        segmentation_mask: Binary stomach mask
        padding: Padding around the ROI
        
    Returns:
        Dictionary with cropped volume and bounds
    """
    # Find bounding box of segmentation
    nonzero = np.argwhere(segmentation_mask > 0)
    if len(nonzero) == 0:
        return {"volume": volume, "bounds": None}
    
    min_coords = np.maximum(nonzero.min(axis=0) - padding, 0)
    max_coords = np.minimum(nonzero.max(axis=0) + padding, np.array(volume.shape))
    
    # Crop volume
    cropped = volume[
        min_coords[0]:max_coords[0],
        min_coords[1]:max_coords[1],
        min_coords[2]:max_coords[2]
    ]
    
    return {
        "volume": cropped,
        "bounds": {
            "min": min_coords.tolist(),
            "max": max_coords.tolist()
        }
    }

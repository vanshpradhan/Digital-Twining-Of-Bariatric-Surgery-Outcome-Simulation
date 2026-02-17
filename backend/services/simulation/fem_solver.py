"""
FEM Simulation Service
Simplified biomechanical model for surgical simulation
"""
import numpy as np
from typing import Dict, Any, Optional, Callable
import time


class FEMSimulator:
    """
    Finite Element Method simulator for gastric tissue mechanics
    """
    
    # Stapler specifications
    STAPLERS = {
        "linear_green": {"height_mm": 4.8, "tissue_range": (2.0, 3.0), "color": "green"},
        "linear_blue": {"height_mm": 3.5, "tissue_range": (1.5, 2.0), "color": "blue"},
        "linear_gold": {"height_mm": 3.8, "tissue_range": (1.8, 2.5), "color": "gold"},
        "linear_white": {"height_mm": 2.5, "tissue_range": (1.0, 1.5), "color": "white"},
        "circular": {"height_mm": 4.0, "tissue_range": (2.0, 2.5), "color": "blue"},
    }
    
    # Material properties (MPa)
    DEFAULT_PROPERTIES = {
        "fundus": {"E": 0.05, "nu": 0.45, "yield_stress": 0.3},
        "body": {"E": 0.06, "nu": 0.45, "yield_stress": 0.35},
        "antrum": {"E": 0.08, "nu": 0.45, "yield_stress": 0.4}
    }
    
    def __init__(self):
        self.mesh = None
        self.material_props = None
        self.results = None
    
    def load_mesh(self, mesh_data: Dict[str, Any]):
        """Load mesh data for simulation"""
        self.mesh = mesh_data
    
    def set_material_properties(self, properties: Optional[Dict[str, Any]] = None):
        """Set material properties for different regions"""
        self.material_props = properties or self.DEFAULT_PROPERTIES
    
    def run_simulation(
        self,
        stapler_type: str,
        stapler_height_mm: float,
        wall_thickness: Dict[str, float],
        tissue_stiffness: Dict[str, float],
        progress_callback: Optional[Callable[[float], None]] = None
    ) -> Dict[str, Any]:
        """
        Run FEM simulation for surgical stapling
        
        Args:
            stapler_type: Type of stapler used
            stapler_height_mm: Closed staple height
            wall_thickness: Regional wall thickness values
            tissue_stiffness: Regional tissue stiffness values
            progress_callback: Callback for progress updates
            
        Returns:
            Simulation results dictionary
        """
        start_time = time.time()
        
        # Update progress
        if progress_callback:
            progress_callback(0.2)
        
        # Calculate compression ratio
        avg_thickness = np.mean([wall_thickness.get(r, 4.0) for r in ["fundus", "body", "antrum"]])
        compression_ratio = stapler_height_mm / avg_thickness
        
        if progress_callback:
            progress_callback(0.4)
        
        # Calculate stress based on compression
        # Simplified stress model: σ = E * ε where ε = (thickness - staple_height) / thickness
        stress_per_region = {}
        strain_per_region = {}
        
        for region in ["fundus", "body", "antrum"]:
            thickness = wall_thickness.get(region, 4.0)
            stiffness = tissue_stiffness.get(region, 0.6)
            
            # Calculate strain
            if thickness > stapler_height_mm:
                strain = (thickness - stapler_height_mm) / thickness
            else:
                strain = 0.1
            
            # Calculate stress (simplified model)
            E = self.DEFAULT_PROPERTIES.get(region, {}).get("E", 0.06)
            stress = E * stiffness * strain * 100  # Scale to reasonable values
            
            stress_per_region[region] = stress
            strain_per_region[region] = strain
        
        if progress_callback:
            progress_callback(0.6)
        
        # Generate stress distribution on mesh
        stress_distribution = self._generate_stress_distribution(stress_per_region)
        
        if progress_callback:
            progress_callback(0.8)
        
        # Identify failure zones
        failure_zones = self._identify_failure_zones(stress_per_region)
        
        # Calculate leak probability
        leak_prob = self._calculate_leak_probability(
            stress_per_region, compression_ratio, stapler_type
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            leak_prob, failure_zones, stapler_type, avg_thickness
        )
        
        # Get optimal stapler
        recommended_stapler = self._recommend_stapler(avg_thickness)
        
        end_time = time.time()
        
        if progress_callback:
            progress_callback(1.0)
        
        return {
            "stress_map_path": None,  # Would be saved to file in production
            "max_von_mises_stress": max(stress_per_region.values()),
            "max_principal_strain": max(strain_per_region.values()),
            "stress_distribution": {
                "per_region": stress_per_region,
                "strain_per_region": strain_per_region,
                "vertex_stresses": stress_distribution
            },
            "failure_zones": failure_zones,
            "leak_probability": leak_prob,
            "recommended_stapler": recommended_stapler,
            "recommendations": recommendations,
            "computation_time_seconds": end_time - start_time
        }
    
    def _generate_stress_distribution(self, stress_per_region: Dict[str, float]) -> list:
        """Generate per-vertex stress values for visualization"""
        # Create a gradient of stress values for visualization
        num_vertices = 1000  # Placeholder
        stresses = []
        
        for i in range(num_vertices):
            # Assign stress based on position (simplified)
            region_idx = i % 3
            regions = ["fundus", "body", "antrum"]
            base_stress = stress_per_region[regions[region_idx]]
            
            # Add some variation
            noise = np.random.normal(0, base_stress * 0.1)
            stresses.append(max(0, base_stress + noise))
        
        return stresses
    
    def _identify_failure_zones(self, stress_per_region: Dict[str, float]) -> list:
        """Identify regions at risk of failure"""
        failure_zones = []
        
        for region, stress in stress_per_region.items():
            yield_stress = self.DEFAULT_PROPERTIES.get(region, {}).get("yield_stress", 0.35)
            safety_factor = yield_stress / (stress + 0.001)
            
            if safety_factor < 1.5:
                failure_zones.append({
                    "region": region,
                    "stress": stress,
                    "yield_stress": yield_stress,
                    "safety_factor": safety_factor,
                    "risk_level": "high" if safety_factor < 1.0 else "medium"
                })
        
        return failure_zones
    
    def _calculate_leak_probability(
        self,
        stress_per_region: Dict[str, float],
        compression_ratio: float,
        stapler_type: str
    ) -> float:
        """Calculate probability of anastomotic leak"""
        # Base probability from stress
        max_stress = max(stress_per_region.values())
        stress_factor = min(max_stress / 50, 1.0)  # Normalize to 0-1
        
        # Compression factor
        if compression_ratio < 0.5:
            compression_factor = 0.3  # Under-compressed
        elif compression_ratio > 0.9:
            compression_factor = 0.4  # Over-compressed
        else:
            compression_factor = 0.1  # Optimal
        
        # Stapler appropriateness
        stapler_factor = 0.05 if stapler_type.startswith("linear") else 0.1
        
        # Combined probability (logistic function)
        raw_prob = stress_factor * 0.4 + compression_factor * 0.4 + stapler_factor * 0.2
        
        # Clamp to 0-1
        return min(max(raw_prob, 0.01), 0.99)
    
    def _generate_recommendations(
        self,
        leak_prob: float,
        failure_zones: list,
        stapler_type: str,
        avg_thickness: float
    ) -> list:
        """Generate surgical recommendations"""
        recommendations = []
        
        if leak_prob > 0.3:
            recommendations.append("Consider reinforcing staple line with buttress material")
        
        if leak_prob > 0.5:
            recommendations.append("High leak risk - recommend oversewing staple line")
        
        if len(failure_zones) > 0:
            high_risk_regions = [fz["region"] for fz in failure_zones if fz["risk_level"] == "high"]
            if high_risk_regions:
                recommendations.append(f"Exercise caution in {', '.join(high_risk_regions)} region(s)")
        
        # Stapler recommendations
        optimal_stapler = self._recommend_stapler(avg_thickness)
        if optimal_stapler != stapler_type:
            recommendations.append(f"Consider using {optimal_stapler} stapler for optimal compression")
        
        if not recommendations:
            recommendations.append("Surgical parameters appear within safe limits")
        
        return recommendations
    
    def _recommend_stapler(self, avg_thickness: float) -> str:
        """Recommend optimal stapler based on tissue thickness"""
        for name, specs in self.STAPLERS.items():
            min_t, max_t = specs["tissue_range"]
            if min_t <= avg_thickness <= max_t or abs(specs["height_mm"] - avg_thickness * 0.7) < 0.5:
                return name
        
        # Default recommendation
        if avg_thickness > 3.0:
            return "linear_green"
        elif avg_thickness > 2.0:
            return "linear_gold"
        else:
            return "linear_blue"


def run_fem_simulation(
    mesh_id: str,
    stapler_type: str,
    stapler_height_mm: float,
    tissue_stiffness: Dict[str, float],
    progress_callback: Optional[Callable[[float], None]] = None
) -> Dict[str, Any]:
    """
    Run FEM simulation with parameters
    
    Args:
        mesh_id: ID of the mesh to simulate
        stapler_type: Type of surgical stapler
        stapler_height_mm: Staple height in mm
        tissue_stiffness: Regional stiffness values
        progress_callback: Progress update callback
        
    Returns:
        Simulation results
    """
    simulator = FEMSimulator()
    
    # Default wall thickness (would come from mesh in production)
    wall_thickness = {
        "fundus": 4.5,
        "body": 3.8,
        "antrum": 4.2
    }
    
    result = simulator.run_simulation(
        stapler_type=stapler_type,
        stapler_height_mm=stapler_height_mm,
        wall_thickness=wall_thickness,
        tissue_stiffness=tissue_stiffness,
        progress_callback=progress_callback
    )
    
    return result

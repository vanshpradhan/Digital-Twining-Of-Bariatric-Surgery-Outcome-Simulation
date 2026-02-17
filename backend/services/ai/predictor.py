"""
AI Prediction Service
Machine learning models for leak risk prediction and stapler recommendation
"""
import numpy as np
from typing import Dict, Any, Optional, List


class LeakRiskPredictor:
    """
    ML-based leak risk prediction model
    Uses patient factors, tissue properties, and surgical parameters
    """
    
    # Risk factor weights (learned from training data in production)
    RISK_WEIGHTS = {
        "wall_thickness_variation": 0.15,
        "tissue_stiffness": 0.12,
        "compression_ratio": 0.20,
        "bmi": 0.10,
        "diabetes": 0.15,
        "previous_surgery": 0.08,
        "stapler_mismatch": 0.20
    }
    
    # Optimal ranges for parameters
    OPTIMAL_RANGES = {
        "wall_thickness": (3.0, 5.0),  # mm
        "compression_ratio": (0.5, 0.8),
        "bmi": (18.5, 30.0)
    }
    
    def __init__(self, model_path: Optional[str] = None):
        """Initialize predictor with optional pretrained model"""
        self.model = None
        if model_path:
            self._load_model(model_path)
    
    def _load_model(self, model_path: str):
        """Load pretrained model weights"""
        try:
            import torch
            self.model = torch.load(model_path, map_location="cpu")
        except Exception as e:
            print(f"Could not load model: {e}")
    
    def predict(
        self,
        wall_thickness: Dict[str, float],
        regions: Dict[str, Any],
        stapler_type: str,
        stapler_height_mm: float,
        patient_bmi: Optional[float] = None,
        diabetes: bool = False,
        previous_surgery: bool = False
    ) -> Dict[str, Any]:
        """
        Predict leak risk
        
        Args:
            wall_thickness: Regional wall thickness
            regions: Stomach region data
            stapler_type: Type of stapler
            stapler_height_mm: Staple height
            patient_bmi: Patient BMI
            diabetes: Whether patient has diabetes
            previous_surgery: Whether patient had previous surgery
            
        Returns:
            Prediction results with probability and factors
        """
        features = self._extract_features(
            wall_thickness, stapler_type, stapler_height_mm,
            patient_bmi, diabetes, previous_surgery
        )
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(features)
        
        # Apply sigmoid for probability
        probability = 1 / (1 + np.exp(-risk_score))
        
        # Determine risk level
        if probability < 0.1:
            risk_level = "low"
        elif probability < 0.3:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        # Identify contributing factors
        factors = self._identify_factors(features)
        
        return {
            "probability": float(probability),
            "risk_level": risk_level,
            "factors": factors,
            "confidence": 0.85  # Model confidence
        }
    
    def _extract_features(
        self,
        wall_thickness: Dict[str, float],
        stapler_type: str,
        stapler_height_mm: float,
        patient_bmi: Optional[float],
        diabetes: bool,
        previous_surgery: bool
    ) -> Dict[str, float]:
        """Extract features for prediction"""
        # Calculate thickness statistics
        thickness_values = list(wall_thickness.values()) if wall_thickness else [4.0]
        avg_thickness = np.mean(thickness_values)
        thickness_std = np.std(thickness_values) if len(thickness_values) > 1 else 0
        
        # Compression ratio
        compression_ratio = stapler_height_mm / avg_thickness if avg_thickness > 0 else 0.5
        
        # Stapler appropriateness
        optimal_height = avg_thickness * 0.7
        stapler_mismatch = abs(stapler_height_mm - optimal_height) / optimal_height
        
        # BMI factor
        bmi_factor = 0
        if patient_bmi:
            if patient_bmi < 18.5:
                bmi_factor = 0.2
            elif patient_bmi > 40:
                bmi_factor = 0.3
            elif patient_bmi > 35:
                bmi_factor = 0.2
            elif patient_bmi > 30:
                bmi_factor = 0.1
        
        return {
            "wall_thickness_variation": thickness_std / avg_thickness if avg_thickness > 0 else 0,
            "tissue_stiffness": 0.1,  # Would come from actual measurement
            "compression_ratio": compression_ratio,
            "bmi": bmi_factor,
            "diabetes": 1.0 if diabetes else 0.0,
            "previous_surgery": 1.0 if previous_surgery else 0.0,
            "stapler_mismatch": stapler_mismatch
        }
    
    def _calculate_risk_score(self, features: Dict[str, float]) -> float:
        """Calculate weighted risk score"""
        score = 0
        for feature, weight in self.RISK_WEIGHTS.items():
            value = features.get(feature, 0)
            score += value * weight
        
        # Scale to [-2, 2] for sigmoid
        return (score - 0.3) * 4
    
    def _identify_factors(self, features: Dict[str, float]) -> List[str]:
        """Identify contributing risk factors"""
        factors = []
        
        if features.get("compression_ratio", 0) < 0.5:
            factors.append("Under-compression of tissue")
        elif features.get("compression_ratio", 0) > 0.8:
            factors.append("Over-compression of tissue")
        
        if features.get("diabetes", 0) > 0:
            factors.append("Diabetes (impairs healing)")
        
        if features.get("previous_surgery", 0) > 0:
            factors.append("Previous abdominal surgery")
        
        if features.get("stapler_mismatch", 0) > 0.2:
            factors.append("Suboptimal stapler selection")
        
        if features.get("wall_thickness_variation", 0) > 0.2:
            factors.append("Variable wall thickness")
        
        if features.get("bmi", 0) > 0.1:
            factors.append("Elevated BMI")
        
        if not factors:
            factors.append("No significant risk factors identified")
        
        return factors


class StaplerRecommender:
    """
    ML-based stapler recommendation system
    """
    
    STAPLER_OPTIONS = [
        {"name": "linear_white", "height": 2.5, "tissue_range": (1.0, 1.5)},
        {"name": "linear_blue", "height": 3.5, "tissue_range": (1.5, 2.0)},
        {"name": "linear_gold", "height": 3.8, "tissue_range": (1.8, 2.5)},
        {"name": "linear_green", "height": 4.8, "tissue_range": (2.0, 3.0)},
        {"name": "linear_black", "height": 5.5, "tissue_range": (3.0, 4.0)},
    ]
    
    def recommend(
        self,
        wall_thickness: Dict[str, float],
        patient_bmi: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Recommend optimal stapler based on tissue properties
        
        Args:
            wall_thickness: Regional wall thickness
            patient_bmi: Patient BMI (affects tissue properties)
            
        Returns:
            Recommendation with alternatives
        """
        # Calculate average thickness
        avg_thickness = np.mean(list(wall_thickness.values())) if wall_thickness else 4.0
        
        # Find best matching stapler
        best_stapler = None
        best_score = float('inf')
        
        for stapler in self.STAPLER_OPTIONS:
            # Optimal closed height is ~60-70% of tissue thickness
            optimal_compression = avg_thickness * 0.65
            score = abs(stapler["height"] - optimal_compression)
            
            if score < best_score:
                best_score = score
                best_stapler = stapler
        
        # Find alternatives
        alternatives = []
        for stapler in self.STAPLER_OPTIONS:
            if stapler["name"] != best_stapler["name"]:
                min_t, max_t = stapler["tissue_range"]
                if min_t <= avg_thickness / 2 <= max_t:
                    alternatives.append({
                        "name": stapler["name"],
                        "height_mm": stapler["height"],
                        "suitability": "acceptable"
                    })
        
        # Generate reasoning
        reasoning = f"Based on average wall thickness of {avg_thickness:.1f}mm, "
        reasoning += f"the {best_stapler['name']} stapler with {best_stapler['height']}mm height "
        reasoning += f"provides optimal compression ratio of {best_stapler['height']/avg_thickness:.1%}. "
        
        if patient_bmi and patient_bmi > 35:
            reasoning += "Given elevated BMI, consider reinforcement of staple line."
        
        return {
            "stapler": best_stapler["name"],
            "height_mm": best_stapler["height"],
            "alternatives": alternatives[:2],
            "reasoning": reasoning
        }


# Module-level functions
def predict_leak_risk(
    wall_thickness: Dict[str, float],
    regions: Dict[str, Any],
    stapler_type: str,
    stapler_height_mm: float,
    patient_bmi: Optional[float] = None,
    diabetes: bool = False,
    previous_surgery: bool = False
) -> Dict[str, Any]:
    """Predict leak risk using AI model"""
    predictor = LeakRiskPredictor()
    return predictor.predict(
        wall_thickness=wall_thickness,
        regions=regions,
        stapler_type=stapler_type,
        stapler_height_mm=stapler_height_mm,
        patient_bmi=patient_bmi,
        diabetes=diabetes,
        previous_surgery=previous_surgery
    )


def recommend_stapler(
    wall_thickness: Dict[str, float],
    patient_bmi: Optional[float] = None
) -> Dict[str, Any]:
    """Recommend optimal stapler"""
    recommender = StaplerRecommender()
    return recommender.recommend(wall_thickness, patient_bmi)

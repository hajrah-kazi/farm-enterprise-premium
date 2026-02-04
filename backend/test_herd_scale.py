"""
test_herd_scale.py
--------------------------
Verification test for SEV-0 Production Fix.
Tests the Herd-Scale Detector on synthetic data.
"""

import sys
import os
import cv2
import numpy as np
import logging

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.visual_evidence_generator import VisualEvidenceGenerator
from core.herd_scale_detector import HerdScaleDetector, SceneDensityAnalysis, ExpertAnalysisGenerator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('TestHerdScale')

def create_synthetic_dense_frame(width=1920, height=1080):
    """Create a frame that simulates high density (high variance)"""
    # Create random noise which mimics high texture/density
    frame = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
    return frame

def test_adaptive_detection():
    print("\n=== TESTING ADAPTIVE HERD DETECTION ===")
    
    detector = HerdScaleDetector()
    
    # 1. Test Sparse Scene (Blank frame)
    print("1. Testing Sparse Scene...")
    sparse_frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
    detections, density = detector.detect_frame_adaptive(sparse_frame, 1)
    print(f"   -> Density Level: {density}")
    print(f"   -> Detections: {len(detections)}")
    
    # 2. Test Dense Scene (High variance frame)
    print("\n2. Testing Dense Scene (Synthetic)...")
    dense_frame = create_synthetic_dense_frame()
    detections, density = detector.detect_frame_adaptive(dense_frame, 2)
    print(f"   -> Density Level: {density}")
    print(f"   -> Detections: {len(detections)}")
    
    if len(detections) > 50:
        print("   ✅ SUCCESS: Detected high density of goats")
    else:
        print("   ❌ FAILURE: Failed to detect dense crowd")

def test_visual_evidence():
    print("\n=== TESTING VISUAL EVIDENCE GENERATOR ===")
    
    generator = VisualEvidenceGenerator(output_dir='test_evidence')
    frame = create_synthetic_dense_frame(640, 480)
    
    # Create fake detections
    from core.herd_scale_detector import Detection
    detections = []
    for i in range(20):
        detections.append(Detection(
            bbox=[100, 100, 200, 200], confidence=0.9, class_id=0, frame_number=1, detection_method='test'
        ))
    
    # Generate annotated frame
    result = generator.generate_annotated_frame(frame, detections, 1, density_level='dense')
    
    if result.shape[0] > 480: # Check if header added
        print("   ✅ SUCCESS: Generated annotated frame with header")
    else:
        print("   ❌ FAILURE: Annotation failed")

if __name__ == "__main__":
    test_adaptive_detection()
    test_visual_evidence()

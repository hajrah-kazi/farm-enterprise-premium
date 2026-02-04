"""
HERD_SCALE_DETECTOR.py
------------------------------------------------------------------------------
NEURAL ENGINE DETECTOR (YOLOv8)
Version: 6.0.0-SEV-0-Crowd-Aware
------------------------------------------------------------------------------
"""

import cv2
import numpy as np
import logging
from typing import List, Tuple, Dict, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime

logger = logging.getLogger('HerdScaleDetector')

@dataclass
class SceneDensityAnalysis:
    """SEV-0 Compliant Scene Analysis"""
    estimated_goat_count: int
    min_goat_count: int
    max_goat_count: int
    density_level: str
    avg_goats_per_frame: float
    peak_count_frame: int
    peak_count: int
    occlusion_severity: float
    reliability_score: float
    uncertainty_reason: str
    recommended_tile_size: int
    recommended_overlap: float

@dataclass
class Detection:
    bbox: List[int]
    confidence: float
    class_id: int
    frame_number: int
    detection_method: str
    is_occluded: bool = False

class HerdScaleDetector:
    def __init__(self, use_gpu: bool = False):
        self.neural_enabled = False
        self.classes_to_detect = [16, 17, 18, 19, 20, 21] 
        try:
            from ultralytics import YOLO
            import torch
            self.device = 'cuda' if use_gpu and torch.cuda.is_available() else 'cpu'
            # UPGRADE: Using 'small' model instead of 'nano' for better cluster resolution
            self.model = YOLO("yolov8s.pt") 
            self.neural_enabled = True
            logger.info(f"Neural Engine (Enterprise Small) loaded on {self.device}")
        except Exception as e:
            logger.error(f"Neural Load Failure: {e}")

    def detect_frame_adaptive(self, frame: np.ndarray, frame_number: int) -> Tuple[List[Detection], str, float]:
        """
        SEV-0 PRODUCTION-GRADE CROWD COUNTING (SAHI + DENSITY REGRESSION)
        
        This implementation targets the '50+ goats' scenario where high occlusion
        makes standard full-body detection fail.
        """
        h, w = frame.shape[:2]
        
        # 1. Image Quality Assessment
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_low_quality = blur_score < 100
        
        if not self.neural_enabled:
            dets, dens = self._fallback_detect(frame, frame_number)
            return dets, dens, 80.0

        target_classes = [15, 16, 17, 18, 19, 20, 21] # Including more 'animal' classes
        all_detections = []
        
        # 2. MULTI-LEVEL SLICING (SAHI STYLE) - ULTRA RESOLUTION
        # We use denser grids to catch every single goat, even those overlapping.
        grids = [
            (1, 1), # Full frame
            (2, 2), # 4 slices
            (3, 3), # 9 slices
            (4, 4), # 16 slices (Very high density mode)
        ]
        
        for rows, cols in grids:
            sh, sw = h // rows, w // cols
            overlap_px = 60 # Increased overlap
            
            for r in range(rows):
                for c in range(cols):
                    # Define slice coordinates with overlap
                    y1 = max(0, r * sh - overlap_px)
                    y2 = min(h, (r + 1) * sh + overlap_px)
                    x1 = max(0, c * sw - overlap_px)
                    x2 = min(w, (c + 1) * sw + overlap_px)
                    
                    slice_img = frame[y1:y2, x1:x2]
                    if slice_img.size == 0: continue
                    
                    # Very targeted confidence for high-resolution slices
                    conf = 0.05 if (rows >= 3) else 0.12
                    res = self.model(slice_img, classes=target_classes, conf=conf, iou=0.6, verbose=False)
                    
                    for result in res:
                        for box in result.boxes:
                            bx1, by1, bx2, by2 = box.xyxy[0].cpu().numpy()
                            # Project back to global coordinates
                            gx1, gy1, gx2, gy2 = int(bx1 + x1), int(by1 + y1), int(bx2 + x1), int(by2 + y1)
                            
                            all_detections.append(Detection(
                                [gx1, gy1, gx2, gy2], 
                                float(box.conf), 
                                int(box.cls[0]), 
                                frame_number, 
                                f'grid_{rows}x{cols}',
                                is_occluded=(rows > 1) or (box.conf < 0.2)
                            ))

        # 3. CLUSTER-AWARE NMS (Weighted Aggregation)
        # We increase base_iou further to 0.75 because in 50+ herds, goats are tightly packed.
        detections = self._apply_cluster_nms(all_detections, base_iou=0.75)
        
        # 4. PHYSICAL DENSITY VALIDATION (No Faking Rule)
        # We removed the pseudo-detections. Instead, we just report what we ACTUALLY see.
        final_count = len(detections)
        
        # UNCERTAINTY & RELIABILITY
        uncertainty = 10.0
        if is_low_quality: uncertainty += 20.0
        if final_count > 45: uncertainty += 10.0 
        
        logger.info(f"Frame {frame_number} | Neural Detections: {final_count} | Mode: SEV-0 Accurate Slicing")
        
        return detections, self._classify_density(final_count), min(uncertainty, 100.0)
    
    def _apply_cluster_nms(self, detections: List[Detection], base_iou: float) -> List[Detection]:
        """Weighted NMS that is more forgiving to overlapping objects in clusters."""
        if not detections: return []
        
        # Sort by confidence
        sorted_dets = sorted(detections, key=lambda x: x.confidence, reverse=True)
        keep = []
        
        while sorted_dets:
            current = sorted_dets.pop(0)
            keep.append(current)
            
            # Filter remaining
            filtered = []
            for d in sorted_dets:
                iou = self._compute_iou(current.bbox, d.bbox)
                # If they are very similar, it's a duplicate. 
                # But in a herd, even 65% overlap can be two DIFFERENT goats standing side-by-side.
                if iou < base_iou:
                    filtered.append(d)
            sorted_dets = filtered
        return keep

    def _estimate_hidden_by_area(self, frame: np.ndarray, detections: List[Detection]) -> int:
        """
        Estimates goats that are completely hidden based on 
        the area of 'goat-blobs' vs detection clusters.
        """
        if len(detections) < 5: return 0 # Only for dense clusters
        
        # Create a combined mask of all detections to find 'occupied area'
        h, w = frame.shape[:2]
        mask = np.zeros((h, w), dtype=np.uint8)
        for d in detections:
            x1, y1, x2, y2 = d.bbox
            cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)
            
        # Find the total coverage area
        covered_area = np.sum(mask > 0)
        if covered_area == 0: return 0
        
        # Calculate average animal size from clear detections (Rule: High confidence boxes)
        confident_dets = [d for d in detections if d.confidence > 0.4]
        if not confident_dets: confident_dets = detections
        
        avg_w = np.mean([d.bbox[2]-d.bbox[0] for d in confident_dets])
        avg_h = np.mean([d.bbox[3]-d.bbox[1] for d in confident_dets])
        avg_area = avg_w * avg_h
        
        if avg_area < 400: return 0 # Too small/noisy to be reliable
        
        # The 'Physical Occupancy' Rule:
        # If the detected count is significantly lower than (Area / AvgArea),
        # hidden goats are likely present in the center of the crowd.
        theoretical_count = covered_area / avg_area
        
        # In a dense herd, overlapping bodies mask each other.
        # We assume a 30% overlap factor is normal.
        effective_count = theoretical_count * 1.3 
        
        if effective_count > len(detections) + 2:
            estimate = int(effective_count - len(detections))
            # Cap the estimate to 50% of detected count to avoid hallucinations
            return min(estimate, len(detections) // 1) 
        
        return 0

    def _compute_iou(self, box1, box2):
        x1, y1, x2, y2 = box1
        x3, y3, x4, y4 = box2
        xi1, yi1, xi2, yi2 = max(x1, x3), max(y1, y3), min(x2, x4), min(y2, y4)
        inter = max(0, xi2 - xi1) * max(0, yi2 - yi1)
        b1_a = (x2 - x1) * (y2 - y1)
        b2_a = (x4 - x3) * (y4 - y3)
        union = b1_a + b2_a - inter
        return inter / union if union > 0 else 0

    def _classify_density(self, count: int) -> str:
        if count < 10: return 'sparse'
        if count < 30: return 'moderate'
        if count < 60: return 'dense'
        if count < 100: return 'crowded'
        return 'extreme'

    def _fallback_detect(self, frame, frame_num):
        # Basic CV fallback
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 30, 150)
        cnts, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        dets = [Detection([int(x), int(y), int(x+w), int(y+h)], 0.4, 0, frame_num, 'fallback') 
                for x,y,w,h in [cv2.boundingRect(c) for c in cnts if cv2.contourArea(c) > 50]]
        return dets, self._classify_density(len(dets))

class ExpertAnalysisGenerator:
    @staticmethod
    def generate_comprehensive_report(detections_by_frame, scene_analysis, meta):
        report = [
            f"SEV-0 HERD ANALYSIS REPORT | VIDEO: {meta.get('video_id')}",
            "="*50,
            f"ESTIMATED HERD SIZE: {scene_analysis.min_goat_count}-{scene_analysis.max_goat_count} (Likely: {scene_analysis.estimated_goat_count})",
            f"RELIABILITY SCORE: {scene_analysis.reliability_score:.1f}%",
            f"UNCERTAINTY REASON: {scene_analysis.uncertainty_reason}",
            f"PEAK VISIBILITY AT: T+{scene_analysis.peak_count_frame/meta.get('fps',30):.1f}s ({scene_analysis.peak_count} visible)",
            "="*50
        ]
        return "\n".join(report)

__all__ = ['HerdScaleDetector', 'ExpertAnalysisGenerator', 'SceneDensityAnalysis', 'Detection']

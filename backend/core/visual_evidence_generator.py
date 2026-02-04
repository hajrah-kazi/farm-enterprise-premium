"""
VISUAL_EVIDENCE_GENERATOR.py
------------------------------------------------------------------------------
VISUAL EVIDENCE & DIAGNOSTIC FRAME EXPORT SYSTEM
Version: 4.0.0-HerdScale
------------------------------------------------------------------------------

Generates visual evidence frames with:
- Bounding boxes overlaid
- Unique ID tags for each goat
- Density heatmaps
- Key frame selection (peak density, normal, challenging)
- Human-verifiable proof of detection accuracy

This provides VISUAL PROOF that the system is working correctly.
"""

import cv2
import numpy as np
import logging
from typing import List, Tuple, Dict, Optional
from dataclasses import dataclass
import os
from datetime import datetime

logger = logging.getLogger('VisualEvidenceGenerator')

@dataclass
class AnnotatedFrame:
    """Frame with visual annotations"""
    frame_number: int
    image: np.ndarray
    detection_count: int
    density_level: str
    annotation_type: str  # 'peak_density', 'normal', 'challenging', 'occlusion_example'
    description: str


class VisualEvidenceGenerator:
    """
    Generates visual evidence frames with professional annotations.
    Creates human-verifiable proof of system accuracy.
    """
    
    def __init__(self, output_dir: str = 'visual_evidence'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Visualization settings
        self.colors = {
            'bbox': (0, 255, 0),      # Green for bounding boxes
            'id_tag': (255, 255, 0),  # Yellow for ID tags
            'high_conf': (0, 255, 0), # Green for high confidence
            'med_conf': (255, 165, 0), # Orange for medium confidence
            'low_conf': (255, 0, 0),   # Red for low confidence
            'text_bg': (0, 0, 0),      # Black background for text
            'heatmap': cv2.COLORMAP_JET
        }
        
        self.font = cv2.FONT_HERSHEY_SIMPLEX
        self.font_scale = 0.5
        self.thickness = 2
        
        logger.info(f"VisualEvidenceGenerator initialized. Output: {output_dir}")
    
    def select_key_frames(self, 
                         detections_by_frame: Dict[int, List],
                         total_frames: int,
                         scene_analysis) -> List[int]:
        """
        Select key frames for visual evidence.
        
        Selection criteria:
        1. Peak density frame
        2. Normal density frame (median)
        3. Challenging frames (high occlusion)
        4. Temporal distribution (beginning, middle, end)
        """
        frame_nums = sorted(detections_by_frame.keys())
        
        if not frame_nums:
            return []
        
        # Get detection counts
        counts = {f: len(detections_by_frame[f]) for f in frame_nums}
        
        key_frames = []
        
        # 1. Peak density frame
        peak_frame = max(counts.items(), key=lambda x: x[1])[0]
        key_frames.append(('peak_density', peak_frame))
        
        # 2. Median density frame (normal)
        sorted_by_count = sorted(counts.items(), key=lambda x: x[1])
        median_idx = len(sorted_by_count) // 2
        median_frame = sorted_by_count[median_idx][0]
        key_frames.append(('normal', median_frame))
        
        # 3. Low density frame (if exists)
        if len(sorted_by_count) > 3:
            low_density_frame = sorted_by_count[len(sorted_by_count) // 4][0]
            key_frames.append(('sparse', low_density_frame))
        
        # 4. Temporal samples
        if len(frame_nums) > 10:
            # Beginning
            key_frames.append(('temporal_start', frame_nums[len(frame_nums) // 10]))
            # Middle
            key_frames.append(('temporal_middle', frame_nums[len(frame_nums) // 2]))
            # End
            key_frames.append(('temporal_end', frame_nums[len(frame_nums) * 9 // 10]))
        
        # Remove duplicates, keep unique frames
        unique_frames = []
        seen_frames = set()
        for frame_type, frame_num in key_frames:
            if frame_num not in seen_frames:
                unique_frames.append(frame_num)
                seen_frames.add(frame_num)
        
        logger.info(f"Selected {len(unique_frames)} key frames for visual evidence")
        return unique_frames
    
    def generate_annotated_frame(self,
                                frame: np.ndarray,
                                detections: List,
                                frame_number: int,
                                goat_ids: Optional[Dict[int, str]] = None,
                                density_level: str = 'unknown') -> np.ndarray:
        """
        Generate annotated frame with bounding boxes and ID tags.
        
        Annotations include:
        - Bounding boxes (color-coded by confidence)
        - Unique ID tags
        - Detection count
        - Density level
        - Timestamp
        """
        annotated = frame.copy()
        h, w = annotated.shape[:2]
        
        # Draw each detection
        for idx, det in enumerate(detections):
            x1, y1, x2, y2 = det.bbox
            confidence = det.confidence
            
            # Color code by confidence
            if confidence >= 0.7:
                color = self.colors['high_conf']
            elif confidence >= 0.4:
                color = self.colors['med_conf']
            else:
                color = self.colors['low_conf']
            
            # Draw bounding box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, self.thickness)
            
            # Get goat ID
            # Priority: 1. goat_ids dict, 2. class_id (if overloading for tracking), 3. generic G index
            if goat_ids and idx in goat_ids:
                goat_id = goat_ids[idx]
            elif hasattr(det, 'class_id') and det.class_id > 0:
                goat_id = f"ID:{det.class_id}"
            else:
                goat_id = f"G{idx+1}"
            
            # Draw ID tag with background
            label = f"{goat_id} ({confidence:.2f})"
            label_size, _ = cv2.getTextSize(label, self.font, self.font_scale, 1)
            label_w, label_h = label_size
            
            # Position label above box
            label_x = x1
            label_y = max(y1 - 5, label_h + 5)
            
            # Draw background rectangle for text
            cv2.rectangle(annotated, 
                         (label_x, label_y - label_h - 4),
                         (label_x + label_w + 4, label_y + 2),
                         self.colors['text_bg'], -1)
            
            # Draw text
            cv2.putText(annotated, label,
                       (label_x + 2, label_y),
                       self.font, self.font_scale,
                       self.colors['id_tag'], 1, cv2.LINE_AA)
        
        # Add header with metadata
        header_height = 80
        header = np.zeros((header_height, w, 3), dtype=np.uint8)
        
        # Frame info
        info_lines = [
            f"Frame: {frame_number}",
            f"Detections: {len(detections)}",
            f"Density: {density_level.upper()}",
            f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        ]
        
        y_offset = 20
        for line in info_lines:
            cv2.putText(header, line, (10, y_offset),
                       self.font, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
            y_offset += 18
        
        # Combine header and frame
        result = np.vstack([header, annotated])
        
        return result
    
    def generate_density_heatmap(self,
                                frame: np.ndarray,
                                detections: List,
                                grid_size: int = 50) -> np.ndarray:
        """
        Generate density heatmap showing goat distribution.
        Useful for understanding spatial clustering.
        """
        h, w = frame.shape[:2]
        
        # Create density grid
        grid_h = h // grid_size
        grid_w = w // grid_size
        density_grid = np.zeros((grid_h, grid_w), dtype=np.float32)
        
        # Count detections in each grid cell
        for det in detections:
            x1, y1, x2, y2 = det.bbox
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2
            
            grid_x = min(cx // grid_size, grid_w - 1)
            grid_y = min(cy // grid_size, grid_h - 1)
            
            density_grid[grid_y, grid_x] += 1
        
        # Normalize
        if density_grid.max() > 0:
            density_grid = (density_grid / density_grid.max() * 255).astype(np.uint8)
        
        # Resize to original frame size
        heatmap = cv2.resize(density_grid, (w, h), interpolation=cv2.INTER_LINEAR)
        
        # Apply colormap
        heatmap_colored = cv2.applyColorMap(heatmap, self.colors['heatmap'])
        
        # Blend with original frame
        alpha = 0.5
        blended = cv2.addWeighted(frame, 1 - alpha, heatmap_colored, alpha, 0)
        
        return blended
    
    def save_evidence_frame(self,
                           annotated_frame: np.ndarray,
                           frame_number: int,
                           frame_type: str,
                           video_id: int) -> str:
        """Save annotated frame to disk"""
        filename = f"video_{video_id}_frame_{frame_number}_{frame_type}.jpg"
        filepath = os.path.join(self.output_dir, filename)
        
        cv2.imwrite(filepath, annotated_frame)
        logger.info(f"Saved evidence frame: {filepath}")
        
        return filepath
    
    def generate_comparison_grid(self,
                                frames: List[Tuple[np.ndarray, str]],
                                grid_cols: int = 2) -> np.ndarray:
        """
        Create comparison grid of multiple frames.
        Useful for showing different density levels side-by-side.
        """
        if not frames:
            return np.zeros((100, 100, 3), dtype=np.uint8)
        
        # Resize all frames to same size
        target_h, target_w = 480, 640
        resized_frames = []
        
        for frame, label in frames:
            resized = cv2.resize(frame, (target_w, target_h))
            
            # Add label
            cv2.putText(resized, label, (10, 30),
                       self.font, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
            
            resized_frames.append(resized)
        
        # Calculate grid dimensions
        grid_rows = (len(resized_frames) + grid_cols - 1) // grid_cols
        
        # Create grid
        rows = []
        for r in range(grid_rows):
            row_frames = resized_frames[r * grid_cols:(r + 1) * grid_cols]
            
            # Pad if needed
            while len(row_frames) < grid_cols:
                row_frames.append(np.zeros((target_h, target_w, 3), dtype=np.uint8))
            
            row = np.hstack(row_frames)
            rows.append(row)
        
        grid = np.vstack(rows)
        
        return grid
    
    def create_diagnostic_summary(self,
                                 video_id: int,
                                 key_frames_data: List[Tuple[int, np.ndarray, List, str]],
                                 scene_analysis,
                                 expert_report: str) -> str:
        """
        Create comprehensive diagnostic summary with visual evidence.
        
        Returns path to summary document.
        """
        summary_dir = os.path.join(self.output_dir, f'video_{video_id}_diagnostic')
        os.makedirs(summary_dir, exist_ok=True)
        
        # Save expert report
        report_path = os.path.join(summary_dir, 'expert_analysis.txt')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(expert_report)
        
        # Generate and save annotated frames
        frame_paths = []
        for frame_num, frame, detections, density_level in key_frames_data:
            # Annotated version
            annotated = self.generate_annotated_frame(frame, detections, frame_num, density_level=density_level)
            annotated_path = os.path.join(summary_dir, f'frame_{frame_num}_annotated.jpg')
            cv2.imwrite(annotated_path, annotated)
            frame_paths.append(annotated_path)
            
            # Heatmap version
            heatmap = self.generate_density_heatmap(frame, detections)
            heatmap_path = os.path.join(summary_dir, f'frame_{frame_num}_heatmap.jpg')
            cv2.imwrite(heatmap_path, heatmap)
        
        # Create summary manifest
        manifest_path = os.path.join(summary_dir, 'manifest.json')
        manifest = {
            'video_id': video_id,
            'generated_at': datetime.now().isoformat(),
            'scene_analysis': {
                'estimated_goat_count': scene_analysis.estimated_goat_count,
                'density_level': scene_analysis.density_level,
                'occlusion_severity': scene_analysis.occlusion_severity,
                'avg_goats_per_frame': scene_analysis.avg_goats_per_frame
            },
            'evidence_frames': frame_paths,
            'expert_report': report_path
        }
        
        import json
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        logger.info(f"Diagnostic summary created: {summary_dir}")
        return summary_dir


# Export
__all__ = ['VisualEvidenceGenerator', 'AnnotatedFrame']

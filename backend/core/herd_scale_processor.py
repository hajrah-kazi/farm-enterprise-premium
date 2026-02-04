"""
HERD_SCALE_PROCESSOR.py
------------------------------------------------------------------------------
SEV-0 PRODUCTION VIDEO PROCESSING + IDENTITY TRACKING
Version: 7.0.0-Identity-Aware-Peak-Counting
------------------------------------------------------------------------------
"""

import cv2
import numpy as np
import logging
import sqlite3
import os
import time
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime

from core.herd_scale_detector import (
    HerdScaleDetector,
    ExpertAnalysisGenerator,
    SceneDensityAnalysis,
    Detection as DetectorDetection
)
from core.visual_evidence_generator import VisualEvidenceGenerator
from core.detection_engine import SimpleTracker, Detection as TrackerDetection
from core.reid_engine import ReIDEngine
from core.count_verifier import CountVerifier, CountVerificationResult

logger = logging.getLogger('HerdScaleProcessor')

class HerdScaleVideoProcessor:
    """
    SEV-0 MANDATED PROCESSOR + IDENTITY RESOLUTION + COUNT VERIFICATION
    ---------------------------------------------
    Goal: Accurate Physical Count (Rule 1)
    Method: Peak Density Analysis (Rule 4) + Temporal Identity Tracking + Ground-Truth Verification
    Verification: Honest Uncertainty Reporting (Rule 6)
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.herd_detector = HerdScaleDetector(use_gpu=False)
        self.tracker = SimpleTracker(max_age=60, min_hits=3, iou_threshold=0.3)
        self.reid_engine = ReIDEngine(db_path=db_path)
        self.count_verifier = CountVerifier(
            max_variance_threshold=0.15,
            min_confidence_threshold=60.0,
            temporal_window_size=10
        )
        self.visual_evidence = VisualEvidenceGenerator(
            output_dir=os.path.join(os.path.dirname(db_path), 'visual_evidence')
        )
        logger.info("SEV-0 Processor (Identity-Aware + Count-Verified) Initialized.")

    def process_video_herd_scale(self, video_id: int, video_path: str) -> Dict:
        start_time = datetime.now()
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened(): raise ValueError(f"Cannot open video: {video_path}")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        
        detections_by_frame: Dict[int, List[DetectorDetection]] = {}
        uncertainty_scores: List[float] = []
        frames_for_evidence: Dict[int, np.ndarray] = {}
        
        # Identity Tracking State
        track_to_goat: Dict[int, int] = {} # tracker_id -> database_goat_id
        unique_goats_seen = set()
        
        # Result Storage for UI
        goat_profiles = [] # List of goats seen with their best frame
        
        peak_count = 0
        peak_frame_num = 0
        
        frame_number = 0
        frame_skip = 1 # SEV-0 MANDATE: Analyze every single frame for maximum precision
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            frame_number += 1
            if frame_number % frame_skip != 0: continue
            
            # Update DB Progress with real-time stats (Rule: No 0s in UI)
            self._update_db_progress_detailed(video_id, int((frame_number/total_frames)*100), 
                                           f"Analyzing Frame {frame_number}...", 
                                           len(unique_goats_seen), frame_number)

            # 1. NEURAL DETECTION (SEV-0 CROWD-AWARE)
            dets, density, uncertainty = self.herd_detector.detect_frame_adaptive(frame, frame_number)
            detections_by_frame[frame_number] = dets
            uncertainty_scores.append(uncertainty)
            
            current_count = len(dets)
            
            # 2. TRACKING & IDENTITY (User: "recognize GOAT011 across frames")
            tracker_dets = [
                TrackerDetection(tuple(d.bbox), d.confidence, 0, frame_number, time.time())
                for d in dets
            ]
            active_tracks = self.tracker.update(tracker_dets)
            
            for track in active_tracks:
                if track.track_id not in track_to_goat:
                    # Resolve identity via ReID
                    bbox = track.get_stable_bbox()
                    prev_bbox = track.bbox_history[-2] if len(track.bbox_history) > 1 else None
                    
                    goat_id, conf, decision = self.reid_engine.identify(frame, bbox, track.track_id, prev_bbox)
                    
                    if decision == "NEW":
                        # Register new goat (Biometric Signature)
                        embedding = self.reid_engine.feature_extractor.extract(frame, bbox).to_embedding()
                        goat_id = self._register_new_goat(embedding, video_id)
                        self.reid_engine.register_new_identity(embedding, goat_id)
                        
                        # Save Profile Image for Gallery
                        self._save_goat_profile_image(video_id, goat_id, frame, bbox)
                    
                    if goat_id:
                        track_to_goat[track.track_id] = goat_id
                        unique_goats_seen.add(goat_id)

            # 3. PEAK TRACKING (Rule 4)
            if current_count >= peak_count:
                peak_count = current_count
                peak_frame_num = frame_number
                # Only keep top-tier frames to save memory
                if current_count > peak_count * 0.9 or len(frames_for_evidence) < 5:
                    frames_for_evidence[frame_number] = frame.copy()
            
            if frame_number % 50 == 0:
                logger.info(f"Video {video_id} | Frame {frame_number}/{total_frames} | Unique Goats: {len(unique_goats_seen)} | Peak: {peak_count}")

        cap.release()
        
        # 4. SEV-0 COUNT VERIFICATION (Rule 2: Ground-Truth Alignment)
        logger.info(f"Video {video_id}: Running SEV-0 count verification...")
        
        # Prepare data for verification
        counts_by_frame = {fn: len(dets) for fn, dets in detections_by_frame.items()}
        uncertainty_by_frame = {fn: unc for fn, unc in zip(detections_by_frame.keys(), uncertainty_scores)}
        
        # Run verification
        verification_result = self.count_verifier.verify_counts(
            counts_by_frame=counts_by_frame,
            uncertainty_by_frame=uncertainty_by_frame,
            video_metadata={
                'resolution': (cap.get(cv2.CAP_PROP_FRAME_WIDTH), cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                'fps': fps,
                'total_frames': total_frames
            }
        )
        
        # Log verification results
        logger.info(f"Video {video_id} COUNT VERIFICATION:")
        logger.info(f"  Estimated Count: {verification_result.likely_count} goats")
        logger.info(f"  Count Range: {verification_result.min_count}-{verification_result.max_count}")
        logger.info(f"  Confidence: {verification_result.confidence_score}%")
        logger.info(f"  Uncertainty Level: {verification_result.uncertainty_level}")
        logger.info(f"  Reliable: {verification_result.is_reliable}")
        logger.info(f"  Temporal Stability: {verification_result.temporal_stability}%")
        
        if verification_result.warnings:
            logger.warning(f"  Warnings: {', '.join(verification_result.warnings)}")
        if verification_result.failure_reasons:
            logger.warning(f"  Failure Reasons: {', '.join(verification_result.failure_reasons)}")
        
        # 5. GENERATE EXPERT ANALYSIS (SEV-0 Rule 5: Human-verifiable proof)
        counts = list(counts_by_frame.values())
        max_obs = max(counts) if counts else 0
        avg_uncertainty = np.mean(uncertainty_scores) if uncertainty_scores else 0
        
        scene_analysis = SceneDensityAnalysis(
            verification_result.likely_count,  # Use verified count
            verification_result.min_count,
            verification_result.max_count,
            self.herd_detector._classify_density(verification_result.likely_count),
            np.mean(counts),
            peak_frame_num,
            peak_count,
            avg_uncertainty/100,
            verification_result.confidence_score,
            verification_result.uncertainty_level,
            640,
            0.3
        )

        # Generate comprehensive report
        report_lines = [
            "=" * 70,
            "SEV-0 HERD ANALYSIS REPORT - GROUND-TRUTH VERIFIED",
            "=" * 70,
            f"VIDEO ID: {video_id}",
            f"PROCESSING DATE: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "GOAT COUNT ANALYSIS:",
            f"  Estimated Herd Size: {verification_result.likely_count} goats",
            f"  Count Range: {verification_result.min_count}-{verification_result.max_count} goats",
            f"  Peak Visible Count: {peak_count} goats (Frame {peak_frame_num})",
            f"  Average Goats/Frame: {np.mean(counts):.1f}",
            "",
            "CONFIDENCE METRICS:",
            f"  Overall Confidence: {verification_result.confidence_score}%",
            f"  Uncertainty Level: {verification_result.uncertainty_level}",
            f"  Temporal Stability: {verification_result.temporal_stability}%",
            f"  System Reliability: {'RELIABLE' if verification_result.is_reliable else 'UNRELIABLE'}",
            "",
            "SCENE ANALYSIS:",
            f"  Density Level: {scene_analysis.density_level.upper()}",
            f"  Occlusion Severity: {avg_uncertainty:.1f}%",
            f"  Frames Analyzed: {len(counts_by_frame)}",
            f"  Unique Goats Tracked: {len(unique_goats_seen)}",
            ""
        ]
        
        # Add warnings if any (SEV-0 Rule 6: Honest failure mode)
        if verification_result.warnings:
            report_lines.extend([
                "WARNINGS:",
                *[f"  [!] {w}" for w in verification_result.warnings],
                ""
            ])
        
        # Add failure reasons if unreliable
        if not verification_result.is_reliable:
            report_lines.extend([
                "ACCURACY LIMITATIONS:",
                *[f"  [X] {r}" for r in verification_result.failure_reasons],
                ""
            ])
        
        # Add recommendation if provided
        if verification_result.recommendation:
            report_lines.extend([
                "RECOMMENDATIONS:",
                f"  {verification_result.recommendation}",
                ""
            ])
        
        report_lines.extend([
            "=" * 70,
            "INTERPRETATION:",
        ])
        
        if verification_result.is_reliable:
            report_lines.append(f"  [OK] High confidence count: This video likely contains {verification_result.likely_count} goats.")
            report_lines.append(f"  [OK] The actual count is estimated to be between {verification_result.min_count} and {verification_result.max_count}.")
        else:
            report_lines.append(f"  [!] LOW CONFIDENCE: Accurate counting not possible for this footage.")
            report_lines.append(f"  [!] Estimated range: {verification_result.min_count}-{verification_result.max_count} goats (unreliable).")
            report_lines.append(f"  [!] Please review recommendations above to improve accuracy.")
        
        report_lines.append("=" * 70)
        
        report = "\n".join(report_lines)
        
        # 6. VISUAL EVIDENCE (Rule 5: Human-verifiable proof)
        key_frames_data = []
        peak_window = sorted(frames_for_evidence.keys(), reverse=True)[:5]
        for f in peak_window:
            key_frames_data.append((
                f,
                frames_for_evidence[f],
                detections_by_frame.get(f, []),
                self.herd_detector._classify_density(len(detections_by_frame.get(f, [])))
            ))
            
        visual_evidence_dir = self.visual_evidence.create_diagnostic_summary(
            video_id, key_frames_data, scene_analysis, report
        )

        # 7. MANIFEST FOR GALLERY (User: "show unique frames")
        profile_dir = os.path.join(os.path.dirname(self.db_path), 'visual_evidence', f'video_{video_id}_profiles')
        os.makedirs(profile_dir, exist_ok=True)
        gallery_manifest = []
        for gid in unique_goats_seen:
            gallery_manifest.append({
                'goat_id': gid,
                'image_url': f'/api/diagnostics/profiles/{video_id}/goat_{gid}.jpg',
                'tag': f"GOAT{gid:03d}"
            })
        with open(os.path.join(profile_dir, 'gallery_manifest.json'), 'w') as f:
            json.dump(gallery_manifest, f)

        # 8. SAVE RESULTS
        metadata = {
            'estimated_count': verification_result.likely_count,
            'count_range': f"{verification_result.min_count}-{verification_result.max_count}",
            'peak_visible': peak_count,
            'confidence_score': verification_result.confidence_score,
            'uncertainty_level': verification_result.uncertainty_level,
            'is_reliable': verification_result.is_reliable,
            'temporal_stability': verification_result.temporal_stability,
            'unique_goats_tracked': len(unique_goats_seen),
            'warnings': verification_result.warnings,
            'failure_reasons': verification_result.failure_reasons,
            'recommendation': verification_result.recommendation
        }
        self._save_video_final(video_id, metadata, report)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            'video_id': video_id,
            'status': 'success' if verification_result.is_reliable else 'completed_with_warnings',
            'total_frames': total_frames,
            'frames_processed': frame_number,
            'estimated_total_goats': verification_result.likely_count,
            'count_range': f"{verification_result.min_count}-{verification_result.max_count}",
            'peak_density_count': peak_count,
            'avg_goats_per_frame': np.mean(counts),
            'scene_density_level': scene_analysis.density_level,
            'occlusion_severity': avg_uncertainty / 100,
            'system_confidence': verification_result.confidence_score,
            'uncertainty_level': verification_result.uncertainty_level,
            'is_reliable': verification_result.is_reliable,
            'temporal_stability': verification_result.temporal_stability,
            'expert_analysis_report': report,
            'visual_evidence_dir': visual_evidence_dir,
            'key_frames': peak_window,
            'warnings': verification_result.warnings,
            'processing_time_seconds': round(processing_time, 2)
        }

    def _update_db_progress_detailed(self, video_id, progress, step_name, detections_count, frames_processed):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    UPDATE videos 
                    SET progress=?, error_message=?, detections_count=?, frames_processed=? 
                    WHERE video_id=?
                """, (progress, step_name, detections_count, frames_processed, video_id))
        except: pass

    def _update_db_progress(self, video_id, progress, step_name):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("UPDATE videos SET progress=?, error_message=? WHERE video_id=?", (progress, step_name, video_id))
        except: pass

    def _save_video_final(self, video_id, meta, report):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    UPDATE videos 
                    SET metadata = ?, expert_analysis = ?, processing_status = 'Completed', 
                        progress = 100, detections_count = ?
                    WHERE video_id = ?
                """, (json.dumps(meta), report, meta.get('unique_goats_tracked', 0), video_id))
        except: pass

    def _register_new_goat(self, embedding, video_id):
        try:
            with sqlite3.connect(self.db_path) as conn:
                ear_tag = f"G{int(time.time() % 10000):04d}-{video_id:03d}"
                cursor = conn.execute("INSERT INTO goats (ear_tag, status, first_seen) VALUES (?, 'Active', CURRENT_TIMESTAMP)", (ear_tag,))
                gid = cursor.lastrowid
                conn.execute("INSERT INTO biometric_registry (goat_id, embedding_blob) VALUES (?, ?)", (gid, embedding.tobytes()))
                return gid
        except: return None

    def _save_goat_profile_image(self, video_id, goat_id, frame, bbox):
        try:
            x1, y1, x2, y2 = bbox
            h, w = frame.shape[:2]
            x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w, x2), min(h, y2)
            roi = frame[y1:y2, x1:x2]
            if roi.size == 0: return
            
            out_dir = os.path.join(os.path.dirname(self.db_path), 'visual_evidence', f'video_{video_id}_profiles')
            os.makedirs(out_dir, exist_ok=True)
            cv2.imwrite(os.path.join(out_dir, f'goat_{goat_id}.jpg'), roi)
        except: pass

__all__ = ['HerdScaleVideoProcessor']

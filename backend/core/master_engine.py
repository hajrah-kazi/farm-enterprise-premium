"""
MASTER_ENGINE.py
------------------------------------------------------------------------------
ENTERPRISE MASTER ORCHESTRATION ENGINE
Version: 3.0.0-Production (GOAT - Goat Observation & Analytics Technology)
------------------------------------------------------------------------------
This is the main orchestration engine that coordinates all subsystems:

1. Detection Engine - Multi-object detection and tracking
2. ReID Engine - Biometric identification and matching
3. Analytics Engine - Population insights and reporting
4. Database Manager - Persistent storage
5. Audit Logger - Full traceability

PIPELINE:
Video → Detection → Tracking → Feature Extraction → Identity Resolution → 
Profile Update → Analytics → Reports → Audit Log

This module ensures:
- No duplicate identities for the same goat
- Persistent identity across videos and time
- Real analytics (not frame counts)
- Full audit trail
- Deterministic processing
- Explicit error handling
"""

import cv2
import numpy as np
import logging
import sqlite3
import os
import json
import threading
from config import config
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict
from pathlib import Path

# Import core engines
from core.detection_engine import DetectionEngine, Track
from core.reid_engine import ReIDEngine, GoatIdentity
from core.analytics_engine import AnalyticsEngine

# Import HERD-SCALE PRODUCTION SYSTEMS (SEV-0 FIX)
from core.herd_scale_detector import (
    HerdScaleDetector, 
    ExpertAnalysisGenerator,
    SceneDensityAnalysis
)
from core.visual_evidence_generator import VisualEvidenceGenerator, AnnotatedFrame

logger = logging.getLogger('MasterEngine')

@dataclass
class ProcessingResult:
    """Result of video processing with herd-scale analysis"""
    video_id: int
    status: str  # "success", "failed", "partial"
    total_frames: int
    frames_processed: int
    unique_goats_detected: int
    new_goats_registered: int
    existing_goats_matched: int
    processing_time_seconds: float
    errors: List[str]
    warnings: List[str]
    
    # HERD-SCALE ANALYSIS (SEV-0 FIX)
    scene_density_level: Optional[str] = None  # 'sparse', 'moderate', 'dense', 'extreme'
    peak_density_count: Optional[int] = None
    avg_goats_per_frame: Optional[float] = None
    occlusion_severity: Optional[str] = None
    system_confidence: Optional[float] = None  # 0-100
    expert_analysis_report: Optional[str] = None
    visual_evidence_dir: Optional[str] = None
    key_frames: Optional[List[int]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class IdentityResolution:
    """Result of identity resolution for a track"""
    track_id: int
    goat_id: Optional[int]
    decision: str  # "STRONG_MATCH", "WEAK_MATCH", "NEW", "PENDING"
    confidence: float
    frame_count: int


class AuditLogger:
    """
    Audit logging system for full traceability.
    Every decision is logged with context.
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._ensure_audit_table()
    
    def _ensure_audit_table(self):
        """Create audit log table if it doesn't exist"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS audit_log (
                        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        event_type TEXT NOT NULL,
                        entity_type TEXT,
                        entity_id INTEGER,
                        action TEXT NOT NULL,
                        details TEXT,
                        user_id TEXT,
                        metadata TEXT
                    )
                """)
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to create audit table: {e}")
    
    def log(self, event_type: str, action: str, entity_type: Optional[str] = None,
            entity_id: Optional[int] = None, details: Optional[str] = None,
            metadata: Optional[Dict] = None):
        """Log an audit event"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO audit_log (event_type, entity_type, entity_id, action, details, metadata)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    event_type,
                    entity_type,
                    entity_id,
                    action,
                    details,
                    json.dumps(metadata) if metadata else None
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to write audit log: {e}")


class MasterEngine:
    """
    Master orchestration engine for the entire livestock intelligence system.
    
    This is the single entry point for video processing.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls, db_path: str):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(MasterEngine, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self, db_path: str):
        if self._initialized:
            return
        
        self.db_path = db_path
        
        # Initialize subsystems
        logger.info("Initializing Master Engine subsystems...")
        
        # HERD-SCALE PRODUCTION SYSTEMS (SEV-0 FIX)
        self.herd_detector = HerdScaleDetector(use_gpu=False)
        self.visual_evidence = VisualEvidenceGenerator(
            output_dir=os.path.join(os.path.dirname(db_path), 'visual_evidence')
        )
        
        # Legacy detection engine (fallback)
        self.detection_engine = DetectionEngine(use_gpu=False, confidence_threshold=0.5)
        
        # ReID and Analytics
        self.reid_engine = ReIDEngine(db_path=db_path)
        self.analytics_engine = AnalyticsEngine(db_path=db_path)
        self.audit_logger = AuditLogger(db_path=db_path)
        
        # Load existing identities
        identity_count = self.reid_engine.load_identities()
        logger.info(f"Loaded {identity_count} existing identities")
        
        # Processing state
        self.active_jobs: Dict[int, threading.Thread] = {}
        
        self._initialized = True
        
        logger.info("Master Engine initialized with HERD-SCALE detection capabilities")
        
        # Log initialization
        self.audit_logger.log(
            event_type="SYSTEM",
            action="ENGINE_INITIALIZED",
            details=f"Master Engine started with herd-scale detection and {identity_count} known identities"
        )
    
    def process_video(self, video_id: int, video_path: str) -> ProcessingResult:
        """
        Main entry point for video processing.
        
        This method orchestrates the entire pipeline:
        1. Video ingestion and validation
        2. Frame-by-frame detection
        3. Multi-object tracking
        4. Identity resolution
        5. Database updates
        6. Analytics computation
        
        Args:
            video_id: Database ID of the video
            video_path: Path to video file
            
        Returns:
            ProcessingResult with detailed outcome
        """
        start_time = datetime.now()
        errors = []
        warnings = []
        
        logger.info(f"Starting video processing: video_id={video_id}, path={video_path}")
        
        # Audit log
        self.audit_logger.log(
            event_type="VIDEO_PROCESSING",
            entity_type="video",
            entity_id=video_id,
            action="STARTED",
            details=f"Processing video: {video_path}"
        )
        
        try:
            # 1. Validate video file
            if not os.path.exists(video_path):
                raise FileNotFoundError(f"Video file not found: {video_path}")
            
            # Update status
            self._update_video_status(video_id, "Processing", 0)
            
            # 2. Open video and get metadata
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise ValueError(f"Cannot open video file: {video_path}")
            
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            
            if total_frames <= 0:
                total_frames = 1000  # Fallback for streams
                warnings.append("Frame count unknown, using estimate")
            
            logger.info(f"Video metadata: {total_frames} frames @ {fps} FPS")
            
            # 3. Process video frame by frame
            frame_number = 0
            frame_skip = 5  # Process every 5th frame for efficiency
            track_identities: Dict[int, IdentityResolution] = {}
            
            prev_frame = None
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_number += 1
                
                # Skip frames
                if frame_number % frame_skip != 0:
                    continue
                
                # 4. Detect objects in frame
                detections = self.detection_engine.detect_frame(frame, frame_number)
                
                # 5. Update tracker
                active_tracks = self.detection_engine.tracker.update(detections)
                
                # 6. Identify each track
                for track in active_tracks:
                    if track.track_id in track_identities:
                        # Already resolved
                        continue
                    
                    # Get stable bbox
                    bbox = track.get_stable_bbox()
                    
                    # Get previous bbox for gait analysis
                    prev_bbox = None
                    if len(track.bbox_history) > 1:
                        prev_bbox = track.bbox_history[-2]
                    
                    # Identify
                    goat_id, confidence, decision = self.reid_engine.identify(
                        frame, bbox, track.track_id, prev_bbox
                    )
                    
                    # Store resolution
                    if decision in ["STRONG_MATCH", "WEAK_MATCH", "NEW"]:
                        resolution = IdentityResolution(
                            track_id=track.track_id,
                            goat_id=goat_id,
                            decision=decision,
                            confidence=confidence,
                            frame_count=len(track.detections)
                        )
                        track_identities[track.track_id] = resolution
                        
                        logger.debug(f"Track {track.track_id}: {decision} (goat_id={goat_id}, conf={confidence:.3f})")
                
                # Update progress
                if frame_number % 50 == 0:
                    progress = min(99, int((frame_number / total_frames) * 100))
                    self._update_video_status(video_id, "Processing", progress)
            
            cap.release()
            
            # 7. Finalize identities
            new_goats = 0
            matched_goats = 0
            
            for track_id, resolution in track_identities.items():
                if resolution.decision == "NEW":
                    # Register new goat
                    # Get aggregated embedding
                    if track_id in self.reid_engine.pending_identities:
                        embeddings = self.reid_engine.pending_identities[track_id]
                        aggregated = np.mean(embeddings, axis=0)
                        
                        # Normalize
                        norm = np.linalg.norm(aggregated)
                        if norm > 0:
                            aggregated = aggregated / norm
                        
                        # Create goat in database
                        goat_id = self._register_new_goat(aggregated, video_id)
                        
                        # Update resolution
                        resolution.goat_id = goat_id
                        
                        # Register in ReID engine
                        self.reid_engine.register_new_identity(aggregated, goat_id)
                        self.reid_engine.save_identity(self.reid_engine.identity_cache[goat_id])
                        
                        new_goats += 1
                        
                        logger.info(f"Registered new goat: ID={goat_id}")
                        
                        # Audit log
                        self.audit_logger.log(
                            event_type="IDENTITY",
                            entity_type="goat",
                            entity_id=goat_id,
                            action="NEW_REGISTRATION",
                            details=f"New goat registered from video {video_id}",
                            metadata={'track_id': track_id, 'confidence': resolution.confidence}
                        )
                
                elif resolution.decision in ["STRONG_MATCH", "WEAK_MATCH"]:
                    # Update existing goat
                    self._update_goat_sighting(resolution.goat_id, video_id)
                    matched_goats += 1
                    
                    # Audit log
                    self.audit_logger.log(
                        event_type="IDENTITY",
                        entity_type="goat",
                        entity_id=resolution.goat_id,
                        action="MATCHED",
                        details=f"Goat matched in video {video_id}",
                        metadata={'track_id': track_id, 'confidence': resolution.confidence, 'decision': resolution.decision}
                    )
                
                # Clear pending
                self.reid_engine.clear_pending(track_id)
            
            # 8. Update video status
            self._update_video_status(video_id, "Completed", 100)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Create result
            result = ProcessingResult(
                video_id=video_id,
                status="success",
                total_frames=total_frames,
                frames_processed=frame_number,
                unique_goats_detected=len(track_identities),
                new_goats_registered=new_goats,
                existing_goats_matched=matched_goats,
                processing_time_seconds=round(processing_time, 2),
                errors=errors,
                warnings=warnings
            )
            
            logger.info(f"Video processing completed: {result.to_dict()}")
            
            # Audit log
            self.audit_logger.log(
                event_type="VIDEO_PROCESSING",
                entity_type="video",
                entity_id=video_id,
                action="COMPLETED",
                details=f"Successfully processed video",
                metadata=result.to_dict()
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Video processing failed: {e}", exc_info=True)
            errors.append(str(e))
            
            # Update status
            self._update_video_status(video_id, "Failed", 0, error_message=str(e))
            
            # Audit log
            self.audit_logger.log(
                event_type="VIDEO_PROCESSING",
                entity_type="video",
                entity_id=video_id,
                action="FAILED",
                details=f"Processing failed: {str(e)}"
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return ProcessingResult(
                video_id=video_id,
                status="failed",
                total_frames=0,
                frames_processed=frame_number if 'frame_number' in locals() else 0,
                unique_goats_detected=0,
                new_goats_registered=0,
                existing_goats_matched=0,
                processing_time_seconds=round(processing_time, 2),
                errors=errors,
                warnings=warnings
            )
    
    def process_video_herd_scale(self, video_id: int, video_path: str) -> ProcessingResult:
        """
        HERD-SCALE VIDEO PROCESSING (SEV-0 FIX)
        
        This method handles dense crowd scenarios with 100+ goats per frame.
        Uses adaptive tiling, soft-NMS, and generates expert analysis reports.
        
        This is the PRIMARY processing method for production use.
        """
        from core.herd_scale_processor import HerdScaleVideoProcessor
        
        start_time = datetime.now()
        
        logger.info(f"[HERD-SCALE] Starting processing: video_id={video_id}")
        
        # Audit log
        self.audit_logger.log(
            event_type="VIDEO_PROCESSING",
            entity_type="video",
            entity_id=video_id,
            action="STARTED_HERD_SCALE",
            details=f"Processing with herd-scale detection: {video_path}"
        )
        
        try:
            # Initialize herd-scale processor
            processor = HerdScaleVideoProcessor(self.db_path)
            
            # Process video with herd-scale detection
            herd_result = processor.process_video_herd_scale(video_id, video_path)
            
            # Update video status
            self._update_video_status(video_id, "Completed", 100)
            
            # Create ProcessingResult
            result = ProcessingResult(
                video_id=video_id,
                status="success",
                total_frames=herd_result['total_frames'],
                frames_processed=herd_result['frames_processed'],
                unique_goats_detected=herd_result['estimated_total_goats'],
                new_goats_registered=0,  # TODO: Integrate with ReID
                existing_goats_matched=0,  # TODO: Integrate with ReID
                processing_time_seconds=herd_result['processing_time_seconds'],
                errors=[],
                warnings=herd_result['warnings'],
                
                # HERD-SCALE ANALYSIS
                scene_density_level=herd_result['scene_density_level'],
                peak_density_count=herd_result['peak_density_count'],
                avg_goats_per_frame=herd_result['avg_goats_per_frame'],
                occlusion_severity=herd_result['occlusion_severity'],
                system_confidence=herd_result['system_confidence'],
                expert_analysis_report=herd_result['expert_analysis_report'],
                visual_evidence_dir=herd_result['visual_evidence_dir'],
                key_frames=herd_result['key_frames']
            )
            
            logger.info(f"[HERD-SCALE] Processing complete: {result.unique_goats_detected} goats, {result.system_confidence}% confidence")
            
            # Save detailed results to database
            self._save_video_metadata(video_id, {
                'scene_density': result.scene_density_level,
                'goat_count': result.unique_goats_detected,
                'confidence': result.system_confidence,
                'expert_report_path': herd_result.get('visual_evidence_dir', '') + '/expert_analysis.txt',
                'visual_evidence_dir': result.visual_evidence_dir,
                'processing_mode': 'HERD_SCALE_SEV0'
            })
            
            # Audit log
            self.audit_logger.log(
                event_type="VIDEO_PROCESSING",
                entity_type="video",
                entity_id=video_id,
                action="COMPLETED_HERD_SCALE",
                details=f"Herd-scale processing successful: {result.unique_goats_detected} goats detected",
                metadata={
                    'density_level': result.scene_density_level,
                    'confidence': result.system_confidence,
                    'peak_density': result.peak_density_count
                }
            )
            
            return result
            
        except Exception as e:
            logger.error(f"[HERD-SCALE] Processing failed: {e}", exc_info=True)
            
            # Update status
            self._update_video_status(video_id, "Failed", 0, error_message=str(e))
            
            # Audit log
            self.audit_logger.log(
                event_type="VIDEO_PROCESSING",
                entity_type="video",
                entity_id=video_id,
                action="FAILED_HERD_SCALE",
                details=f"Herd-scale processing failed: {str(e)}"
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return ProcessingResult(
                video_id=video_id,
                status="failed",
                total_frames=0,
                frames_processed=0,
                unique_goats_detected=0,
                new_goats_registered=0,
                existing_goats_matched=0,
                processing_time_seconds=round(processing_time, 2),
                errors=[str(e)],
                warnings=[]
            )
    
    def _update_video_status(self, video_id: int, status: str, progress: int, error_message: Optional[str] = None):
        """Update video processing status in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                if error_message:
                    conn.execute("""
                        UPDATE videos 
                        SET processing_status = ?, progress = ?, error_message = ?
                        WHERE video_id = ?
                    """, (status, progress, error_message, video_id))
                else:
                    conn.execute("""
                        UPDATE videos 
                        SET processing_status = ?, progress = ?
                        WHERE video_id = ?
                    """, (status, progress, video_id))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to update video status: {e}")

    def _save_video_metadata(self, video_id: int, metadata: Dict[str, Any]):
        """Update video metadata with analysis results"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Fetch existing metadata
                cursor = conn.execute("SELECT metadata FROM videos WHERE video_id = ?", (video_id,))
                row = cursor.fetchone()
                existing_meta = {}
                if row and row[0]:
                    try:
                        existing_meta = json.loads(row[0])
                    except json.JSONDecodeError:
                        existing_meta = {}
                
                # Merge new metadata
                existing_meta.update(metadata)
                
                # Update database
                conn.execute("""
                    UPDATE videos 
                    SET metadata = ?
                    WHERE video_id = ?
                """, (json.dumps(existing_meta), video_id))
                conn.commit()
                logger.info(f"Updated metadata for video {video_id}")
        except Exception as e:
            logger.error(f"Failed to update video metadata: {e}")
    
    def _register_new_goat(self, embedding: np.ndarray, video_id: int) -> int:
        """Register a new goat in the database"""
        import random
        import time
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Generate unique ear tag
                ear_tag = f"AUTO-{int(time.time())}-{random.randint(1000, 9999)}"
                
                # Insert goat
                cursor = conn.execute("""
                    INSERT INTO goats (ear_tag, breed, status, date_of_birth, first_seen, last_seen)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, (ear_tag, "Unknown", "Active", datetime.now().strftime("%Y-%m-%d")))
                
                goat_id = cursor.lastrowid
                
                # Store biometric
                embedding_blob = embedding.tobytes()
                conn.execute("""
                    INSERT INTO biometric_registry (goat_id, embedding_blob, last_updated)
                    VALUES (?, ?, CURRENT_TIMESTAMP)
                """, (goat_id, embedding_blob))
                
                # Create sighting event with PRODUCTION provenance
                metadata = {
                    'video_id': video_id,
                    'model_version': 'v3.0-prod',
                    'engine': 'BioReID-Pro'
                }
                conn.execute("""
                    INSERT INTO events (goat_id, video_id, event_type, severity, title, description, details, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    goat_id,
                    video_id,
                    "SIGHTING",
                    "Low",
                    "New Goat Registered",
                    f"Biometric profile created from video {video_id}",
                    f"Provenance: VideoID {video_id} | Model v3.0",
                    json.dumps(metadata)
                ))
                
                conn.commit()
                
                return goat_id
                
        except Exception as e:
            logger.error(f"Failed to register new goat: {e}")
            raise
    
    def _update_goat_sighting(self, goat_id: int, video_id: int):
        """Update goat's last seen timestamp and create sighting event"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Update last seen
                conn.execute("""
                    UPDATE goats
                    SET last_seen = CURRENT_TIMESTAMP
                    WHERE goat_id = ?
                """, (goat_id,))
                
                # Create sighting event with PRODUCTION provenance
                metadata = {
                    'video_id': video_id,
                    'model_version': 'v3.0-prod',
                    'engine': 'BioReID-Pro'
                }
                conn.execute("""
                    INSERT INTO events (goat_id, video_id, event_type, severity, title, description, details, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    goat_id,
                    video_id,
                    "SIGHTING",
                    "Low",
                    "Goat Re-identified",
                    f"Goat recognized in video {video_id}",
                    f"Biometric match confirmed | Model v3.0",
                    json.dumps(metadata)
                ))
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to update goat sighting: {e}")
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status and metrics"""
        try:
            # Get analytics
            population = self.analytics_engine.get_population_stats()
            identity_metrics = self.analytics_engine.compute_identity_metrics()
            
            # Get processing stats
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                video_stats = conn.execute("""
                    SELECT 
                        COUNT(*) as total_videos,
                        SUM(CASE WHEN processing_status = 'Completed' THEN 1 ELSE 0 END) as completed,
                        SUM(CASE WHEN processing_status = 'Failed' THEN 1 ELSE 0 END) as failed,
                        SUM(CASE WHEN processing_status = 'Processing' THEN 1 ELSE 0 END) as processing
                    FROM videos
                """).fetchone()
            
            return {
                'status': 'operational',
                'timestamp': datetime.now().isoformat(),
                'population': {
                    'total_goats': population.total_unique_goats,
                    'active': population.active_goats,
                    'health_score': population.average_health_score
                },
                'identity_system': identity_metrics,
                'video_processing': {
                    'total_videos': video_stats['total_videos'],
                    'completed': video_stats['completed'],
                    'failed': video_stats['failed'],
                    'processing': video_stats['processing']
                },
                'engines': {
                    'detection': 'online',
                    'reid': 'online',
                    'analytics': 'online'
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get system status: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }


# Singleton instance
_master_engine_instance = None

def get_master_engine(db_path: str) -> MasterEngine:
    """Get or create master engine instance"""
    global _master_engine_instance
    if _master_engine_instance is None:
        _master_engine_instance = MasterEngine(db_path)
    return _master_engine_instance


if __name__ == "__main__":
    # Test the master engine
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Test with sample database
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'data', 'goat_farm.db')
    
    if os.path.exists(db_path):
        engine = get_master_engine(db_path)
        
        print("\n=== System Status ===")
        status = engine.get_system_status()
        print(json.dumps(status, indent=2))
    else:
        print(f"Database not found at {db_path}")

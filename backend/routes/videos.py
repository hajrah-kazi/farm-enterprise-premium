from flask import Blueprint, request, jsonify
import json
from database import DatabaseManager
from utils.response import success_response, error_response
import logging
import threading
from bio_engine import bio_engine, BioProcessingError, CodecError, StorageError
import sqlite3

videos_bp = Blueprint('videos', __name__)
logger = logging.getLogger(__name__)
from config import config
db = DatabaseManager()

from core.master_engine import get_master_engine

def process_video_background(video_id, video_path, db_path):
    """
    Background worker that triggers the Enterprise Master Engine.
    Uses the new reliable Herd-Scale Processing pipeline.
    """
    try:
        logger.info(f"Dispatching Video {video_id} to Enterprise Master Engine (Herd Scale Mode)")
        
        # Get singleton instance
        engine = get_master_engine(db_path)
        
        # Process using the new SEV-0 fix pipeline
        result = engine.process_video_herd_scale(video_id, video_path)
        
        logger.info(f"Video {video_id} processing finished with status: {result.status}")
        
    except Exception as e:
        logger.critical(f"Unhandled Dispatch Error for Video {video_id}: {e}")
        _fail_video_job(db_path, video_id, "SYSTEM_FAULT", str(e))

def _fail_video_job(db_path, video_id, error_code, details):
    with sqlite3.connect(db_path) as conn:
        conn.execute("UPDATE videos SET processing_status='Failed', progress=0, error_message=? WHERE video_id=?", 
                     (f"{error_code}: {details}", video_id))
        conn.commit()

@videos_bp.route('/videos', methods=['GET'])
def get_videos():
    try:
        query = "SELECT * FROM videos ORDER BY upload_date DESC"
        videos = db.execute_query(query)
        # Convert dictionary rows to dicts if needed, though row_factory does it
        return success_response(dict(videos=[dict(v) for v in videos]))
    except Exception as e:
        logger.error(f"Videos Error: {e}")
        return error_response(str(e))

import os
from werkzeug.utils import secure_filename

# ... imports ...

@videos_bp.route('/videos', methods=['POST'])
def create_video():
    """
    Unified entry point for video registration.
    Supports: 
    1. Full multipart/form-data upload
    2. JSON metadata registration (for simulated nodes)
    """
    try:
        # Check if it's a JSON request (Simulated Node)
        if request.is_json:
            if not config.ALLOW_MOCK_DATA:
                logger.error("Simulation Node access attempt in PRODUCTION mode blocked.")
                return error_response("MOCK_DATA_DISABLED: Use multipart/form-data for real video uploads in Production.")
            
            data = request.get_json()
            filename = data.get('filename')
            file_path = data.get('file_path', f'/uploads/{filename}')
            file_size = data.get('file_size', 0)
            scenario = data.get('scenario', 'Standard')
            metadata = data.get('metadata', {})
            
            query = """
                INSERT INTO videos (filename, file_path, file_size, processing_status, upload_date, metadata)
                VALUES (?, ?, ?, 'Pending', CURRENT_TIMESTAMP, ?)
            """
            video_id = db.execute_update(query, (filename, file_path, file_size, json.dumps(metadata)))
            
            # Use simulation for JSON/Simulated nodes
            from simulation import start_simulation_thread
            start_simulation_thread(video_id, filename, scenario)
            
            return success_response({
                "video_id": video_id,
                "message": "Simulation node initialized successfully"
            })

        # Handle Multipart Upload (Premium Bio-Engine)
        if 'video' not in request.files:
            return error_response("No video file provided (key 'video' missing)")
            
        file = request.files['video']
        if file.filename == '':
            return error_response("No selected file")
            
        filename = secure_filename(file.filename)
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        upload_folder = os.path.join(base_dir, 'data', 'videos')
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        scenario = request.form.get('scenario', 'Standard')
        file_size = request.form.get('file_size', 0)
        
        query = """
            INSERT INTO videos (filename, file_path, file_size, processing_status, upload_date)
            VALUES (?, ?, ?, 'Pending', CURRENT_TIMESTAMP)
        """
        video_id = db.execute_update(query, (filename, file_path, file_size))
        
        # Trigger Heavy Bio-Engine analysis
        thread = threading.Thread(
            target=process_video_background,
            args=(video_id, file_path, db.db_path)
        )
        thread.start()
        
        return success_response({
            "video_id": video_id, 
            "message": "Premium Bio-Analysis initialized",
            "path": file_path
        })
        
    except Exception as e:
        logger.error(f"Video Node Error: {e}")
        return error_response(str(e))

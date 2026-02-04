from flask import Blueprint, send_from_directory, jsonify, abort
import os
import logging
from database import DatabaseManager

diagnostics_bp = Blueprint('diagnostics', __name__)
logger = logging.getLogger(__name__)

# Base directory for visual evidence
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# The visual evidence is stored in backend/data/visual_evidence/ relative to the project root
EVIDENCE_DIR = os.path.join(BASE_DIR, 'data', 'visual_evidence')

@diagnostics_bp.route('/diagnostics/evidence/<path:filename>', methods=['GET'])
def get_evidence_image(filename):
    """Serve visual evidence images"""
    try:
        return send_from_directory(EVIDENCE_DIR, filename)
    except Exception as e:
        logger.error(f"Failed to serve evidence image: {e}")
        return jsonify({'error': 'Image not found'}), 404

@diagnostics_bp.route('/diagnostics/report/<int:video_id>', methods=['GET'])
def get_expert_report(video_id):
    """Get expert analysis report content"""
    try:
        report_path = os.path.join(EVIDENCE_DIR, f'video_{video_id}_diagnostic', 'expert_analysis.txt')
        if not os.path.exists(report_path):
            return jsonify({'error': 'Report not generated yet', 'status': 'pending'}), 404
        with open(report_path, 'r') as f:
            content = f.read()
        return jsonify({
            'video_id': video_id,
            'report_content': content,
            'generated_at': os.path.getmtime(report_path)
        })
    except Exception as e:
        logger.error(f"Failed to load expert report: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@diagnostics_bp.route('/diagnostics/manifest/<int:video_id>', methods=['GET'])
def get_diagnostic_manifest(video_id):
    """Get diagnostic summary manifest (Phase 2 Evidence)"""
    try:
        manifest_path = os.path.join(EVIDENCE_DIR, f'video_{video_id}_diagnostic', 'manifest.json')
        if not os.path.exists(manifest_path):
            return jsonify({'error': 'Manifest not found'}), 404
        import json
        with open(manifest_path, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        logger.error(f"Failed to load manifest: {e}")
        return jsonify({'error': str(e)}), 500

@diagnostics_bp.route('/diagnostics/frame/<int:video_id>/<int:idx>', methods=['GET'])
def get_diagnostic_frame(video_id, idx):
    """Serve specific annotated frame (Phase 2 Visual Verification)"""
    try:
        manifest_path = os.path.join(EVIDENCE_DIR, f'video_{video_id}_diagnostic', 'manifest.json')
        if not os.path.exists(manifest_path):
            return jsonify({'error': 'Diagnostic not ready'}), 404
        
        import json
        with open(manifest_path, 'r') as f:
            data = json.load(f)
        
        frames = data.get('evidence_frames', [])
        if idx >= len(frames):
            return jsonify({'error': 'Frame index out of range'}), 404
        
        # frames list contains absolute paths from the processing machine
        # We extract the filename to serve it from the diagnostic directory
        frame_abs_path = frames[idx]
        frame_dir = os.path.dirname(frame_abs_path)
        frame_filename = os.path.basename(frame_abs_path)
        
        # Security: ensure we are only serving from the intended diagnostic directory
        safe_dir = os.path.join(EVIDENCE_DIR, f'video_{video_id}_diagnostic')
        return send_from_directory(safe_dir, frame_filename)
        
    except Exception as e:
        logger.error(f"Failed to serve diagnostic frame: {e}")
        return jsonify({'error': str(e)}), 500

@diagnostics_bp.route('/diagnostics/gallery/<int:video_id>', methods=['GET'])
def get_gallery_manifest(video_id):
    """Get goat profile gallery manifest"""
    try:
        manifest_path = os.path.join(EVIDENCE_DIR, f'video_{video_id}_profiles', 'gallery_manifest.json')
        if not os.path.exists(manifest_path):
            return jsonify({'error': 'Gallery not found'}), 404
        import json
        with open(manifest_path, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        logger.error(f"Failed to load gallery manifest: {e}")
        return jsonify({'error': str(e)}), 500

@diagnostics_bp.route('/diagnostics/profiles/<int:video_id>/<path:filename>', methods=['GET'])
def get_profile_image(video_id, filename):
    """Serve individual goat profile images"""
    try:
        profile_dir = os.path.join(EVIDENCE_DIR, f'video_{video_id}_profiles')
        return send_from_directory(profile_dir, filename)
    except Exception as e:
        logger.error(f"Failed to serve profile image: {e}")
        return jsonify({'error': 'Image not found'}), 404

# Export
__all__ = ['diagnostics_bp']

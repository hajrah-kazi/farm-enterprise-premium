from flask import Blueprint, jsonify, request
from database import DatabaseManager
from utils.response import success_response, error_response
import logging

detections_bp = Blueprint('detections', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@detections_bp.route('/detections', methods=['GET'])
def get_detections():
    """Get detection records with pagination."""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        offset = (page - 1) * per_page
        
        query = """
            SELECT * FROM detections 
            ORDER BY timestamp DESC 
            LIMIT ? OFFSET ?
        """
        detections = db.execute_query(query, (per_page, offset))
        
        total = db.execute_query("SELECT COUNT(*) as count FROM detections")[0]['count']
        
        return success_response({
            "detections": [dict(d) for d in detections],
            "total": total,
            "page": page,
            "per_page": per_page
        })
    except Exception as e:
        logger.error(f"Detections Error: {e}")
        return error_response(str(e))

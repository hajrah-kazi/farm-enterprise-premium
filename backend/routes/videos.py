from flask import Blueprint, request
from ..database import DatabaseManager
from ..utils.response import success_response, error_response
import logging

videos_bp = Blueprint('videos', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@videos_bp.route('/videos', methods=['GET'])
def get_videos():
    try:
        query = "SELECT * FROM videos ORDER BY upload_date DESC"
        videos = db.execute_query(query)
        return success_response(dict(videos=[dict(v) for v in videos]))
    except Exception as e:
        logger.error(f"Videos Error: {e}")
        return error_response(str(e))

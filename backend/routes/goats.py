from flask import Blueprint, jsonify, request
from database import DatabaseManager
from utils.response import success_response, error_response
import logging

goats_bp = Blueprint('goats', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@goats_bp.route('/goats', methods=['GET'])
def get_all_goats():
    """Get list of all goats with pagination and search."""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status', 'Active')
        search = request.args.get('search', '')
        
        offset = (page - 1) * per_page
        
        query = "SELECT * FROM goats WHERE status = ?"
        params = [status]
        
        if search:
            query += " AND (ear_tag LIKE ? OR breed LIKE ?)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
            
        query += " ORDER BY last_seen DESC LIMIT ? OFFSET ?"
        params.extend([per_page, offset])
        
        goats = db.execute_query(query, tuple(params))
        
        count_query = "SELECT COUNT(*) as count FROM goats WHERE status = ?"
        count_params = [status]
        if search:
            count_query += " AND (ear_tag LIKE ? OR breed LIKE ?)"
            count_params.extend([search_term, search_term])
            
        total_res = db.execute_query(count_query, tuple(count_params))
        total = total_res[0]['count'] if total_res else 0
        
        data = {
            "goats": [dict(goat) for goat in goats],
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page
        }
        
        return success_response(data)
        
    except Exception as e:
        logger.error(f"Get goats error: {e}")
        return error_response(str(e))

@goats_bp.route('/goats/<int:goat_id>', methods=['GET'])
def get_goat(goat_id):
    try:
        query = "SELECT * FROM goats WHERE goat_id = ?"
        goat = db.execute_query(query, (goat_id,))
        if not goat:
            return error_response("Goat not found", 404)
        return success_response(dict(goat[0]))
    except Exception as e:
        logger.error(f"Get Goat Error: {e}")
        return error_response(str(e))

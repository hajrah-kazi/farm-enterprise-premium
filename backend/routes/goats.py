from flask import Blueprint, jsonify, request
from ..database import DatabaseManager
from ..utils.response import success_response, error_response
import logging

goats_bp = Blueprint('goats', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@goats_bp.route('/goats', methods=['GET'])
def get_all_goats():
    try:
        query = "SELECT * FROM goats WHERE status = 'Active'"
        goats = db.execute_query(query)
        return success_response([dict(g) for g in goats])
    except Exception as e:
        logger.error(f"Goats Error: {e}")
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

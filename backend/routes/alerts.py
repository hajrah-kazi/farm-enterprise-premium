from flask import Blueprint, jsonify, request
from database import DatabaseManager
from utils.response import success_response, error_response
import logging

alerts_bp = Blueprint('alerts', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    try:
        # Get unresolved alerts by default
        resolved = request.args.get('resolved', '0')
        query = """
            SELECT e.*, g.ear_tag 
            FROM events e
            LEFT JOIN goats g ON e.goat_id = g.goat_id
            WHERE e.resolved = ?
            ORDER BY e.timestamp DESC LIMIT 100
        """
        alerts = db.execute_query(query, (int(resolved),))
        return success_response({"alerts": [dict(a) for a in alerts]})
    except Exception as e:
        logger.error(f"Alerts Error: {e}")
        return error_response(str(e))

@alerts_bp.route('/alerts/<int:alert_id>', methods=['PATCH'])
def resolve_alert(alert_id):
    try:
        query = """
            UPDATE events 
            SET resolved = 1, resolved_at = CURRENT_TIMESTAMP, resolved_by = 'System User'
            WHERE event_id = ?
        """
        rows = db.execute_update(query, (alert_id,))
        if rows > 0:
            return success_response({"message": "Alert resolved successfully"})
        return error_response("Alert not found", 404)
    except Exception as e:
        logger.error(f"Resolve Alert Error: {e}")
        return error_response(str(e))

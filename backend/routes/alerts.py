from flask import Blueprint
from ..database import DatabaseManager
from ..utils.response import success_response, error_response
import logging

alerts_bp = Blueprint('alerts', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    try:
        # Assuming alerts come from 'events' table
        query = "SELECT * FROM events WHERE event_type LIKE '%Alert%' ORDER BY timestamp DESC LIMIT 50"
        alerts = db.execute_query(query)
        return success_response(dict(alerts=[dict(a) for a in alerts]))
    except Exception as e:
        logger.error(f"Alerts Error: {e}")
        return error_response(str(e))

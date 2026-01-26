from flask import Blueprint, request
from database import DatabaseManager
from utils.response import success_response, error_response
import logging

settings_bp = Blueprint('settings', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@settings_bp.route('/settings', methods=['GET', 'POST'])
def handle_settings():
    try:
        if request.method == 'GET':
            query = "SELECT key, value FROM settings"
            rows = db.execute_query(query)
            settings = {row['key']: row['value'] for row in rows}
            return success_response(settings)
        
        elif request.method == 'POST':
            data = request.json
            for key, value in data.items():
                db.execute_update(
                    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                    (key, str(value))
                )
            return success_response({"message": "Settings saved"})
            
    except Exception as e:
        logger.error(f"Settings Error: {e}")
        return error_response(str(e))

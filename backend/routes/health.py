from flask import Blueprint, jsonify, request
from database import DatabaseManager
from utils.response import success_response, error_response
import logging

health_bp = Blueprint('health', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@health_bp.route('/health-stats', methods=['GET'])
@health_bp.route('/health/stats', methods=['GET'])
def get_health_stats():
    """Get health statistics for the last 30 days."""
    try:
        days = int(request.args.get('days', 30))
        
        query = """
            SELECT 
                DATE(timestamp) as date,
                AVG(health_score) as avg_health,
                MIN(health_score) as min_health,
                MAX(health_score) as max_health,
                COUNT(*) as record_count
            FROM health_records
            WHERE timestamp >= datetime('now', '-' || ? || ' days')
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        """
        
        stats = db.execute_query(query, (days,))
        
        return success_response({
            "stats": [dict(s) for s in stats],
            "period_days": days
        })
        
    except Exception as e:
        logger.error(f"Get health stats error: {e}")
        return error_response(str(e))

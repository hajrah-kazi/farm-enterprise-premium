from flask import Blueprint
from database import DatabaseManager
from utils.response import success_response, error_response
import logging

dashboard_bp = Blueprint('dashboard', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard_stats():
    try:
        # Aggregate stats
        total_goats = db.execute_query("SELECT COUNT(*) as c FROM goats WHERE status='Active'")[0]['c']
        videos_processed = db.execute_query("SELECT COUNT(*) as c FROM videos WHERE processing_status='Completed'")[0]['c']
        active_alerts = db.execute_query("SELECT COUNT(*) as c FROM events WHERE resolved=0")[0]['c']
        
        # Avg health
        avg_health = db.execute_query("SELECT AVG(health_score) as avg_h FROM detections")[0]['avg_h'] or 0
        
        # Health distribution
        health_dist_rows = db.execute_query("""
            SELECT 
                CASE 
                    WHEN health_score >= 90 THEN 'Excellent'
                    WHEN health_score >= 75 THEN 'Good'
                    WHEN health_score >= 60 THEN 'Fair'
                    WHEN health_score >= 40 THEN 'Poor'
                    ELSE 'Critical'
                END as status,
                COUNT(*) as count
            FROM detections
            GROUP BY status
        """)
        health_distribution = {row['status']: row['count'] for row in health_dist_rows}
        
        stats = {
            "total_goats": total_goats,
            "videos_processed": videos_processed,
            "active_alerts": active_alerts,
            "avg_health": round(avg_health, 1),
            "health_distribution": health_distribution
        }
        return success_response(stats)
    except Exception as e:
        logger.error(f"Dashboard Error: {e}")
        return error_response(str(e))

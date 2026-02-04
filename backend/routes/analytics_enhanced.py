"""
Enhanced Analytics API Route
Uses the new enterprise analytics engine for real insights
"""

from flask import Blueprint, request, jsonify
import logging
from database import DatabaseManager
from utils.response import success_response, error_response

# Import new analytics and report engines
try:
    from core.analytics_engine import AnalyticsEngine
    from core.report_generator import ReportGenerator
    ENTERPRISE_MODE = True
except ImportError:
    ENTERPRISE_MODE = False
    logging.warning("Enterprise engines not available, using legacy mode")

analytics_enhanced_bp = Blueprint('analytics_enhanced', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

# Initialize engines
if ENTERPRISE_MODE:
    analytics_engine = AnalyticsEngine(db.db_path)
    report_generator = ReportGenerator(db.db_path)

@analytics_enhanced_bp.route('/analytics/comprehensive', methods=['GET'])
def get_comprehensive_analytics():
    """
    Get comprehensive analytics report.
    Returns real, data-driven insights.
    """
    try:
        if not ENTERPRISE_MODE:
            return error_response("Enterprise analytics not available")
        
        report = analytics_engine.get_comprehensive_report()
        return success_response(report)
        
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        return error_response(str(e))

@analytics_enhanced_bp.route('/analytics/population', methods=['GET'])
def get_population_analytics():
    """Get population statistics"""
    try:
        if not ENTERPRISE_MODE:
            return error_response("Enterprise analytics not available")
        
        stats = analytics_engine.get_population_stats()
        return success_response({
            'total_unique_goats': stats.total_unique_goats,
            'active_goats': stats.active_goats,
            'sick_goats': stats.sick_goats,
            'quarantine_goats': stats.quarantine_goats,
            'new_goats_this_week': stats.new_goats_this_week,
            'average_health_score': stats.average_health_score,
            'population_trend': stats.population_trend
        })
        
    except Exception as e:
        logger.error(f"Population analytics error: {e}")
        return error_response(str(e))

@analytics_enhanced_bp.route('/analytics/goat/<int:goat_id>', methods=['GET'])
def get_goat_analytics(goat_id):
    """Get detailed analytics for a specific goat"""
    try:
        if not ENTERPRISE_MODE:
            return error_response("Enterprise analytics not available")
        
        profile = analytics_engine.get_goat_profile(goat_id)
        
        if not profile:
            return error_response(f"Goat {goat_id} not found", status_code=404)
        
        return success_response({
            'goat_id': profile.goat_id,
            'ear_tag': profile.ear_tag,
            'breed': profile.breed,
            'gender': profile.gender,
            'age_days': profile.age_days,
            'total_sightings': profile.total_sightings,
            'last_seen': profile.last_seen.isoformat(),
            'first_seen': profile.first_seen.isoformat(),
            'average_health_score': profile.average_health_score,
            'activity_level': profile.activity_level,
            'location_zones': profile.location_zones,
            'behavioral_flags': profile.behavioral_flags
        })
        
    except Exception as e:
        logger.error(f"Goat analytics error: {e}")
        return error_response(str(e))

@analytics_enhanced_bp.route('/analytics/health-trends', methods=['GET'])
def get_health_trends():
    """Get health trend analysis"""
    try:
        if not ENTERPRISE_MODE:
            return error_response("Enterprise analytics not available")
        
        days = request.args.get('days', 30, type=int)
        trends = analytics_engine.get_health_trends(days=days)
        
        return success_response({
            'trends': [
                {
                    'goat_id': t.goat_id,
                    'trend': t.trend,
                    'current_score': t.current_score,
                    'previous_score': t.previous_score,
                    'change_percentage': t.change_percentage,
                    'alert_level': t.alert_level
                }
                for t in trends
            ]
        })
        
    except Exception as e:
        logger.error(f"Health trends error: {e}")
        return error_response(str(e))

@analytics_enhanced_bp.route('/analytics/identity-metrics', methods=['GET'])
def get_identity_metrics():
    """Get identity system performance metrics"""
    try:
        if not ENTERPRISE_MODE:
            return error_response("Enterprise analytics not available")
        
        metrics = analytics_engine.compute_identity_metrics()
        return success_response(metrics)
        
    except Exception as e:
        logger.error(f"Identity metrics error: {e}")
        return error_response(str(e))

@analytics_enhanced_bp.route('/reports/generate', methods=['POST'])
def generate_report():
    """
    Generate a comprehensive report.
    Returns real data, not placeholders.
    """
    try:
        if not ENTERPRISE_MODE:
            return error_response("Enterprise report generation not available")
        
        data = request.get_json()
        report_type = data.get('report_type', 'population')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if report_type == 'population':
            report = report_generator.generate_population_report(start_date, end_date)
        elif report_type == 'health':
            days = data.get('days', 30)
            report = report_generator.generate_health_report(days=days)
        elif report_type == 'activity':
            days = data.get('days', 7)
            report = report_generator.generate_activity_report(days=days)
        elif report_type == 'goat_profile':
            goat_id = data.get('goat_id')
            if not goat_id:
                return error_response("goat_id required for profile report")
            report = report_generator.generate_goat_profile_report(goat_id)
        else:
            return error_response(f"Unknown report type: {report_type}")
        
        return success_response(report)
        
    except Exception as e:
        logger.error(f"Report generation error: {e}")
        return error_response(str(e))

@analytics_enhanced_bp.route('/reports/export/<report_type>', methods=['POST'])
def export_report(report_type):
    """Export report to CSV format"""
    try:
        if not ENTERPRISE_MODE:
            return error_response("Enterprise report export not available")
        
        data = request.get_json()
        
        # Generate report first
        if report_type == 'population':
            report_data = report_generator.generate_population_report()
        elif report_type == 'health':
            report_data = report_generator.generate_health_report()
        else:
            return error_response(f"Export not supported for {report_type}")
        
        # Export to CSV
        csv_data = report_generator.export_to_csv(report_data, report_type)
        
        return success_response({
            'csv_data': csv_data,
            'filename': f'{report_type}_report.csv'
        })
        
    except Exception as e:
        logger.error(f"Report export error: {e}")
        return error_response(str(e))

@analytics_enhanced_bp.route('/system/status', methods=['GET'])
def get_system_status():
    """Get comprehensive system status"""
    try:
        if not ENTERPRISE_MODE:
            return success_response({
                'status': 'legacy_mode',
                'enterprise_features': False
            })
        
        # Get master engine status
        from core.master_engine import get_master_engine
        master_engine = get_master_engine(db.db_path)
        status = master_engine.get_system_status()
        
        return success_response(status)
        
    except Exception as e:
        logger.error(f"System status error: {e}")
        return error_response(str(e))

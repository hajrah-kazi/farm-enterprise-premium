from flask import Blueprint, jsonify
import random
import threading
from utils.response import success_response, error_response
import logging

system_bp = Blueprint('system', __name__)
logger = logging.getLogger(__name__)

@system_bp.route('/system/status', methods=['GET'])
def get_system_status():
    """Get real-time system health metrics."""
    try:
        # Simulate server metrics
        cpu_usage = random.uniform(15, 45)
        ram_usage = random.uniform(40, 60)
        disk_usage = 65.4
        
        data = {
            "cpu_usage": round(cpu_usage, 1),
            "ram_usage": round(ram_usage, 1),
            "disk_usage": disk_usage,
            "uptime_seconds": 12345,
            "active_threads": threading.active_count(),
            "ai_engine_status": "Online",
            "gpu_utilization": round(random.uniform(20, 80), 1)
        }
        return success_response(data)
    except Exception as e:
        logger.error(f"System status error: {e}")
        return error_response(str(e))

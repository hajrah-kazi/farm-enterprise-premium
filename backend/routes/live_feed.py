from flask import Blueprint
from ..database import DatabaseManager
from ..utils.response import success_response, error_response
import logging
import random
import time
import math

live_feed_bp = Blueprint('live_feed', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

@live_feed_bp.route('/live-feed', methods=['GET'])
def get_live_feed():
    try:
        # Simulate live detections with smooth movement using sine waves
        # This creates a "natural" wandering path for each goat
        detections = []
        current_time = time.time()
        
        # Simulate 5 distinct goats with consistent tracks
        for i in range(5):
            # Unique phase offset for each goat
            phase_x = i * 2
            phase_y = i * 3
            
            # Smooth movement using sine/cosine
            # x moves back and forth, y moves up and down slightly
            # 0.5 center + 0.3 amplitude * sin(time * speed + phase)
            x = 0.5 + 0.3 * math.sin(current_time * 0.2 + phase_x)
            y = 0.5 + 0.2 * math.cos(current_time * 0.3 + phase_y)
            
            # Add some slight random jitter for realism (sensor noise)
            x += random.uniform(-0.005, 0.005)
            y += random.uniform(-0.005, 0.005)
            
            # Clamp to screen
            x = max(0.1, min(0.9, x))
            y = max(0.1, min(0.9, y))
            
            detections.append({
                "ear_tag": f"G-00{i+1}",
                "bounding_box_x": x,
                "bounding_box_y": y,
                # Width/Height dependent on distance (y) - simple perspective simulation
                "bounding_box_w": 0.15 * (1 + y * 0.5), 
                "bounding_box_h": 0.15 * (1 + y * 0.5),
                "confidence_score": 0.92 + random.uniform(0, 0.07),
                "health_score": 95 - (i * 5) + random.randint(-2, 2) # Different healths
            })
            
        return success_response({"detections": detections})
    except Exception as e:
        logger.error(f"Live Feed Error: {e}")
        return error_response(str(e))

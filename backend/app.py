"""
Farm AI Enterprise - Production Backend API
Complete REST API with all endpoints for farm management system
"""

from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from database import DatabaseManager
import logging
import json
import os
from dotenv import load_dotenv
from datetime import datetime
from config import config

load_dotenv()

# PRODUCTION SAFETY KILL-SWITCH
if config.IS_PRODUCTION:
    print(">>> PRODUCTION MODE SECURITY CHECK")
    # Verify no mock files are being forced
    if os.environ.get('FORCE_MOCK_DATA', 'False').lower() == 'true':
        raise RuntimeError("SECURITY_VIOLATION: FORCE_MOCK_DATA detected in Production environment.")

# Import Blueprint instances
from routes.analytics import analytics_bp
from routes.reports import reports_bp
from routes.alerts import alerts_bp
from routes.goats import goats_bp
from routes.videos import videos_bp
from routes.dashboard import dashboard_bp
from routes.live_feed import live_feed_bp
from routes.settings import settings_bp
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.system import system_bp
from routes.diagnostics import diagnostics_bp
from routes.detections import detections_bp
from routes.health import health_bp
from routes.breeds import breeds_bp

# Import enhanced analytics (enterprise features)
try:
    from routes.analytics_enhanced import analytics_enhanced_bp
    ENTERPRISE_ANALYTICS_AVAILABLE = True
except ImportError:
    ENTERPRISE_ANALYTICS_AVAILABLE = False
    logger.warning("Enterprise analytics routes not available")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize database
db = DatabaseManager()
db.initialize_database()

if config.ALLOW_MOCK_DATA:
    db.auto_seed()
else:
    logger.info("Production Mode: Skipping seed data.")

# Register Blueprints
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')
app.register_blueprint(alerts_bp, url_prefix='/api')
app.register_blueprint(goats_bp, url_prefix='/api')
app.register_blueprint(videos_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api')
app.register_blueprint(live_feed_bp, url_prefix='/api')
app.register_blueprint(settings_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(system_bp, url_prefix='/api')
app.register_blueprint(diagnostics_bp, url_prefix='/api')
app.register_blueprint(detections_bp, url_prefix='/api')
app.register_blueprint(health_bp, url_prefix='/api')
app.register_blueprint(breeds_bp, url_prefix='/api')

# Register enhanced analytics if available
if ENTERPRISE_ANALYTICS_AVAILABLE:
    app.register_blueprint(analytics_enhanced_bp, url_prefix='/api')
    logger.info("Enterprise analytics routes registered")

@app.route('/health', methods=['GET'])
def health_check():
    """System health check."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "4.2.0-Premium"
    }), 200

if __name__ == '__main__':
    # Start server
    logger.info("Initializing Farm AI Premium Engine...")
    app.run(host='0.0.0.0', port=5000, debug=True)

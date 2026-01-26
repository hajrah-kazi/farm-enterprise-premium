from flask import Flask, jsonify
from flask_cors import CORS
import logging

# Import Blueprints
# Import Blueprints
from routes.analytics import analytics_bp
from routes.detections import detections_bp
from routes.goats import goats_bp
from routes.system import system_bp
from routes.reports import reports_bp
from routes.videos import videos_bp
from routes.dashboard import dashboard_bp
from routes.chat import chat_bp
from routes.settings import settings_bp
from routes.alerts import alerts_bp
from routes.live_feed import live_feed_bp
from routes.auth import auth_bp
from utils.response import error_response

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register Blueprints
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(detections_bp, url_prefix='/api')
    app.register_blueprint(goats_bp, url_prefix='/api')
    app.register_blueprint(system_bp, url_prefix='/api')
    app.register_blueprint(reports_bp, url_prefix='/api')
    app.register_blueprint(videos_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(chat_bp, url_prefix='/api')
    app.register_blueprint(settings_bp, url_prefix='/api')
    app.register_blueprint(alerts_bp, url_prefix='/api')
    app.register_blueprint(live_feed_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    # Global Error Handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Unhandled Exception: {e}")
        return error_response(f"Internal Server Error: {str(e)}", 500)

    @app.errorhandler(404)
    def not_found(e):
        return error_response("Endpoint not found", 404)

    return app

if __name__ == '__main__':
    app = create_app()
    logger.info("Starting Farm Enterprise Backend v2.0 (Modular)")
    app.run(host='0.0.0.0', port=5000, debug=True)

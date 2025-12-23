from flask import Blueprint, jsonify, request
from ..database import DatabaseManager
from ..utils.response import success_response, error_response
import logging
import hashlib

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@auth_bp.route('/auth/login', methods=['POST'])
@auth_bp.route('/login', methods=['POST']) # Alias for compatibility
def login():
    """Authenticate user and return session info."""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return error_response("Username and password are required", 400)
        
        user = db.execute_query("SELECT * FROM users WHERE username = ?", (username,))
        
        if user and user[0]['password_hash'] == hash_password(password):
            user_data = {
                "id": user[0]['user_id'],
                "username": user[0]['username'],
                "role": user[0]['role'],
                "full_name": user[0]['full_name']
            }
            return success_response({"message": "Login successful", "user": user_data})
            
        return error_response("Invalid credentials", 401)
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return error_response(str(e))

def initialize_users():
    """Ensure default admin user exists."""
    try:
        admin = db.execute_query("SELECT * FROM users WHERE username = 'admin'")
        if not admin:
            db.execute_update(
                "INSERT INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)", 
                ('admin', hash_password('admin123'), 'Admin', 'System Administrator')
            )
            logger.info("Initialized default admin account.")
    except Exception as e:
        logger.error(f"User init error: {e}")

# Initialize credentials on module load
initialize_users()

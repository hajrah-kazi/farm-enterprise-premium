from flask import Blueprint, jsonify
from utils.response import success_response

breeds_bp = Blueprint('breeds', __name__)

from utils.breed_data import BREED_DATABASE

@breeds_bp.route('/breeds', methods=['GET'])
def get_breeds():
    return success_response({"breeds": BREED_DATABASE})

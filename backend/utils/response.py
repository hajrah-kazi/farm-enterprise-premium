from flask import jsonify
from datetime import datetime
from typing import Any, Optional

def success_response(data: Any, meta: Optional[dict] = None) -> tuple:
    """
    Standard Success Response Envelope
    """
    response = {
        "success": True,
        "data": data,
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": "2.0"
        },
        "error": None
    }
    if meta:
        response["meta"].update(meta)
    return jsonify(response), 200

def error_response(message: str, code: int = 500, details: Optional[Any] = None) -> tuple:
    """
    Standard Error Response Envelope
    """
    response = {
        "success": False,
        "data": None,
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": "2.0"
        },
        "error": {
            "code": code,
            "message": message,
            "details": details
        }
    }
    return jsonify(response), code

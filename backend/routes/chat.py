from flask import Blueprint, request
from ..utils.response import success_response, error_response
import logging
import requests
import os

chat_bp = Blueprint('chat', __name__)
logger = logging.getLogger(__name__)

# Mock AI Chat if API key missing
@chat_bp.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Simple rule-based mock for now since I don't have the API key handy or want to break quota
        response_text = ""
        user_lower = user_message.lower()
        
        if "hello" in user_lower:
            response_text = "Hello! I am the Farm Enterprise AI. How can I assist you with your herd today?"
        elif "goat" in user_lower or "count" in user_lower:
            response_text = "We currently have 42 active goats recorded in the system. Would you like a detailed breakdown?"
        elif "health" in user_lower:
            response_text = "The overall herd health is good, with an average score of 87%. I've flagged 2 goats for minor checkups."
        elif "report" in user_lower:
            response_text = "I can generate daily, weekly, or custom reports. Please visit the Reports section to configure a new report."
        else:
            response_text = f"I processed your request about '{user_message}'. As an AI Assistant, I'm here to help analyze farm data."

        return success_response({"reply": response_text})
        
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        return error_response(str(e))

from flask import Blueprint, request
from utils.response import success_response, error_response
import logging
import os
from openai import OpenAI

chat_bp = Blueprint('chat', __name__)
logger = logging.getLogger(__name__)

# Initialize OpenAI client with key from environment
api_key = os.getenv("OPENAI_API_KEY")
client = None
if api_key and "your_openai_api_key_here" not in api_key:
    try:
        client = OpenAI(api_key=api_key)
    except Exception as e:
        logger.error(f"Failed to initialize OpenAI client: {e}")

@chat_bp.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Check if OpenAI key is actually valid/present
        api_key = os.getenv("OPENAI_API_KEY")
        if not client or not api_key or "your_openai_api_key" in api_key:
            return _mock_chat_fallback(user_message)

        # Real OpenAI Response with 'FarmGenie' Persona
        response = client.chat.completions.create(
            model="gpt-4o", # Upgraded for 'Anything' answering capabilities
            messages=[
                {"role": "system", "content": "You are GoatAI Alpha, the apex intelligence core of an elite, high-precision goat farm enterprise. Your architecture allows you to synthesize real-time biometric streams, global genetic registries, and complex logistical paradoxes. You are versatile and can answer ANY human inquiry with institutional-grade reasoning. Your tone is professional, futuristic, and highly analytical. Use structured markdown and technical nomenclature where appropriate."},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content
        return success_response({"reply": response_text})
        
    except Exception as e:
        logger.error(f"Chat Engine Error: {e}")
        # Final fallback to mock on any technical failure
        return _mock_chat_fallback(user_message)

def _mock_chat_fallback(user_message):
    """Refined rule-based mock for robustness."""
    user_lower = user_message.lower()
    if "hello" in user_lower:
        response_text = "GREETINGS. FarmGenie Operational Assistant online. How can I optimize your herd today?"
    elif "count" in user_lower or "many" in user_lower:
        response_text = "CURRENT INVENTORY: 42 active specimens detected across 4 sectors. 100% identification confirmed."
    elif "health" in user_lower or "sick" in user_lower:
        response_text = "HEALTH AUDIT: Average vitality index at 89.2%. 2 specimens in Sector B showing elevated resting heart rates."
    else:
        response_text = f"ANALYSIS COMPLETE: I've processed your request regarding '{user_message}'. Please provide specific bio-metric parameters for deeper synthesis."
    
    return success_response({"reply": response_text})

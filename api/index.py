import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
# Add backend to sys.path so 'import database' works in app.py
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from backend.app import app

# Vercel needs the app variable
handler = app
app = handler

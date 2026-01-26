
from backend.database import DatabaseManager
import json

db = DatabaseManager()
tables = ['goats', 'goat_positions', 'detections', 'events', 'feeding_records', 'health_records', 'reports']

print("--- DATABASE STATS ---")
for table in tables:
    try:
        count = db.execute_query(f"SELECT COUNT(*) as c FROM {table}")[0]['c']
        print(f"{table}: {count} rows")
    except Exception as e:
        print(f"{table}: Error {e}")

print("\n--- DETECTIONS SAMPLE ---")
try:
    dets = db.execute_query("SELECT * FROM detections LIMIT 1")
    print(json.dumps([dict(d) for d in dets], default=str))
except:
    print("No detections")

print("\n--- GOAT POSITIONS SAMPLE ---")
try:
    pos = db.execute_query("SELECT * FROM goat_positions LIMIT 1")
    print(json.dumps([dict(p) for p in pos], default=str))
except:
    print("No positions")

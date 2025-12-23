import sys
sys.path.insert(0, 'c:/Users/uniqu/OneDrive/Desktop/Internship/farm-enterprise-premium')

from backend.database import DatabaseManager

db = DatabaseManager()

# Get table schema
schema = db.execute_query("PRAGMA table_info(detections)")

print("Detections table columns:")
for col in schema:
    print(f"  - {col['name']}: {col['type']}")

# Get a sample row
sample = db.execute_query("SELECT * FROM detections LIMIT 1")
if sample:
    print("\nSample detection row:")
    row = dict(sample[0])
    for key, value in row.items():
        print(f"  {key}: {value}")

import sqlite3
import os

db_path = os.path.join('backend', 'data', 'goat_farm.db')
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("--- Database Stats ---")
try:
    cursor.execute("SELECT status, COUNT(*) as count FROM goats GROUP BY status")
    rows = cursor.fetchall()
    for row in rows:
        print(f"Goats Status: {row['status']} -> {row['count']}")
    
    cursor.execute("SELECT COUNT(*) as count FROM reports")
    print(f"Total Reports: {cursor.fetchone()['count']}")
    
    cursor.execute("SELECT COUNT(*) as count FROM events")
    print(f"Total Events: {cursor.fetchone()['count']}")

    cursor.execute("SELECT COUNT(*) as count FROM detections")
    print(f"Total Detections: {cursor.fetchone()['count']}")

    cursor.execute("SELECT COUNT(*) as count FROM goat_positions")
    print(f"Total Goat Positions: {cursor.fetchone()['count']}")

except Exception as e:
    print(f"Error: {e}")

conn.close()

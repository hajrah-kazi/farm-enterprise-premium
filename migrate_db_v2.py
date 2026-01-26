import sqlite3
import os

db_path = os.path.join('backend', 'data', 'goat_farm.db')
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("Checking 'events' table...")
    cursor.execute("PRAGMA table_info(events)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Columns in 'events': {columns}")
    
    if 'details' not in columns:
        print("Adding 'details' column to 'events'...")
        cursor.execute("ALTER TABLE events ADD COLUMN details TEXT")
        print("'details' column added.")

    print("\nChecking 'videos' table...")
    cursor.execute("PRAGMA table_info(videos)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Columns in 'videos': {columns}")
    
    if 'progress' not in columns:
        print("Adding 'progress' column to 'videos'...")
        cursor.execute("ALTER TABLE videos ADD COLUMN progress INTEGER DEFAULT 0")
        print("'progress' column added.")

    conn.commit()
    print("\nDatabase migration successful.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()

import sqlite3
import json

db_path = r'c:\Users\uniqu\OneDrive\Desktop\Internship\farm-enterprise-premium\backend\data\goat_farm.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- VIDEOS TABLE SCHEMA ---")
cursor.execute("PRAGMA table_info(videos)")
columns = cursor.fetchall()
for col in columns:
    print(col)

print("\n--- RECENT VIDEO DATA ---")
cursor.execute("SELECT video_id, filename, total_goats, estimated_count, metadata FROM videos ORDER BY video_id DESC LIMIT 3")
rows = cursor.fetchall()
for row in rows:
    vid, fname, tg, ec, meta = row
    print(f"ID: {vid} | File: {fname} | total_goats: {tg} | estimated_count: {ec}")
    if meta:
        m = json.loads(meta)
        print(f"  Metadata Count: {m.get('estimated_count')} | Stats: {m.get('confidence_score')}%")

conn.close()

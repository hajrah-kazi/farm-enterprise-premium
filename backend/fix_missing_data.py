
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import DatabaseManager
import random
from datetime import datetime, timedelta
import json

db = DatabaseManager()

def fix_data():
    print("Fixing missing data for proper demo functionality...")
    
    # 1. Get all goats
    goats = db.execute_query("SELECT goat_id, ear_tag, weight FROM goats WHERE status='Active'")
    print(f"Found {len(goats)} active goats.")
    
    if not goats:
        print("CRITICAL: No goats found. Creating some...")
        # Create some goats if none exist
        breeds = ['Boer', 'Kiko', 'Nubian', 'Spanish']
        for i in range(20):
            db.execute_update("""
                INSERT INTO goats (ear_tag, breed, gender, status, weight, date_of_birth)
                VALUES (?, ?, ?, 'Active', ?, ?)
            """, (f"TAG-{100+i}", random.choice(breeds), random.choice(['Male', 'Female']), random.uniform(30, 80), "2023-01-01"))
        goats = db.execute_query("SELECT goat_id, ear_tag, weight FROM goats WHERE status='Active'")
            
    # 2. Ensure DETECTIONS exist for analytics (Mass/Yield)
    # The analytics endpoint relies on finding a detection for the goat to get the bounding box
    print("Populating detections for Analytics...")
    detection_count = db.execute_query("SELECT COUNT(*) as c FROM detections")[0]['c']
    
    # Always add fresh detections for "today" to ensure they show up
    cur_time = datetime.now()
    
    for goat in goats:
        # Create a mock detection
        # We need realistic bbox dimensions for the 'mass' calc to work
        # Mass ~ a * L^b * H^c. 
        # Inversely, create L and H based on weight for realism, or just random 'good' values
        
        # Mock bounding box for a healthy goat at ~5m distance
        bbox_w = random.uniform(200, 300) # pixels
        bbox_h = random.uniform(150, 250)
        
        db.execute_update("""
            INSERT INTO detections (
                goat_id, timestamp, bounding_box_x, bounding_box_y, bounding_box_w, bounding_box_h,
                confidence_score, health_score, gait_status, activity_label
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            goat['goat_id'],
            cur_time,
            random.uniform(0, 1920), random.uniform(0, 1080),
            bbox_w, bbox_h,
            random.uniform(0.8, 0.99), # High confidence
            random.randint(70, 100),   # Good health
            'Normal',
            random.choice(['Grazing', 'Walking', 'Standing'])
        ))
        
        # Also ensure goat_position exists
        db.execute_update("""
            INSERT OR REPLACE INTO goat_positions (goat_id, x, y, z, last_updated)
            VALUES (?, ?, ?, ?, ?)
        """, (
            goat['goat_id'],
            random.uniform(-10, 10),
            random.uniform(0, 2),
            random.uniform(2, 8), # Z distance 2-8 meters
            cur_time
        ))

    print("Detections populated.")

    # 3. Ensure FEEDING records exist for Reports
    print("Populating Feeding Records for Reports...")
    db.execute_query("DELETE FROM feeding_records") # Clear old to ensure fresh "today" data
    
    activities = ['Grazing', 'Feeding', 'Drinking']
    feeds = ['Hay', 'Grain', 'Pasture', 'Mineral Lick']
    
    for goat in goats[:50]: # First 50 goats
        for _ in range(3): # 3 records each
            t = cur_time - timedelta(hours=random.randint(1, 24))
            db.execute_update("""
                INSERT INTO feeding_records (goat_id, activity, feed_type, consumption_rate, duration, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                goat['goat_id'],
                random.choice(activities),
                random.choice(feeds),
                random.uniform(0.5, 2.0), # kg/hr
                random.randint(10, 60),   # mins
                t
            ))
            
    # 4. Ensure EVENTS exist for Activity Log report
    print("Populating Events/Alerts for Reports...")
    # Clear old non-critical events
    
    event_types = ['Movement Alert', 'Feeding Alert', 'Health Alert']
    severities = ['Low', 'Medium', 'High']
    
    for i in range(25):
        t = cur_time - timedelta(hours=random.randint(0, 48))
        g = random.choice(goats)
        db.execute_update("""
            INSERT INTO events (goat_id, event_type, severity, title, description, timestamp, resolved)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            g['goat_id'],
            random.choice(event_types),
            random.choice(severities),
            f"Detected anomalous behavior for {g['ear_tag']}",
            "AI analysis indicates deviation from normal herd patterns.",
            t,
            random.choice([0, 1])
        ))

    print("Data fix complete!")

if __name__ == '__main__':
    fix_data()

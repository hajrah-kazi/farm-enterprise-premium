import sqlite3
import os
import json
import random
from datetime import datetime, timedelta
from database import DatabaseManager

# Initialize DB Manager
db = DatabaseManager()

def generate_mock_data():
    print("Generating enterprise-grade mock data...")
    
    # 1. Clear existing data
    conn = db.get_connection()
    cursor = conn.cursor()
    tables = ['detections', 'reports', 'feeding_records', 'health_records', 'events', 'videos', 'goats']
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")
    
    # Reset auto-increment counters
    try:
        cursor.execute("DELETE FROM sqlite_sequence")
    except:
        pass # Table might not exist yet
        
    conn.commit()
    
    # 2. Create Goats (The Assets)
    breeds = ['Boer', 'Saanen', 'Nubian', 'Kiko', 'Spanish']
    colors = ['White', 'Brown', 'Black', 'Spotted', 'Tan']
    goats = []
    
    for i in range(1, 51):  # 50 goats
        goat_id = i
        ear_tag = f"G{str(i).zfill(4)}"
        breed = random.choice(breeds)
        gender = random.choice(['Male', 'Female'])
        dob = datetime.now() - timedelta(days=random.randint(300, 1500))
        weight = round(random.uniform(35.0, 85.0), 1)
        
        # Metadata for extra detail
        metadata = {
            "sire": f"S{random.randint(100, 999)}",
            "dam": f"D{random.randint(100, 999)}",
            "vaccinations": ["CDT", "Pneumonia"] if random.random() > 0.2 else ["CDT"],
            "origin": "Farm Bred" if random.random() > 0.3 else "Purchased"
        }
        
        cursor.execute('''
            INSERT INTO goats (ear_tag, breed, gender, date_of_birth, weight, color, horn_status, metadata, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            ear_tag, breed, gender, dob.strftime('%Y-%m-%d'), weight, 
            random.choice(colors), 
            random.choice(['Horned', 'Disbudded', 'Polled']),
            json.dumps(metadata),
            'Active'
        ))
        
        # Get the actual assigned goat_id
        actual_goat_id = cursor.lastrowid
        goats.append({'id': actual_goat_id, 'tag': ear_tag})

        # Add Mock Position (3D)
        cursor.execute('''
            INSERT OR REPLACE INTO goat_positions (goat_id, x, y, z)
            VALUES (?, ?, ?, ?)
        ''', (
            actual_goat_id,
            random.uniform(0.0, 10.0), # X
            random.uniform(0.0, 10.0), # Y
            random.uniform(1.0, 5.0)   # Z (Distance)
        ))

    # 3. Create Videos (The Input Source)
    for i in range(1, 11):
        upload_date = datetime.now() - timedelta(hours=random.randint(1, 48))
        cursor.execute('''
            INSERT INTO videos (filename, file_path, file_size, duration, fps, resolution, processing_status, upload_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            f"cam_feed_{i}_{upload_date.strftime('%Y%m%d')}.mp4",
            f"/data/videos/cam_feed_{i}.mp4",
            random.randint(50, 500), # MB
            random.uniform(300, 3600), # duration seconds
            30,
            "1920x1080",
            "Completed",
            upload_date
        ))
        
    # 4. Health Records (Longitudinal Data)
    print("Generating health history...")
    for goat in goats:
        # Generate 5-10 records per goat over last 6 months
        num_records = random.randint(5, 10)
        for _ in range(num_records):
            record_date = datetime.now() - timedelta(days=random.randint(1, 180))
            health_score = random.randint(60, 100)
            
            # Determine status based on score
            if health_score >= 90: status = 'Excellent'
            elif health_score >= 80: status = 'Good'
            elif health_score >= 70: status = 'Fair'
            elif health_score >= 50: status = 'Poor'
            else: status = 'Critical'
            
            components = {
                "coat_condition": random.randint(1, 5),
                "eye_mucosa": "Pink" if health_score > 70 else "Pale",
                "rumen_fill": random.randint(1, 5)
            }
            
            cursor.execute('''
                INSERT INTO health_records (goat_id, health_score, status, body_condition_score, temperature, heart_rate, respiratory_rate, components, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                goat['id'], health_score, status, 
                round(random.uniform(2.5, 4.5), 1), # BCS
                round(random.uniform(38.5, 40.0), 1), # Temp C
                random.randint(70, 90), # HR
                random.randint(15, 30), # RR
                json.dumps(components),
                record_date
            ))

    # 5. Events & Alerts (Incidents)
    print("Generating events and alerts...")
    event_types = ['Health Alert', 'Behavior Alert', 'Feeding Alert', 'Movement Alert']
    severities = ['Low', 'Medium', 'High', 'Critical']
    
    for _ in range(30): # 30 recent events
        goat = random.choice(goats)
        event_time = datetime.now() - timedelta(hours=random.randint(1, 72))
        severity = random.choice(severities)
        
        cursor.execute('''
            INSERT INTO events (goat_id, event_type, severity, title, description, resolved, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            goat['id'], 
            random.choice(event_types),
            severity,
            f"Abnormal behavior detected for {goat['tag']}",
            "AI detected irregular gait pattern and reduced movement.",
            random.choice([0, 1]),
            event_time
        ))

    # 6. Detections (High volume telemetry)
    print("Generating detection telemetry...")
    # Simulate detections for the last hour
    base_time = datetime.now() - timedelta(hours=1)
    for i in range(200): # 200 detection frames
        goat = random.choice(goats)
        det_time = base_time + timedelta(seconds=i*15)
        
        cursor.execute('''
            INSERT INTO detections (
                video_id, goat_id, timestamp, ear_tag_detected, 
                bounding_box_x, bounding_box_y, bounding_box_w, bounding_box_h,
                confidence_score, health_score, activity_label
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            random.randint(1, 10),
            goat['id'],
            det_time,
            goat['tag'],
            random.uniform(100, 1800), random.uniform(100, 900), # x, y
            random.uniform(100, 300), random.uniform(100, 300), # w, h
            random.uniform(0.85, 0.99), # confidence
            random.randint(70, 100), # health snapshot
            random.choice(['Grazing', 'Walking', 'Resting', 'Standing'])
        ))

    conn.commit()
    print("Enterprise mock data generation complete.")

if __name__ == "__main__":
    generate_mock_data()

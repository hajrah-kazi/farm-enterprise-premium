import sqlite3
import os
import csv
import json
import random
from datetime import datetime, timedelta
from database import DatabaseManager

# Initialize DB Manager
db = DatabaseManager()

def load_csv_data_with_coordinates():
    """Load data from CSV file and populate database with 3D coordinates."""
    print("Loading mock data from CSV with 3D coordinates...")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Clear existing data from new tables
    tables = ['video_frames', 'goat_positions', 'unidentified_goats', 'detections', 'videos', 'goats']
    for table in tables:
        try:
            cursor.execute(f"DELETE FROM {table}")
        except:
            pass
    
    # Reset auto-increment
    try:
        cursor.execute("DELETE FROM sqlite_sequence")
    except:
        pass
    
    conn.commit()
    
    # Read CSV file
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'goat_detections_mock_1000.csv')
    
    if not os.path.exists(csv_path):
        print(f"CSV file not found at {csv_path}")
        return
    
    goat_map = {}  # Map ear_tag to goat_id
    video_map = {}  # Map video_id to database id
    unidentified_count = 0
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            ear_tag = row['ear_tag_detected'].strip()
            video_id_str = row['video_id']
            
            # Create video if not exists
            if video_id_str not in video_map:
                cursor.execute('''
                    INSERT INTO videos (filename, file_path, processing_status, upload_date)
                    VALUES (?, ?, ?, ?)
                ''', (f"{video_id_str}.mp4", f"/data/videos/{video_id_str}.mp4", "Completed", datetime.now()))
                video_map[video_id_str] = cursor.lastrowid
            
            db_video_id = video_map[video_id_str]
            
            # Handle goat with ear tag
            if ear_tag:
                if ear_tag not in goat_map:
                    # Create new goat
                    breed = random.choice(['Boer', 'Saanen', 'Nubian', 'Kiko', 'Spanish'])
                    gender = random.choice(['Male', 'Female'])
                    dob = datetime.now() - timedelta(days=random.randint(300, 1500))
                    color = row.get('color_detected', 'Unknown')
                    horn_status = row.get('horns_present', 'Unknown')
                    
                    cursor.execute('''
                        INSERT INTO goats (ear_tag, breed, gender, date_of_birth, color, horn_status, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (ear_tag, breed, gender, dob.strftime('%Y-%m-%d'), color, horn_status, 'Active'))
                    
                    goat_map[ear_tag] = cursor.lastrowid
                
                goat_id = goat_map[ear_tag]
            else:
                # Handle unidentified goat
                uid = f"UNID_{unidentified_count:04d}"
                color = row.get('color_detected', 'Unknown')
                horn_status = row.get('horns_present', 'Unknown')
                
                cursor.execute('''
                    INSERT OR IGNORE INTO unidentified_goats (uid, color, horn_status, last_seen)
                    VALUES (?, ?, ?, ?)
                ''', (uid, color, horn_status, datetime.now()))
                
                unidentified_count += 1
                goat_id = None
            
            # Extract 3D coordinates from bounding box
            bbox_x = float(row['bounding_box_x'])
            bbox_y = float(row['bounding_box_y'])
            bbox_w = float(row['bounding_box_w'])
            bbox_h = float(row['bounding_box_h'])
            
            # Convert normalized coordinates to world coordinates (meters)
            # Assuming a 10m x 10m paddock area
            x = bbox_x * 10.0  # meters
            y = bbox_y * 10.0  # meters
            # Estimate z (height) from bounding box height
            # Larger bbox_h suggests goat is closer/larger, smaller suggests further away
            z = (1.0 - bbox_h) * 2.0  # 0-2 meters height estimation
            
            frame_number = int(row['frame_number'])
            timestamp = row['timestamp']
            confidence = float(row['confidence_score'])
            
            # Insert into video_frames table
            cursor.execute('''
                INSERT INTO video_frames (
                    video_id, frame_number, timestamp, 
                    bbox_x, bbox_y, bbox_w, bbox_h,
                    x, y, z, detection_confidence
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (db_video_id, frame_number, timestamp, bbox_x, bbox_y, bbox_w, bbox_h, x, y, z, confidence))

            # Insert into detections table (legacy support and health scores)
            # Generate a random health score mostly high
            health_score = random.randint(70, 100) if random.random() > 0.1 else random.randint(40, 69)
            
            cursor.execute('''
                INSERT INTO detections (
                    video_id, goat_id, frame_number, timestamp,
                    ear_tag_detected, bounding_box_x, bounding_box_y, bounding_box_w, bounding_box_h,
                    confidence_score, color_detected, horns_present,
                    health_score, location_zone
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                db_video_id, goat_id, frame_number, timestamp,
                ear_tag, bbox_x, bbox_y, bbox_w, bbox_h,
                confidence, color, horn_status,
                health_score, 'Paddock A'
            ))
            
            # Update goat_positions table with latest position
            if goat_id:
                cursor.execute('''
                    INSERT OR REPLACE INTO goat_positions (goat_id, x, y, z, last_updated)
                    VALUES (?, ?, ?, ?, ?)
                ''', (goat_id, x, y, z, datetime.now()))
    
    conn.commit()
    print(f"Loaded {len(goat_map)} goats and {unidentified_count} unidentified detections")
    print("3D coordinate data populated successfully!")

if __name__ == "__main__":
    # Initialize database schema first
    db.initialize_database()
    # Load CSV data
    load_csv_data_with_coordinates()

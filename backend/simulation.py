import time
import random
import json
import threading
import math
from datetime import datetime, timedelta
from database import DatabaseManager
from config import config

# Initialize DB Manager
db = DatabaseManager()

class GoatSimulator:
    def __init__(self, goat_data, scenario='Standard'):
        if not config.ALLOW_MOCK_DATA:
            raise RuntimeError("CRITICAL_SECURITY_ERR: Simulation engine active in PRODUCTION mode. Hard blocking execution.")
        
        self.goat = goat_data
        self.scenario = scenario
        self.state = self._initial_state()
        self.position = {'x': random.uniform(0.1, 0.9), 'y': random.uniform(0.1, 0.9)}
        self.velocity = {'x': 0, 'y': 0}
        
        # Vitals
        self.heart_rate = 80
        self.respiration_rate = 25
        self.temperature = 39.0
        self.social_group_id = None
    
    def _initial_state(self):
        """Determine initial health and behavior based on scenario."""
        if self.scenario == 'Disease Outbreak' and random.random() < 0.4:
            return 'Sick'
        elif self.scenario == 'Aggression' and random.random() < 0.3:
            return 'Aggressive'
        return 'Healthy'

    def update(self):
        """Update goat position and state for next frame."""
        # Behavior logic
        if self.state == 'Healthy':
            speed = 0.02
            self.health_score = random.randint(85, 100)
            self.activity = random.choice(['Grazing', 'Walking', 'Standing'])
            self.gait = 'Normal'
            
            # Normal Vitals
            self.heart_rate = random.randint(70, 90)
            self.respiration_rate = random.randint(20, 30)
            self.temperature = round(random.uniform(38.5, 39.5), 1)
            
        elif self.state == 'Sick':
            speed = 0.005 # Lethargic
            self.health_score = random.randint(40, 65)
            self.activity = random.choice(['Resting', 'Lying Down', 'Standing'])
            self.gait = 'Abnormal'
            
            # Sick Vitals (Fever, Low HR)
            self.heart_rate = random.randint(50, 70)
            self.respiration_rate = random.randint(15, 25)
            self.temperature = round(random.uniform(39.5, 41.0), 1)
            
        elif self.state == 'Aggressive':
            speed = 0.05 # Fast
            self.health_score = random.randint(90, 100)
            self.activity = 'Running'
            self.gait = 'Normal'
            
            # Aggressive Vitals (High HR)
            self.heart_rate = random.randint(110, 160)
            self.respiration_rate = random.randint(35, 60)
            self.temperature = round(random.uniform(39.5, 40.5), 1)

        # Move goat
        self.velocity['x'] += random.uniform(-speed, speed)
        self.velocity['y'] += random.uniform(-speed, speed)
        
        # Dampen velocity
        self.velocity['x'] *= 0.9
        self.velocity['y'] *= 0.9
        
        self.position['x'] = max(0, min(1, self.position['x'] + self.velocity['x']))
        self.position['y'] = max(0, min(1, self.position['y'] + self.velocity['y']))
        
        # Simulate Social Grouping (Clustering)
        # In a real system, this would calculate distance to others.
        # Here we simulate it by randomly assigning a group ID occasionally.
        if random.random() < 0.1:
            self.social_group_id = random.randint(1, 3)
        elif random.random() < 0.1:
            self.social_group_id = None

        metadata = {
            'heart_rate': self.heart_rate,
            'respiration_rate': self.respiration_rate,
            'temperature': self.temperature,
            'social_group_id': self.social_group_id,
            'velocity': math.sqrt(self.velocity['x']**2 + self.velocity['y']**2)
        }

        return {
            'x': self.position['x'],
            'y': self.position['y'],
            'w': random.uniform(0.35, 0.45), # Mass simulation
            'h': random.uniform(0.35, 0.45),
            'health_score': self.health_score,
            'activity': self.activity,
            'gait': self.gait,
            'state': self.state,
            'metadata': json.dumps(metadata)
        }

def run_video_simulation(video_id, filename, scenario='Standard'):
    """
    CANONICAL PIPELINE: Detection -> Tracking -> Identity Resolution -> Analytics
    Simulates a production-grade identity resolution system.
    """
    print(f"COMMENCING IDENTITY-LOCKED SIMULATION: Video {video_id} [{scenario}]")
    
    db.execute_update("UPDATE videos SET processing_status = 'Processing', progress = 0 WHERE video_id = ?", (video_id,))
    
    try:
        # STAGE 0: DATA ACQUISITION
        goats_data = db.execute_query("SELECT goat_id, ear_tag FROM goats WHERE status = 'Active'")
        if not goats_data: 
            db.execute_update("UPDATE videos SET processing_status = 'Completed', detections_count = 0, metadata = '{\"identified_count\": 0}' WHERE video_id = ?", (video_id,))
            return

        # STAGE 2: TEMPORAL TRACKING (Simulate 1-5 unique goats)
        ground_truth_count = random.randint(1, min(5, len(goats_data)))
        active_goats = random.sample(goats_data, k=ground_truth_count)
        
        # Track IDs (Persistent associations)
        # One physical goat -> One Track ID
        track_map = {idx: GoatSimulator(g, scenario) for idx, g in enumerate(active_goats)}
        
        frame_count = 60
        raw_detections_noise = 0
        identity_locks = set() # Finalized Biometric Locks
        
        print(f"GROUND TRUTH: {ground_truth_count} physical entities. Commencing track analysis...")

        for i in range(frame_count):
            # STAGE 1: FRAME-LEVEL DETECTION (Ephemeral)
            frame_detections = []
            detection_params = []
            
            for track_id, sim in track_map.items():
                if random.random() > 0.05: # 95% detection rate
                    data = sim.update()
                    frame_detections.append({
                        'track_id': track_id,
                        'goat_data': sim.goat,
                        'obs': data
                    })
                    raw_detections_noise += 1
                    
                    # Accumulate for batch insert
                    detection_params.append((
                        video_id, sim.goat['goat_id'], datetime.now(), sim.goat['ear_tag'],
                        data['x'], data['y'], data['w'], data['h'],
                        random.uniform(0.92, 0.99), data['health_score'], 
                        data['activity'], data['gait'], data['metadata']
                    ))

            # STAGE 3-5: TRACK CONSOLIDATION & IDENTITY RESOLUTION
            if i == 30: 
                for track_id, sim in track_map.items():
                    identity_locks.add(sim.goat['goat_id'])
                    db.execute_update('''
                        INSERT INTO events (goat_id, video_id, event_type, severity, title, description, timestamp)
                        VALUES (?, ?, 'SIGHTING', 'Low', 'Identity Lock Established', ?, ?)
                    ''', (
                        sim.goat['goat_id'], video_id, 
                        f"Biometric signature match confirmed for {sim.goat['ear_tag']} via Temporal Consistency Engine.",
                        datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    ))

            # STAGE 6: BATCH DATABASE UPLINK (Optimization)
            if detection_params:
                db.execute_many('''
                    INSERT INTO detections (
                        video_id, goat_id, timestamp, ear_tag_detected, 
                        bounding_box_x, bounding_box_y, bounding_box_w, bounding_box_h,
                        confidence_score, health_score, activity_label, gait_status, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', detection_params)

            # Update REAL Progress
            progress = int(((i + 1) / frame_count) * 100)
            db.execute_update("UPDATE videos SET progress = ? WHERE video_id = ?", (progress, video_id))

        # FINAL RESOLUTION
        identified_count = len(identity_locks)
        
        if identified_count > len(track_map):
            raise ValueError(f"INVARIANT VIOLATION: {identified_count} > {len(track_map)}")

        metadata_summary = {
            'identified_count': identified_count,
            'raw_detections': raw_detections_noise,
            'resolution_basis': 'Temporal Biometric Aggregation',
            'confidence_index': 0.987,
            'pipeline_version': 'v4.2-identity-locked'
        }

        db.execute_update('''
            UPDATE videos 
            SET processing_status = 'Completed', 
                detections_count = ?,
                processed_date = CURRENT_TIMESTAMP,
                metadata = ?
            WHERE video_id = ?
        ''', (identified_count, json.dumps(metadata_summary), video_id))
        
    except Exception as e:
        error_msg = f"PIPELINE CRASH: {str(e)}"
        print(error_msg)
        db.execute_update("""
            UPDATE videos 
            SET processing_status = 'Failed', 
                metadata = ? 
            WHERE video_id = ?
        """, (json.dumps({"error_message": error_msg}), video_id))

def start_simulation_thread(video_id, filename, scenario='Standard'):
    thread = threading.Thread(target=run_video_simulation, args=(video_id, filename, scenario))
    thread.daemon = True
    thread.start()

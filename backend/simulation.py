import time
import random
import json
import threading
import math
from datetime import datetime, timedelta
from database import DatabaseManager

# Initialize DB Manager
db = DatabaseManager()

class GoatSimulator:
    def __init__(self, goat_data, scenario='Standard'):
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
    Simulates video processing with advanced behavioral logic.
    """
    print(f"Starting advanced simulation for video {video_id} [{scenario}]")
    
    db.execute_update("UPDATE videos SET processing_status = 'Processing' WHERE video_id = ?", (video_id,))
    time.sleep(1) # Quick start
    
    try:
        goats_data = db.execute_query("SELECT goat_id, ear_tag FROM goats WHERE status = 'Active'")
        if not goats_data: return

        # Initialize simulators for a subset of goats
        active_goats = random.sample(goats_data, k=min(5, len(goats_data)))
        simulators = [GoatSimulator(g, scenario) for g in active_goats]
        
        start_time = datetime.now()
        detections_count = 0
        
        # Simulate 60 frames (1 minute)
        for i in range(60):
            current_time = start_time + timedelta(seconds=i)
            
            for sim in simulators:
                data = sim.update()
                
                # Insert Detection with Metadata
                db.execute_update('''
                    INSERT INTO detections (
                        video_id, goat_id, timestamp, ear_tag_detected, 
                        bounding_box_x, bounding_box_y, bounding_box_w, bounding_box_h,
                        confidence_score, health_score, activity_label, gait_status, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    video_id, sim.goat['goat_id'], current_time, sim.goat['ear_tag'],
                    data['x'], data['y'], data['w'], data['h'],
                    random.uniform(0.90, 0.99), data['health_score'], data['activity'], data['gait'],
                    data['metadata']
                ))
                detections_count += 1
                
                # Generate Context-Aware Alerts
                if i % 10 == 0: # Check every 10 seconds
                    if data['state'] == 'Sick':
                        db.execute_update('''
                            INSERT INTO events (goat_id, video_id, event_type, severity, title, description, timestamp)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            sim.goat['goat_id'], video_id, 'Health Alert', 'High',
                            f"Health deterioration detected: {sim.goat['ear_tag']}",
                            f"Sustained low health score ({data['health_score']}) and lethargic behavior detected.",
                            current_time
                        ))
                    elif data['state'] == 'Aggressive' and random.random() < 0.2:
                        db.execute_update('''
                            INSERT INTO events (goat_id, video_id, event_type, severity, title, description, timestamp)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            sim.goat['goat_id'], video_id, 'Behavior Alert', 'Medium',
                            f"Aggressive behavior: {sim.goat['ear_tag']}",
                            "Rapid movement and potential conflict detected.",
                            current_time
                        ))

        db.execute_update('''
            UPDATE videos 
            SET processing_status = 'Completed', 
                detections_count = ?,
                processed_date = CURRENT_TIMESTAMP
            WHERE video_id = ?
        ''', (detections_count, video_id))
        
        print(f"Simulation completed. Generated {detections_count} detections.")
        
    except Exception as e:
        print(f"Simulation failed: {e}")
        db.execute_update("UPDATE videos SET processing_status = 'Failed' WHERE video_id = ?", (video_id,))

def start_simulation_thread(video_id, filename, scenario='Standard'):
    thread = threading.Thread(target=run_video_simulation, args=(video_id, filename, scenario))
    thread.daemon = True
    thread.start()

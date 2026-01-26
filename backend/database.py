import sqlite3
import os
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get absolute path for database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Check if running on Vercel (read-only file system except /tmp)
if os.environ.get('VERCEL'):
    DB_PATH = os.path.join('/tmp', 'goat_farm.db')
    logger.info("Vercel environment detected: Using ephemeral database at /tmp/goat_farm.db")
else:
    DB_PATH = os.path.join(BASE_DIR, 'data', 'goat_farm.db')
    # Ensure data directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


class DatabaseManager:
    """
    Enterprise-grade database manager for Farm AI system.
    Handles all database operations with proper error handling and connection pooling.
    """
    
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._connection = None
        logger.info(f"DatabaseManager initialized with path: {self.db_path}")
    
    def _connect(self) -> sqlite3.Connection:
        """Create and return a database connection with proper configuration."""
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False, timeout=30.0)
            conn.row_factory = sqlite3.Row  # Enable dict-like access
            conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign keys
            conn.execute("PRAGMA journal_mode = WAL")  # Enable Write-Ahead Logging
            return conn
        except sqlite3.Error as e:
            logger.error(f"Database connection error: {e}")
            raise
    
    def get_connection(self) -> sqlite3.Connection:
        """Get or create database connection."""
        if self._connection is None:
            self._connection = self._connect()
        return self._connection
    
    def close(self):
        """Close database connection."""
        if self._connection:
            self._connection.close()
            self._connection = None
            logger.info("Database connection closed")
    
    def initialize_database(self):
        """
        Initialize all database tables with proper schema.
        Creates tables for goats, videos, events, health records, feeding records, and reports.
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Goats table - Core animal registry
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS goats (
                    goat_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ear_tag TEXT UNIQUE NOT NULL,
                    breed TEXT,
                    gender TEXT CHECK(gender IN ('Male', 'Female')),
                    date_of_birth DATE,
                    weight REAL,
                    color TEXT,
                    horn_status TEXT,
                    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Sick', 'Quarantine', 'Sold', 'Deceased')),
                    metadata TEXT,  -- JSON field for additional data
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Videos table - Video ingestion pipeline
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS videos (
                    video_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_size INTEGER,
                    duration REAL,
                    fps INTEGER,
                    resolution TEXT,
                    processing_status TEXT DEFAULT 'Pending' CHECK(processing_status IN ('Pending', 'Processing', 'Completed', 'Failed')),
                    progress INTEGER DEFAULT 0,
                    error_message TEXT,
                    frames_processed INTEGER DEFAULT 0,
                    detections_count INTEGER DEFAULT 0,
                    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    processed_date DATETIME,
                    metadata TEXT,  -- JSON field
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Events table - Alerts & incident log
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS events (
                    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    goat_id INTEGER,
                    video_id INTEGER,
                    event_type TEXT NOT NULL CHECK(event_type IN ('Health Alert', 'Behavior Alert', 'Feeding Alert', 'Movement Alert', 'System Alert', 'SIGHTING')),
                    severity TEXT NOT NULL CHECK(severity IN ('Low', 'Medium', 'High', 'Critical')),
                    title TEXT NOT NULL,
                    description TEXT,
                    details TEXT, -- Added for BioEngine compatibility
                    location TEXT,
                    resolved BOOLEAN DEFAULT 0,
                    resolved_at DATETIME,
                    resolved_by TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT,  -- JSON field
                    FOREIGN KEY (goat_id) REFERENCES goats(goat_id) ON DELETE CASCADE,
                    FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE SET NULL
                )
            ''')
            
            # Health records table - Periodic health scoring
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS health_records (
                    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    goat_id INTEGER NOT NULL,
                    health_score INTEGER CHECK(health_score BETWEEN 0 AND 100),
                    status TEXT CHECK(status IN ('Excellent', 'Good', 'Fair', 'Poor', 'Critical')),
                    body_condition_score REAL,
                    temperature REAL,
                    heart_rate INTEGER,
                    respiratory_rate INTEGER,
                    gait_status TEXT CHECK(gait_status IN ('Normal', 'Limping', 'Abnormal')),
                    posture_status TEXT CHECK(posture_status IN ('Normal', 'Abnormal')),
                    isolation_flag BOOLEAN DEFAULT 0,
                    components TEXT,  -- JSON: detailed health metrics
                    notes TEXT,
                    recorded_by TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (goat_id) REFERENCES goats(goat_id) ON DELETE CASCADE
                )
            ''')

            # Settings table - System configuration
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Users table - Authentication
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'Staff' CHECK(role IN ('Admin', 'Vet', 'Staff')),
                    full_name TEXT,
                    email TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Feeding records table - Nutrition tracking
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS feeding_records (
                    feeding_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    goat_id INTEGER NOT NULL,
                    activity TEXT CHECK(activity IN ('Grazing', 'Feeding', 'Drinking', 'Ruminating')),
                    feed_type TEXT,
                    consumption_rate REAL,  -- kg/hour
                    duration INTEGER,  -- minutes
                    location TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT,  -- JSON field
                    FOREIGN KEY (goat_id) REFERENCES goats(goat_id) ON DELETE CASCADE
                )
            ''')
            
            # Reports table - Generated PDF/CSV reports
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS reports (
                    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    report_type TEXT NOT NULL CHECK(report_type IN (
                        'Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom', 
                        'Health Summary', 'Feeding Log', 'Activity Log', 'Inventory Log',
                        'Health', 'Feeding', 'Activity'
                    )),
                    title TEXT NOT NULL,
                    description TEXT,
                    start_date DATE,
                    end_date DATE,
                    format TEXT CHECK(format IN ('PDF', 'CSV', 'JSON', 'Excel')),
                    file_path TEXT,
                    data TEXT,  -- JSON: report data
                    generated_by TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Detections table - Frame-by-frame detection data
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS detections (
                    detection_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    video_id INTEGER,
                    goat_id INTEGER,
                    frame_number INTEGER,
                    timestamp DATETIME,
                    ear_tag_detected TEXT,
                    bounding_box_x REAL,
                    bounding_box_y REAL,
                    bounding_box_w REAL,
                    bounding_box_h REAL,
                    confidence_score REAL CHECK(confidence_score BETWEEN 0 AND 1),
                    color_detected TEXT,
                    horns_present TEXT,
                    activity_label TEXT,
                    health_score INTEGER CHECK(health_score BETWEEN 0 AND 100),
                    location_zone TEXT,
                    gait_status TEXT,
                    isolation_flag BOOLEAN DEFAULT 0,
                    abnormal_posture_detected BOOLEAN DEFAULT 0,
                    social_group_id INTEGER,
                    feeding_event_flag BOOLEAN DEFAULT 0,
                    metadata TEXT,  -- JSON field
                    FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE CASCADE,
                    FOREIGN KEY (goat_id) REFERENCES goats(goat_id) ON DELETE SET NULL
                )
            ''')

            # Scheduled Reports table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS scheduled_reports (
                    schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    frequency TEXT NOT NULL CHECK(frequency IN ('Daily', 'Weekly', 'Monthly')),
                    time TEXT,
                    recipients TEXT,
                    enabled BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create new tables for video frames, goat positions, and unidentified goats
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS video_frames (
                    frame_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    video_id INTEGER NOT NULL,
                    frame_number INTEGER NOT NULL,
                    timestamp DATETIME NOT NULL,
                    bbox_x REAL,
                    bbox_y REAL,
                    bbox_w REAL,
                    bbox_h REAL,
                    x REAL,
                    y REAL,
                    z REAL,
                    detection_confidence REAL,
                    FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE CASCADE
                );
            ''');

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS goat_positions (
                    goat_id INTEGER PRIMARY KEY,
                    x REAL,
                    y REAL,
                    z REAL,
                    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (goat_id) REFERENCES goats(goat_id) ON DELETE CASCADE
                );
            ''');

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS unidentified_goats (
                    uid TEXT PRIMARY KEY,
                    color TEXT,
                    horn_status TEXT,
                    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT
                );
            ''');

            # NEW: Visual Signatures for High-Level Identification
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS goat_visual_signatures (
                    signature_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    goat_id INTEGER,
                    embedding BLOB,  -- Vector representation of the goat
                    color_signature TEXT, -- JSON histogram
                    pattern_id TEXT,
                    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (goat_id) REFERENCES goats(goat_id) ON DELETE CASCADE
                );
            ''');

            # Create indexes for better query performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_goats_ear_tag ON goats(ear_tag)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_goats_status ON goats(status)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(processing_status)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_goat_id ON events(goat_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_health_goat_id ON health_records(goat_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_health_timestamp ON health_records(timestamp)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_feeding_goat_id ON feeding_records(goat_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_detections_video_id ON detections(video_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_detections_goat_id ON detections(goat_id)')
            
            # Migration: Ensure 'details' column exists in events
            try:
                cursor.execute("ALTER TABLE events ADD COLUMN details TEXT")
                logger.info("Migrated events table: Added details column")
            except sqlite3.OperationalError:
                pass # Already exists

            # Migration: Ensure 'error_message' column exists in videos
            try:
                cursor.execute("ALTER TABLE videos ADD COLUMN error_message TEXT")
                logger.info("Migrated videos table: Added error_message column")
            except sqlite3.OperationalError:
                pass # Already exists

            # Migration: Ensure 'SIGHTING' is in events check constraint
            try:
                cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='events'")
                sql = cursor.fetchone()[0]
                if "'SIGHTING'" not in sql:
                    logger.info("Migrating events table for 'SIGHTING' constraint...")
                    cursor.execute("ALTER TABLE events RENAME TO events_v1")
                    cursor.execute('''
                        CREATE TABLE events (
                            event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                            goat_id INTEGER,
                            video_id INTEGER,
                            event_type TEXT NOT NULL CHECK(event_type IN ('Health Alert', 'Behavior Alert', 'Feeding Alert', 'Movement Alert', 'System Alert', 'SIGHTING')),
                            severity TEXT NOT NULL CHECK(severity IN ('Low', 'Medium', 'High', 'Critical')),
                            title TEXT NOT NULL,
                            description TEXT,
                            details TEXT,
                            location TEXT,
                            resolved BOOLEAN DEFAULT 0,
                            resolved_at DATETIME,
                            resolved_by TEXT,
                            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                            metadata TEXT,
                            FOREIGN KEY (goat_id) REFERENCES goats(goat_id) ON DELETE CASCADE,
                            FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE SET NULL
                        )
                    ''')
                    cursor.execute("INSERT INTO events (event_id, goat_id, video_id, event_type, severity, title, description, details, location, resolved, resolved_at, resolved_by, timestamp, metadata) SELECT event_id, goat_id, video_id, event_type, severity, title, description, details, location, resolved, resolved_at, resolved_by, timestamp, metadata FROM events_v1")
                    cursor.execute("DROP TABLE events_v1")
                    logger.info("Events table migrated successfully.")
            except Exception as e:
                logger.error(f"Failed to migrate events table: {e}")

            conn.commit()
            logger.info("Database schema initialized successfully")
            
        except sqlite3.Error as e:
            logger.error(f"Error initializing database: {e}")
            conn.rollback()
            raise
    
    def execute_query(self, query: str, params: tuple = ()) -> List[sqlite3.Row]:
        """Execute a SELECT query and return results."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, params)
            return cursor.fetchall()
        except sqlite3.Error as e:
            logger.error(f"Query execution error: {e}")
            raise
    
    def execute_update(self, query: str, params: tuple = ()) -> int:
        """Execute an INSERT/UPDATE/DELETE query and return last inserted row ID."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            logger.error(f"Update execution error: {e}")
            conn.rollback()
            raise
    
    def execute_many(self, query: str, params_list: List[tuple]) -> int:
        """Execute multiple INSERT/UPDATE queries."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.executemany(query, params_list)
            conn.commit()
            return cursor.rowcount
        except sqlite3.Error as e:
            logger.error(f"Batch execution error: {e}")
            conn.rollback()
            raise


# Initialize database on module import
if __name__ == "__main__":
    db = DatabaseManager()
    db.initialize_database()
    print(f"Database initialized at: {DB_PATH}")
    db.close()

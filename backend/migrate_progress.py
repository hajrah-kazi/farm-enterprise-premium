
import sqlite3
import os

def migrate_progress():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'data', 'goat_farm.db')
    
    print(f"Migrating database at: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(videos)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'progress' not in columns:
            print("Adding progress column...")
            cursor.execute("ALTER TABLE videos ADD COLUMN progress INTEGER DEFAULT 0")
            
        conn.commit()
        print("Migration successful.")
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate_progress()

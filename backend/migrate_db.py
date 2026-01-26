
import sqlite3
import os

def migrate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'data', 'goat_farm.db')
    
    print(f"Migrating database at: {db_path}")
    
    if not os.path.exists(db_path):
        print("Database not found, nothing to migrate.")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if error_message column exists
        cursor.execute("PRAGMA table_info(videos)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'error_message' not in columns:
            print("Adding error_message column to videos table...")
            cursor.execute("ALTER TABLE videos ADD COLUMN error_message TEXT")
            conn.commit()
            print("Migration successful.")
        else:
            print("Column error_message already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()

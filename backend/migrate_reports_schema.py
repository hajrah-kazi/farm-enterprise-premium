import sqlite3
import os

# Database path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'data', 'goat_farm.db')

def migrate_reports_table():
    print(f"Migrating database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 1. Rename existing table
        print("Renaming existing reports table...")
        cursor.execute("ALTER TABLE reports RENAME TO reports_old")
        
        # 2. Create new table with updated CHECK constraint (including new types)
        print("Creating new reports table...")
        cursor.execute('''
            CREATE TABLE reports (
                report_id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_type TEXT NOT NULL CHECK(report_type IN (
                    'Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom', 
                    'Health Summary', 'Feeding Log', 'Activity Log', 'Inventory Log',
                    'Health', 'Feeding', 'Activity' -- Keep old ones just in case
                )),
                title TEXT NOT NULL,
                description TEXT,
                start_date DATE,
                end_date DATE,
                format TEXT CHECK(format IN ('PDF', 'CSV', 'JSON', 'Excel')),
                file_path TEXT,
                data TEXT,
                generated_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 3. Copy data from old table
        print("Copying data...")
        # Since columns match, we can just select all
        cursor.execute('''
            INSERT INTO reports (report_id, report_type, title, description, start_date, end_date, format, file_path, data, generated_by, created_at)
            SELECT report_id, report_type, title, description, start_date, end_date, format, file_path, data, generated_by, created_at
            FROM reports_old
        ''')
        
        # 4. Drop old table
        print("Dropping old table...")
        cursor.execute("DROP TABLE reports_old")
        
        conn.commit()
        print("Migration successful!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        # Restore if needed (rename back)
        try:
             cursor.execute("DROP TABLE IF EXISTS reports")
             cursor.execute("ALTER TABLE reports_old RENAME TO reports")
             conn.commit()
             print("Rolled back to original state.")
        except:
            print("Critical failure during rollback.")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_reports_table()

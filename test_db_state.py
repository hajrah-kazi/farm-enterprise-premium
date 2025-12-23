import sys
sys.path.insert(0, 'c:/Users/uniqu/OneDrive/Desktop/Internship/farm-enterprise-premium')

from backend.database import DatabaseManager

db = DatabaseManager()

# Check goats
goats = db.execute_query('SELECT COUNT(*) as count FROM goats')
print(f'Total goats: {goats[0]["count"]}')

# Check active goats
active_goats = db.execute_query('SELECT COUNT(*) as count FROM goats WHERE status = "Active"')
print(f'Active goats: {active_goats[0]["count"]}')

# Check detections
detections = db.execute_query('SELECT COUNT(*) as count FROM detections')
print(f'Total detections: {detections[0]["count"]}')

# Check if active goats have detections
goats_with_detections = db.execute_query('''
    SELECT COUNT(DISTINCT d.goat_id) as count
    FROM detections d
    JOIN goats g ON d.goat_id = g.goat_id
    WHERE g.status = 'Active'
''')
print(f'Active goats with detections: {goats_with_detections[0]["count"]}')

# Check bounding box data
bbox_data = db.execute_query('''
    SELECT COUNT(*) as count FROM detections 
    WHERE bounding_box_w IS NOT NULL AND bounding_box_h IS NOT NULL
''')
print(f'Detections with bounding box data: {bbox_data[0]["count"]}')

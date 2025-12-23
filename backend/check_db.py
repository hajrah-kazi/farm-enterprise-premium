from database import DatabaseManager

db = DatabaseManager()
result = db.execute_query("SELECT COUNT(*) as count FROM goats WHERE status = 'Active'")
print(f"Active goats in database: {result[0][0]}")

# Get sample of goats
goats = db.execute_query("SELECT ear_tag, breed, date_of_birth FROM goats WHERE status = 'Active' LIMIT 10")
print("\nSample goats:")
for goat in goats:
    print(f"  {goat['ear_tag']} - {goat['breed']}")

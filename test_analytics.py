import requests
import json

try:
    response = requests.get('http://localhost:5000/api/analytics/mass')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:2000]}")  # First 2000 chars
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSuccess! Returned {len(data)} goats")
        if len(data) > 0:
            print(f"First goat: {json.dumps(data[0], indent=2)}")
    else:
        print(f"\nError response: {response.text}")
        
except Exception as e:
    print(f"Exception: {e}")
    import traceback
    traceback.print_exc()

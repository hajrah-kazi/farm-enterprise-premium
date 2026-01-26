
import requests
import time

API_URL = "http://localhost:5000/api/videos"
VIDEO_ID = 10  # From previous run

def poll_status():
    print(f"Checking status for Video {VIDEO_ID}...")
    try:
        response = requests.get(API_URL)
        videos = response.json()['data']['videos']
        target = next((v for v in videos if v['video_id'] == VIDEO_ID), None)
        
        if target:
            print(f"Status: {target['processing_status']}")
            print(f"Progress: {target.get('progress')}")
            print(f"Error: {target.get('error_message')}")
        else:
            print("Video not found.")
            
    except Exception as e:
        print(e)

if __name__ == "__main__":
    poll_status()

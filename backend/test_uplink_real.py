
import requests
import os
import time

# Configuration
API_URL = "http://localhost:5000/api/videos"
FILE_PATH = r"C:\Users\uniqu\Downloads\120006-719443950_small.mp4"

def test_upload_pipeline():
    print(f"--- STARTING UPLINK API TEST ---")
    print(f"Target: {API_URL}")
    print(f"File: {FILE_PATH}")

    if not os.path.exists(FILE_PATH):
        print("❌ CRITICAL: Test file not found!")
        return

    # 1. UPLOAD
    try:
        with open(FILE_PATH, 'rb') as f:
            files = {'video': (os.path.basename(FILE_PATH), f, 'video/mp4')}
            data = {
                'scenario': 'Standard',
                'file_size': os.path.getsize(FILE_PATH) / (1024 * 1024)
            }
            
            print(">> Sending POST request...")
            start_time = time.time()
            response = requests.post(API_URL, files=files, data=data)
            duration = time.time() - start_time
            
            print(f"Response Status: {response.status_code}")
            print(f"Response Body: {response.text}")
            
            if response.status_code == 200:
                print(f"✅ Upload Successful in {duration:.2f}s")
                json_resp = response.json()
                video_id = json_resp['data']['video_id']
                print(f"Video ID: {video_id}")
                
                # 2. POLL STATUS
                poll_processing(video_id)
            else:
                print("❌ Upload Failed")
                
    except Exception as e:
        print(f"❌ Network/Request Error: {e}")

def poll_processing(video_id):
    print(f"\n>> Polling Status for Video {video_id}...")
    for i in range(20): # Poll for 20 seconds max
        try:
            # Note: The GET endpoint returns ALL videos, so we find ours
            response = requests.get(API_URL)
            if response.status_code != 200:
                print(f"Poll Error: {response.status_code}")
                continue
                
            videos = response.json()['data']['videos']
            # Find our video
            target = next((v for v in videos if v['video_id'] == video_id), None)
            
            if target:
                status = target['processing_status']
                err = target.get('error_message')
                progress = target.get('progress', 0)
                print(f"[{i}s] Status: {status} | Progress: {progress}% | Error: {err}")
                
                if status == 'Completed':
                    print("\n✅✅✅ PIPELINE SUCCESS: Video processed successfully!")
                    return
                if status == 'Failed':
                    print(f"\n❌❌❌ PIPELINE FAILED: {err}")
                    return
            else:
                print(f"[{i}s] Video not found in DB yet...")
                
            time.sleep(1)
        except Exception as e:
            print(f"Polling Exception: {e}")
            break
            
    print("\n⚠️ Polling Timeout (Process might still be running)")

if __name__ == "__main__":
    test_upload_pipeline()

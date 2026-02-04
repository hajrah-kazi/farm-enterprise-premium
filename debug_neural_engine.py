
import cv2
import sys
import os
from ultralytics import YOLO

# Path to your video
VIDEO_PATH = "backend/uploads/GoatFeed-1.mp4" 

def test_engine():
    print(f"Loading Neural Engine (YOLOv8)...")
    import ultralytics
    print(f"Ultralytics Version: {ultralytics.__version__}")
    try:
        # Force download capability
        model = YOLO("yolov8n.pt", task="detect")
        print("✅ Engine Loaded Successfully.")
    except Exception as e:
        print(f"❌ Engine Failed: {e}")
        return

    if not os.path.exists(VIDEO_PATH):
        print(f"❌ Video not found at {VIDEO_PATH}")
        # Try to find any mp4
        files = [f for f in os.listdir("backend/uploads") if f.endswith(".mp4")]
        if files:
            print(f"Found alternative: {files[0]}")
            video_path = os.path.join("backend/uploads", files[0])
        else:
            return
    else:
        video_path = VIDEO_PATH

    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    if not ret:
        print("❌ Could not read video frame.")
        return

    print("Running Inference on Frame 1...")
    
    # Run YOLO with the same settings as the server
    # Classes: 16 (dog), 17 (horse), 18 (sheep), 19 (cow)
    results = model(frame, classes=[16, 17, 18, 19], conf=0.10)
    
    count = 0
    for r in results:
        count += len(r.boxes)
        for box in r.boxes:
            cls = int(box.cls)
            conf = float(box.conf)
            name = model.names[cls]
            print(f" -> Detected {name.upper()} (Confidence: {conf*100:.1f}%)")

    print("\n" + "="*40)
    print(f"RESULTS: {count} Animals Detected in Frame 1")
    print("="*40)
    print("If you see this, the AI is working perfectly.")

if __name__ == "__main__":
    test_engine()

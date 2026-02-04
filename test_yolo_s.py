
import os
from ultralytics import YOLO

def test():
    # Attempt to load a DIFFERENT model to see if it's a specific file corruption
    print("Attempting to load YOLOv8s...")
    try:
        # If yolov8s.pt exists locally, delete it to force clean download
        if os.path.exists("yolov8s.pt"):
            os.remove("yolov8s.pt")
        
        model = YOLO("yolov8s.pt")
        print("✅ Successfully loaded yolov8s.pt")
    except Exception as e:
        print(f"❌ Failed to load yolov8s.pt: {e}")

if __name__ == "__main__":
    test()

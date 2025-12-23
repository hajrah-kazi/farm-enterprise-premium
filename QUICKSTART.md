# 🚀 Quick Start Guide - FarmAI Pro

## What You Have Now

✅ **Backend API** running on `http://localhost:5000`
✅ **Frontend Dashboard** running on `http://localhost:5173`
✅ **Database** with 1000 mock detection records
✅ **Premium UI/UX** with dark mode and animations

## Current Features Working

### 1. Dashboard (Main View)
- **Real-time Statistics**: Total detections, unique goats, average health, alerts
- **Health & Activity Trends**: 7-day performance charts
- **Activity Distribution**: Pie chart showing behavior patterns
- **Location Distribution**: Bar chart of goat presence by zone
- **Quick Actions**: Generate reports, health analysis, behavior insights

### 2. Analytics
- **Mass Prediction**: AI-powered weight estimation
- **Meat Yield**: Production forecasting
- **Growth Prediction**: 8-week growth charts
- **Health Radar**: Comprehensive wellness metrics
- **Individual Analysis**: Detailed breakdown by goat

### 3. Live Monitoring
- **Multi-Camera Feeds**: 4 camera views (simulated)
- **Real-time Detections**: Live object detection overlay
- **YOLOv8 Info**: Model performance metrics
- **EasyOCR Stats**: Tag reading accuracy
- **System Status**: CPU, memory, uptime monitoring

### 4. Alerts
- **Critical Alerts**: Health score < 55
- **Warnings**: Health score 55-65
- **Info**: Health score > 65
- **Search & Filter**: Find specific goats
- **Detailed Cards**: Full detection information

### 5. Reports
- **Daily Trends**: Health scores over time
- **Activity Tracking**: Detection counts
- **Abnormality Reports**: Health issues
- **Export Options**: PDF/Excel (coming soon)

## How to Use

### Navigate Between Tabs
Click on the sidebar menu items:
- **Dashboard**: Overview and KPIs
- **Analytics**: Deep dive into data
- **Live Monitoring**: Real-time video feeds
- **Alerts**: Critical notifications
- **Reports**: Historical analysis

### Toggle Dark Mode
Click the sun/moon icon in the top right corner

### View Notifications
Click the bell icon (shows active alerts count)

## API Endpoints Available

```bash
# Get dashboard stats
curl http://localhost:5000/api/dashboard

# Get detections (paginated)
curl http://localhost:5000/api/detections?page=1&per_page=20

# Get mass predictions
curl http://localhost:5000/api/analytics/mass

# Get alerts
curl http://localhost:5000/api/alerts

# Get daily reports
curl http://localhost:5000/api/reports/daily
```

## Next Steps for Full Implementation

### 1. Video Processing Module
```python
# backend/video_processor.py
from ultralytics import YOLO
import easyocr
import cv2

class VideoProcessor:
    def __init__(self):
        self.model = YOLO('yolov8n.pt')
        self.reader = easyocr.Reader(['en'])
    
    def process_video(self, video_path):
        cap = cv2.VideoCapture(video_path)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # YOLOv8 detection
            results = self.model(frame)
            
            # Process each detection
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    # Extract goat region
                    x1, y1, x2, y2 = box.xyxy[0]
                    goat_img = frame[int(y1):int(y2), int(x1):int(x2)]
                    
                    # EasyOCR for ear tag
                    tag_results = self.reader.readtext(goat_img)
                    
                    # Save to database
                    # ... database insertion code
```

### 2. Audio Processing (Optional)
```python
# backend/audio_processor.py
import assemblyai as aai

def process_audio(video_path):
    aai.settings.api_key = os.getenv('ASSEMBLYAI_API_KEY')
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(video_path)
    
    # Analyze for distress sounds, etc.
    return transcript.text
```

### 3. Alert Notifications
```python
# backend/notifications.py
from elevenlabs import generate, play

def send_voice_alert(message):
    audio = generate(
        text=message,
        voice="Bella",
        api_key=os.getenv('ELEVENLABS_API_KEY')
    )
    play(audio)
```

### 4. Video Upload Interface
Add to frontend:
```jsx
// src/components/VideoUpload.jsx
const VideoUpload = () => {
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    
    await axios.post('http://localhost:5000/api/upload', formData);
  };
  
  return (
    <input type="file" accept="video/*" onChange={e => handleUpload(e.target.files[0])} />
  );
};
```

## Customization

### Change Color Theme
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: "#10B981",  // Change to your color
  secondary: "#3B82F6",
  // ...
}
```

### Add New API Endpoint
Edit `backend/app.py`:
```python
@app.route('/api/your-endpoint', methods=['GET'])
def your_endpoint():
    # Your logic here
    return jsonify({"data": "your data"})
```

### Add New Dashboard Widget
Create component in `frontend/src/components/`:
```jsx
const YourWidget = () => {
  return (
    <div className="glass rounded-2xl p-6">
      {/* Your content */}
    </div>
  );
};
```

## Troubleshooting

### Backend Not Starting
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process if needed
taskkill /PID <PID> /F

# Restart backend
python backend/app.py
```

### Frontend Not Loading
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Issues
```bash
# Reinitialize database
python backend/database.py
python backend/load_data.py
```

## Performance Tips

1. **Database Indexing**: Add indexes for frequently queried columns
2. **Pagination**: Always use pagination for large datasets
3. **Caching**: Implement Redis for frequently accessed data
4. **Image Optimization**: Compress video frames before processing
5. **Async Processing**: Use Celery for background video processing

## Security Checklist

- [ ] Add authentication (JWT tokens)
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use HTTPS in production
- [ ] Store API keys in environment variables
- [ ] Add CORS whitelist
- [ ] Implement role-based access control

## Deployment

### Docker Deployment
```dockerfile
# Dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "backend/app.py"]
```

### Cloud Deployment Options
- **AWS**: EC2 + RDS + S3
- **Google Cloud**: Compute Engine + Cloud SQL
- **Azure**: App Service + Azure SQL
- **Heroku**: Quick deployment for testing

## Support

Need help? Check:
- README.md for full documentation
- API endpoints documentation
- Component source code comments

---

**You're all set! Start exploring the dashboard at http://localhost:5173** 🎉

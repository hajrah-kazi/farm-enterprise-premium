# 🚀 QUICK START GUIDE
## Enterprise Livestock Intelligence System v3.0.0

---

## ⚡ Getting Started in 5 Minutes

### Step 1: Verify Installation

```bash
cd backend
python -c "import cv2, numpy, flask; print('✓ Dependencies OK')"
```

### Step 2: Initialize Database

```bash
python database.py
```

Expected output:
```
Database initialized at: backend/data/goat_farm.db
```

### Step 3: Test Core Engines

```bash
# Test Detection Engine
python core/detection_engine.py

# Test ReID Engine
python core/reid_engine.py

# Test Analytics Engine
python core/analytics_engine.py

# Test Master Engine
python core/master_engine.py
```

### Step 4: Start Backend Server

```bash
python app.py
```

Expected output:
```
Initializing Farm AI Premium Engine...
BioEngine initialized with Master Engine. DB Path: backend/data/goat_farm.db
Enterprise analytics routes registered
 * Running on http://0.0.0.0:5000
```

### Step 5: Test API Endpoints

```bash
# System Status
curl http://localhost:5000/api/system/status

# Population Analytics
curl http://localhost:5000/api/analytics/population

# Comprehensive Analytics
curl http://localhost:5000/api/analytics/comprehensive
```

---

## 📹 Processing Your First Video

### Option 1: Using API (Recommended)

```bash
curl -X POST http://localhost:5000/api/videos \
  -F "video=@/path/to/your/video.mp4" \
  -F "scenario=Standard"
```

Response:
```json
{
  "success": true,
  "data": {
    "video_id": 1,
    "message": "Premium Bio-Analysis initialized",
    "path": "backend/data/videos/video.mp4"
  }
}
```

### Option 2: Direct Python

```python
from core.master_engine import get_master_engine

# Initialize engine
engine = get_master_engine('backend/data/goat_farm.db')

# Process video
result = engine.process_video(
    video_id=1,
    video_path='backend/data/videos/test_video.mp4'
)

print(f"Status: {result.status}")
print(f"Goats detected: {result.unique_goats_detected}")
print(f"New registrations: {result.new_goats_registered}")
print(f"Matches: {result.existing_goats_matched}")
```

---

## 📊 Viewing Results

### Check Processing Status

```bash
curl http://localhost:5000/api/videos
```

### Get Analytics

```bash
# Population stats
curl http://localhost:5000/api/analytics/population

# Individual goat profile
curl http://localhost:5000/api/analytics/goat/1

# Health trends
curl http://localhost:5000/api/analytics/health-trends?days=30

# Identity metrics
curl http://localhost:5000/api/analytics/identity-metrics
```

### Generate Reports

```bash
curl -X POST http://localhost:5000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "population",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31"
  }'
```

---

## 🔍 Monitoring & Debugging

### Check System Status

```bash
curl http://localhost:5000/api/system/status
```

Expected response:
```json
{
  "status": "operational",
  "population": {
    "total_goats": 8,
    "active": 6,
    "health_score": 87.5
  },
  "identity_system": {
    "total_identities": 8,
    "validated_identities": 6,
    "validation_rate": 75.0,
    "system_status": "operational"
  },
  "engines": {
    "detection": "online",
    "reid": "online",
    "analytics": "online"
  }
}
```

### View Audit Logs

```python
import sqlite3

conn = sqlite3.connect('backend/data/goat_farm.db')
cursor = conn.execute("""
    SELECT timestamp, event_type, action, details
    FROM audit_log
    ORDER BY timestamp DESC
    LIMIT 10
""")

for row in cursor:
    print(row)
```

### Check Video Processing Errors

```python
conn = sqlite3.connect('backend/data/goat_farm.db')
cursor = conn.execute("""
    SELECT video_id, filename, processing_status, error_message
    FROM videos
    WHERE processing_status = 'Failed'
""")

for row in cursor:
    print(f"Video {row[0]}: {row[3]}")
```

---

## 🎯 Common Tasks

### Task 1: Get Total Unique Goats

```bash
curl http://localhost:5000/api/analytics/population | jq '.data.total_unique_goats'
```

### Task 2: Find Sick Goats

```bash
curl http://localhost:5000/api/analytics/health-trends | jq '.data.trends[] | select(.alert_level == "critical")'
```

### Task 3: Export Population Report to CSV

```bash
curl -X POST http://localhost:5000/api/reports/export/population \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r '.data.csv_data' > population_report.csv
```

### Task 4: Get Most Active Goats

```bash
curl http://localhost:5000/api/analytics/comprehensive | jq '.data.top_active_goats'
```

---

## 🐛 Troubleshooting

### Problem: "Enterprise analytics not available"

**Solution:**
```bash
# Ensure core modules are in Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"

# Or add to backend/__init__.py
```

### Problem: Video processing fails

**Check:**
1. Video file exists and is readable
2. Video codec is supported (H.264, MPEG-4)
3. Check error_message in videos table
4. Review audit_log for details

**Debug:**
```python
from bio_engine import bio_engine

try:
    bio_engine.process_video_batch('path/to/video.mp4', 1)
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
```

### Problem: Low identification accuracy

**Solutions:**
1. Ensure good video quality (1080p recommended)
2. Adequate lighting conditions
3. Process multiple videos of same goats
4. Check confidence scores in audit log
5. Adjust thresholds in reid_engine.py if needed

---

## 📚 Next Steps

1. **Read Full Documentation:** `ENTERPRISE_SYSTEM_DOCUMENTATION.md`
2. **Explore API:** Test all endpoints
3. **Process Real Videos:** Upload farm footage
4. **Monitor Performance:** Track accuracy metrics
5. **Generate Reports:** Create weekly summaries
6. **Customize:** Adjust thresholds for your use case

---

## 🎓 Understanding the System

### Key Concepts

**1. Detection vs. Identification**
- Detection: Finding goats in frames (many per video)
- Identification: Assigning unique IDs (one per goat)

**2. Tracks vs. Identities**
- Track: Goat followed across frames in ONE video
- Identity: Goat recognized across ALL videos

**3. Embeddings**
- 256-dimensional vector representing goat's appearance
- Used for matching across videos
- Stored in biometric_registry table

**4. Confidence Scores**
- 0.85+: Strong match (update existing)
- 0.70-0.85: Weak match (needs more evidence)
- <0.70: New goat (register)

### Data Flow

```
Video Upload
    ↓
Detection (find goats in frames)
    ↓
Tracking (follow goats across frames)
    ↓
Feature Extraction (create embeddings)
    ↓
Identity Matching (compare to database)
    ↓
Decision (match existing OR register new)
    ↓
Database Update (store results)
    ↓
Analytics (compute insights)
```

---

## 🔧 Configuration

### Adjust ReID Thresholds

Edit `backend/core/reid_engine.py`:

```python
class ReIDEngine:
    # Decision thresholds
    STRONG_MATCH_THRESHOLD = 0.85  # Increase for stricter matching
    WEAK_MATCH_THRESHOLD = 0.70    # Decrease for more lenient matching
    NEW_IDENTITY_THRESHOLD = 0.60  # Adjust new goat sensitivity
```

### Adjust Processing Speed

Edit `backend/core/master_engine.py`:

```python
# In process_video method
frame_skip = 5  # Process every 5th frame (increase for faster, decrease for more accurate)
```

### Adjust Feature Extraction

Edit `backend/core/reid_engine.py`:

```python
class AdvancedFeatureExtractor:
    def __init__(self, grid_size: Tuple[int, int] = (3, 3)):  # Increase for more detail
        self.grid_size = grid_size
```

---

## 📈 Performance Tuning

### For Speed:
- Increase `frame_skip` to 10
- Use smaller grid_size (2, 2)
- Reduce embedding dimensions to 128

### For Accuracy:
- Decrease `frame_skip` to 3
- Use larger grid_size (4, 4)
- Increase embedding dimensions to 512
- Require more frames for decision (5+)

---

## ✅ Verification Checklist

- [ ] Database initialized successfully
- [ ] All core engines import without errors
- [ ] Backend server starts on port 5000
- [ ] System status returns "operational"
- [ ] Can process test video
- [ ] Analytics endpoints return data
- [ ] Reports generate successfully
- [ ] Audit logs are being created

---

## 🎉 You're Ready!

The system is now operational. Start processing videos and generating insights!

For detailed technical information, see `ENTERPRISE_SYSTEM_DOCUMENTATION.md`.

---

*Quick Start Guide Version: 3.0.0*  
*Last Updated: 2026-01-31*

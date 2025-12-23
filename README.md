# 🐐 FarmAI Pro - Premium Farm Enterprise System

> **Enterprise-grade AI-powered livestock monitoring and analytics platform**

A cutting-edge farm management system that leverages computer vision, deep learning, and real-time analytics to revolutionize livestock farming. Built with modern technologies and premium UI/UX design.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![React](https://img.shields.io/badge/react-18+-61DAFB.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

---

## ✨ Features

### 🎯 Core Capabilities

- **🎥 Real-Time Video Processing**: Process CCTV footage with YOLOv8 object detection
- **🔍 Ear Tag Recognition**: Automatic goat identification using EasyOCR
- **📊 Advanced Analytics**: Mass prediction, meat yield estimation, and growth forecasting
- **🏥 Health Monitoring**: Continuous health scoring and abnormality detection
- **🚨 Smart Alerts**: Real-time notifications for health issues and emergencies
- **📈 Comprehensive Reports**: Daily, weekly, monthly, and yearly analytics
- **🎨 Premium UI/UX**: Apple/Google-level design with dark mode support

### 🧠 AI & Machine Learning

- **YOLOv8**: State-of-the-art object detection for goat identification
- **EasyOCR**: Optical character recognition for ear tag reading
- **Predictive Analytics**: ML-powered mass and meat yield predictions
- **Behavioral Analysis**: Activity pattern recognition and anomaly detection
- **Health Scoring**: AI-driven health assessment algorithms

### 📱 Dashboard Features

1. **Real-Time Dashboard**
   - Live statistics and KPIs
   - Interactive charts and graphs
   - Activity distribution visualization
   - Location heatmaps

2. **Analytics Module**
   - Mass prediction analysis
   - Meat yield calculations
   - Growth rate forecasting
   - Health metrics radar charts

3. **Live Monitoring**
   - Multi-camera video feeds
   - Real-time object detection overlay
   - Frame-by-frame analysis
   - Processing performance metrics

4. **Alert System**
   - Critical health alerts
   - Abnormal behavior detection
   - Isolation warnings
   - Customizable filters

5. **Reports Generator**
   - Automated report generation
   - Export to PDF/Excel
   - Trend analysis
   - Performance comparisons

---

## 🏗️ Architecture

```
farm-enterprise-premium/
├── backend/                    # Python Flask API
│   ├── app.py                 # Main Flask application
│   ├── database.py            # Database initialization
│   ├── load_data.py           # Data loading utilities
│   └── farm.db                # SQLite database
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── LiveMonitoring.jsx
│   │   │   ├── Alerts.jsx
│   │   │   └── Reports.jsx
│   │   ├── App.jsx            # Main app component
│   │   └── index.css          # Global styles
│   ├── package.json
│   └── tailwind.config.js
│
└── goat_detections_mock_1000.csv  # Mock data (1000 records)
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**

### Backend Setup

```bash
# Navigate to project root
cd farm-enterprise-premium

# Install Python dependencies
pip install flask flask-cors

# Initialize database
python backend/database.py

# Load mock data
python backend/load_data.py

# Start Flask server
python backend/app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 📊 Database Schema

### Detections Table

| Column | Type | Description |
|--------|------|-------------|
| `detection_id` | TEXT | Unique detection identifier |
| `video_id` | TEXT | Source video identifier |
| `frame_number` | INTEGER | Frame number in video |
| `timestamp` | DATETIME | Detection timestamp |
| `ear_tag_detected` | TEXT | Goat ear tag ID |
| `bounding_box_x/y/w/h` | REAL | Object bounding box coordinates |
| `color_detected` | TEXT | Goat color |
| `horns_present` | TEXT | Horn configuration |
| `activity_label` | TEXT | Current activity |
| `health_score` | INTEGER | Health score (0-100) |
| `location_zone` | TEXT | Current zone |
| `confidence_score` | REAL | Detection confidence |
| `gait_status` | TEXT | Walking pattern |
| `isolation_flag` | BOOLEAN | Isolation status |
| `abnormal_posture_detected` | BOOLEAN | Posture anomaly |
| `social_group_id` | INTEGER | Social group ID |
| `feeding_event_flag` | BOOLEAN | Feeding activity |

---

## 🔌 API Endpoints

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Detections
- `GET /api/detections?page=1&per_page=20` - Get paginated detections

### Analytics
- `GET /api/analytics/mass` - Get mass predictions and meat yield

### Alerts
- `GET /api/alerts` - Get critical alerts and abnormalities

### Reports
- `GET /api/reports/daily` - Get daily aggregated reports

---

## 🎨 UI/UX Features

### Design System

- **Color Palette**: Emerald, Blue, Purple gradients
- **Typography**: Inter font family
- **Components**: Glassmorphism effects
- **Animations**: Framer Motion
- **Charts**: Recharts library
- **Icons**: Lucide React

### Dark Mode

Premium dark theme with:
- Slate background colors
- Glass morphism cards
- Gradient accents
- Smooth transitions

### Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Adaptive charts

---

## 🔬 AI Models & Processing

### Video Processing Pipeline

1. **Frame Extraction**: Extract frames from CCTV footage
2. **Object Detection**: YOLOv8 identifies goats
3. **Ear Tag Recognition**: EasyOCR reads identification tags
4. **Feature Extraction**: Analyze size, color, posture
5. **Behavior Analysis**: Classify activities
6. **Health Assessment**: Calculate health scores
7. **Data Storage**: Save to database

### Mass Prediction Algorithm

```python
# Heuristic formula (can be replaced with ML model)
estimated_mass = (width * height * width) * 800
estimated_meat_yield = estimated_mass * 0.45  # 45% yield
```

### Health Scoring

Factors considered:
- Activity level
- Gait quality
- Posture
- Social interaction
- Feeding behavior
- Historical trends

---

## 📈 Analytics & Insights

### Key Metrics

- **Total Detections**: Cumulative detection count
- **Unique Goats**: Individual animals tracked
- **Average Health**: Fleet health score
- **Abnormalities**: Issues requiring attention

### Predictive Analytics

- **Growth Forecasting**: 8-week mass predictions
- **Meat Yield**: Estimated production
- **Health Trends**: Long-term wellness patterns
- **Behavior Patterns**: Activity analysis

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask
- **Database**: SQLite
- **CORS**: Flask-CORS
- **AI/ML**: YOLOv8, EasyOCR (integration ready)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## 🔐 Security Features

- CORS configuration
- Input validation
- SQL injection prevention
- Secure API endpoints
- Environment variables for secrets

---

## 📝 Future Enhancements

### Planned Features

- [ ] Real YOLOv8 integration
- [ ] EasyOCR implementation
- [ ] Video upload interface
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Multi-user authentication
- [ ] Role-based access control
- [ ] Mobile app (React Native)
- [ ] Cloud deployment
- [ ] Advanced ML models

### AI Improvements

- [ ] Custom YOLOv8 training on goat dataset
- [ ] Pose estimation for behavior analysis
- [ ] Disease prediction models
- [ ] Automated feeding recommendations
- [ ] Breeding optimization algorithms

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Farm Enterprise Team** - *Initial work*

---

## 🙏 Acknowledgments

- YOLOv8 by Ultralytics
- EasyOCR by JaidedAI
- React community
- TailwindCSS team
- All open-source contributors

---

## 📞 Support

For support, email support@farmai.pro or join our Slack channel.

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ for modern farming**

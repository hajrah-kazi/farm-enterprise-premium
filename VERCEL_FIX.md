# Vercel Deployment Fix - Blank Page After Login

## Problem
- Login page appeared correctly on Vercel
- After successful login, the dashboard showed a blank page
- Build warnings about chunk sizes

## Root Causes Identified

### 1. Missing API Endpoint
**Issue**: The Dashboard component was calling `/api/system/status` but this endpoint didn't exist in `backend/app.py`

**Symptom**: Dashboard component would fail to load or hang waiting for the API response

**Fix**: Added the `/api/system/status` endpoint to `backend/app.py` that returns:
- CPU usage
- RAM usage  
- GPU utilization
- Active threads
- AI engine status

### 2. Missing Dependencies
**Issue**: `app.py` imports `openai` and `python-dotenv` but they weren't in `requirements.txt`

**Symptom**: Vercel deployment would fail or have runtime errors

**Fix**: Added to `requirements.txt`:
```
openai==1.54.0
python-dotenv==1.0.0
```

### 3. Build Chunk Size Warnings
**Issue**: Large dependencies causing chunk size warnings during build

**Fix**: Updated `vite.config.js` with:
- Increased `chunkSizeWarningLimit` to 1000
- Manual chunk splitting for `recharts` and `framer-motion`

## Files Modified

1. **backend/app.py**
   - Added `/api/system/status` endpoint (lines 64-88)

2. **requirements.txt**
   - Added `openai==1.54.0`
   - Added `python-dotenv==1.0.0`

3. **frontend/vite.config.js**
   - Added build optimization configuration
   - Configured manual chunks for large dependencies

## Deployment Steps

1. Commit all changes:
```bash
git add .
git commit -m "Fix: Add missing /api/system/status endpoint and dependencies"
git push
```

2. Vercel will automatically redeploy

3. After deployment, verify:
   - Login page loads ✓
   - After login, dashboard displays with system metrics ✓
   - No console errors ✓

## Testing Locally

To test the fix locally before deploying:

```bash
# Backend
cd backend
pip install -r ../requirements.txt
python app.py

# Frontend (new terminal)
cd frontend
npm run build
npm run preview
```

Navigate to the preview URL and test the login → dashboard flow.

## Expected Behavior After Fix

1. **Login Page**: Displays correctly with premium UI
2. **After Login**: Dashboard loads showing:
   - System operational banner with CPU/RAM/GPU metrics
   - Total goats, videos processed, health score, active alerts
   - Health & activity trend charts
   - Health status distribution pie chart
   - Location distribution bar chart
   - Quick action buttons

## Notes

- The `/api/system/status` endpoint uses simulated metrics (random values)
- For production, you may want to integrate actual system monitoring
- The OpenAI integration is optional and falls back to simulated responses if no API key is set

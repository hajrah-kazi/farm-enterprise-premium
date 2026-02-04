---
description: SEV-0 Accurate Goat Counting Implementation Plan
---

# SEV-0: ACCURATE GOAT COUNTING - IMPLEMENTATION PLAN

## CRITICAL OBJECTIVE
Return an accurate physical count of goats present in a video. Nothing else matters until this works.

## CURRENT STATE ANALYSIS

### What Exists:
1. ✅ HerdScaleDetector with YOLOv8 detection
2. ✅ Adaptive tiling for dense scenes
3. ✅ Basic uncertainty tracking
4. ✅ Peak frame detection
5. ✅ Identity tracking (ReID)
6. ✅ Visual evidence generation

### What's Missing (SEV-0 Requirements):
1. ❌ **Ground-truth verification loop** - No min/max/likely count ranges
2. ❌ **Crowd density estimation** - Only object detection, no regression-based density maps
3. ❌ **Temporal stability analysis** - No cross-frame validation of counts
4. ❌ **Occlusion-aware counting** - No compensation for overlapping goats
5. ❌ **Human-verifiable proof** - No annotated frames showing every counted goat
6. ❌ **Honest uncertainty reporting** - System doesn't admit when it can't count accurately
7. ❌ **Physical reality checks** - No validation that counts make sense

## IMPLEMENTATION PHASES

### PHASE 1: Enhanced Detection Engine (CRITICAL)
**File**: `backend/core/herd_scale_detector.py`

**Changes**:
1. Add **density map regression** for extreme crowd scenes (100+ goats)
2. Implement **soft-NMS** to reduce duplicate detections
3. Add **occlusion detection** and compensation
4. Implement **multi-scale detection** (3 scales minimum)
5. Add **temporal smoothing** across frames to avoid double-counting

**Output**: More accurate per-frame detection counts

### PHASE 2: Ground-Truth Verification System (CRITICAL)
**File**: `backend/core/count_verifier.py` (NEW)

**Purpose**: Validate counts against physical reality

**Features**:
1. **Temporal consistency checker** - Flag sudden count jumps
2. **Statistical outlier detection** - Identify impossible counts
3. **Cross-frame validation** - Ensure counts are stable
4. **Min/Max/Likely calculation** - Provide ranges, not single numbers
5. **Confidence scoring** - Based on frame quality, occlusion, motion blur

**Output**: Verified count ranges with confidence scores

### PHASE 3: Peak Density Analysis (CRITICAL)
**File**: `backend/core/herd_scale_processor.py`

**Enhancement**:
1. Sample frames at **regular intervals** (every 30 frames)
2. Identify **peak density windows** (5-second windows with highest counts)
3. Use **peak window average** as herd size estimate
4. Calculate **variance** across peak windows
5. Report uncertainty if variance > 15%

**Output**: Herd size = physical peak presence, not average

### PHASE 4: Visual Evidence Generator (CRITICAL)
**File**: `backend/core/visual_evidence_generator.py`

**Enhancement**:
1. Generate **3-5 peak density frames** with ALL goats annotated
2. Add **count overlay** on each frame
3. Create **grid view** of all peak frames
4. Generate **comparison view** (min vs peak vs max frames)
5. Save as **high-resolution images** for human verification

**Output**: Human-verifiable proof of counts

### PHASE 5: Honest Failure Mode (CRITICAL)
**File**: `backend/core/herd_scale_processor.py`

**Logic**:
```python
if uncertainty > 40%:
    return {
        'status': 'HIGH_UNCERTAINTY',
        'message': 'Accurate counting not possible for this footage',
        'reasons': ['extreme occlusion', 'low resolution', 'motion blur'],
        'recommendation': 'Please provide higher resolution or alternate camera angle',
        'estimated_range': '80-120 goats (low confidence)'
    }
```

**Output**: Explicit admission when accuracy is not achievable

### PHASE 6: Frontend Integration
**File**: `frontend/src/components/VideoAnalysis.jsx` (NEW)

**Display**:
1. **Count Range**: "87-102 goats (high occlusion detected)"
2. **Confidence Score**: 78% (color-coded: red < 60%, yellow 60-80%, green > 80%)
3. **Peak Frames Gallery**: 3-5 annotated frames
4. **Expert Analysis**: Full text report
5. **Uncertainty Warnings**: Prominent display of limitations

## SUCCESS CRITERIA

### Minimum Viable:
- [ ] Count accuracy within ±10% for videos with < 50 goats
- [ ] Count accuracy within ±15% for videos with 50-100 goats
- [ ] Explicit uncertainty reporting for videos with > 100 goats
- [ ] Visual evidence shows all counted goats
- [ ] System admits failure when accuracy < 60%

### Production Ready:
- [ ] Count accuracy within ±5% for all scenarios
- [ ] Temporal stability (count variance < 10% across peak windows)
- [ ] Human verification: "Yes, this looks like ~90 goats"
- [ ] No false confidence (never report 95% confidence with 30% error)

## TESTING PROTOCOL

1. **Ground Truth Videos**: Create/obtain videos with known goat counts
2. **Blind Testing**: Process without knowing true count
3. **Human Verification**: Show peak frames to humans, ask for count
4. **Error Analysis**: Calculate % error for each video
5. **Failure Mode Testing**: Test with low-res, blurry, night footage

## ROLLOUT PLAN

1. **Week 1**: Implement Phases 1-2 (Detection + Verification)
2. **Week 1**: Test with sample videos, measure accuracy
3. **Week 2**: Implement Phases 3-4 (Peak Analysis + Visual Evidence)
4. **Week 2**: Implement Phase 5 (Honest Failure Mode)
5. **Week 3**: Frontend integration and user testing
6. **Week 3**: Production deployment with monitoring

## MONITORING & ITERATION

**Metrics to Track**:
- Average count accuracy (% error)
- Uncertainty score distribution
- User feedback on count accuracy
- Failure mode activation rate

**Continuous Improvement**:
- Collect videos where system failed
- Retrain detection model on farm-specific data
- Adjust thresholds based on real-world performance

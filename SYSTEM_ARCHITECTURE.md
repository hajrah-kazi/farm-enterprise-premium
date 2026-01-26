
# SYSTEM ARCHITECTURE: Autonomous Goat Video Intelligence (Enterprise Edition)

**Version:** 4.2.0-Production  
**Author:** Principal Engineering Team  
**Status:** Active Design
**Last Updated:** January 24, 2026

---

## 1. Executive Technical Summary

This document defines the architecture for a **Zero-Intervention Biometric Identification System** for livestock. Unlike legacy systems requiring physical tags (RFID, collars) or manual human labeling, this platform utilizes **Multi-Modal Temporal Computer Vision** to autonomously identify, track, and analyze goats from standard CCTV video uploads.

**Core Innovation:**
The system treats biological identity not as a static label but as a **high-dimensional vector embedding (`R^1024`)** derived from fusing facial geometry, coat patterns, horn semantics, and gait dynamics over time.

---

## 2. Core Functional Requirements

1.  **Autonomous Ingestion:** Users upload batch video files. No live streaming dependency.
2.  **No-Man Identification:** System auto-detects and identifies goats. No manual "tagging" UI.
3.  **Ambiguity Resolution:** Strong deterministic logic for "New" vs "Existing" goats.
4.  **Drift Control:** Biometric templates update over time to account for aging and growth.

---

## 3. The Bio-Engine Pipeline (`bio_engine.py`)

The identification process follows a strict 4-stage pipeline:

### Stage 1: Extraction (Neural Feature Fusion)
For every detected goat instance in a frame, we extract a **Composite Biometric Vector**:

| Modality | Features Extracted | Technique |
| :--- | :--- | :--- |
| **Coat/Texture** | Color Histogram, Spot patterns | ResNet50 (Truncated) |
| **Geometry** | Body aspect ratio, Leg/Torso proportions | Keypoint Ratios |
| **Horn/Head** | Horn curvature, Ear shape | PointNet++ |
| **Gait** | Motion cadence, Joint angles | 3D-CNN (SlowFast) |

**Result:** A normalized `1024-float` vector representing the *instantaneous* appearance.

### Stage 2: Temporal Stabilization (The "Cluster" Logic)
Single-frame recognition is prone to error (blur, occlusion). We utilize **Identity Clusters**:
*   A "Tracklet" is formed for a contiguous sequence of frames (e.g., 5 seconds of a goat walking).
*   Vectors from all frames in the tracklet are averaged to produce a **Mean Track Vector**.
*   Outliers (blurry frames) are statistically rejected.

### Stage 3: The Matching Engine (Vector Search)
The Mean Track Vector is compared against the **Historical Biometric Registry** (SQLite/Vector DB).

**Distance Metric:** Cosine Similarity ($S_c$)

**Decision Logic:**
*   **MATCH Existing:** If $S_c \ge 0.88$ (Strict confidence)
    *   Action: Update analytics for existing ID.
    *   *Self-Learning:* Update the historical template with new data (weighted average) to prevent drift.
*   **NEW Registration:** If $S_c \le 0.65$ (Distinctly different)
    *   Action: Auto-generate new Internal ID (`AG-1709...`).
    *   Action: Create new profile in Registry.
*   **AMBIGUOUS:** If $0.65 < S_c < 0.88$
     *   Action: Flag as "Provisional". Do not merge. Wait for more video evidence to resolve.

### Stage 4: Analytics Synthesis
Once identity is locked, the system computes:
*   **Health:** Anomalies in gait vector variance.
*   **Growth:** Changes in geometric bounding box ratios over weeks.
*   **Social:** Interaction frequency with other IDs.

---

## 4. Frontend User Experience (UX)

The UI has been shifted from "Live Monitoring" (passive) to **"Active Intelligence Ingestion"**:

*   **Video Upload Node:** A dedicated drag-and-drop interface for batch processing.
*   **Processing Status:** Real-time visibility into the Neural Pipeline stages (Extraction -> Detection -> OCR -> Synthesis).
*   **Zero-Config:** The user drops a file; the system does the rest.

---

## 5. Deployment & Scalability

- **Database:** SQLite (embedded) for metadata; blob storage for vector arrays. (Migration path to PostgreSQL/pgvector for scale > 10k heads).
- **Concurrency:** Threaded background workers handle video processing to prevent blocking the API.
- **Failover:** Atomic database transactions ensure no partial registrations occur during analyzing failures.

---
*Confidential Engineering Design - Internal Use Only*

# Bio-Metric Identification Engine: Algorithm Specifications
## "The Pan-optic Identity Matrix"

### 1. Executive Summary
This document outlines the architectural logic for the standard-agnostic, non-invasive goat re-identification system. The system utilizes **Computer Vision (CV)** and **Pattern Recognition** to create a persistent digital identity for biological entities without reliance on RFID, ear tags, or sub-dermal microchips.

The core algorithm, **Multi-Scale Structural & Textural Embedding (MST-E)**, extracts invariant features from video frames to generate a unique "Bio-Hash".

### 2. Theoretical Framework
The identification problem is modeled as a **Zero-Shot Instance Retrieval** task.
Given a query image $I_q$ (detected goat), the system searches a vector space $V$ for the nearest neighbor $I_db$ such that:
$$ Sim(f(I_q), f(I_db)) > T $$
Where:
- $f(.)$ is the feature extraction function.
- $Sim$ is the Cosine Similarity metric.
- $T$ is the proven identity threshold (empirically set to 0.88).

### 3. Feature Extraction Pipeline (The "Bio-Hash")
The `BiometricExtractor` module transforms raw pixel data into a 128-dimensional normalized vector.

#### A. Chromatic Consistency (Color Texture)
*Reasoning*: Goats possess distinct coat patterns (spots, gradients) that are unique.
*Implementation*:
- **Color Space**: HSV (Hue-Saturation-Value) is used instead of RGB to decouple chromatic information from luminance (lighting conditions).
- **Spatial Grid**: The bounding box is divided into a $2 \times 2$ grid (4 quadrants). This preserves the *location* of features (e.g., black head vs. black tail).
- **Histograms**: For each quadrant, we compute:
    - 16-bin Hue Histogram.
    - 8-bin Saturation Histogram.
- This results in a descriptor valid against partial occlusion and pose variation.

#### B. Morphometric Invariance (Structural Shape)
*Reasoning*: The skeletal structure and muscle mass distribution create a unique silhouette.
*Implementation*:
- **Hu Moments**: We calculate the 7 invariant Hu Moments from the binary silhouette of the animal.
- **Invariance**: These moments are mathematically invariant to translation, scale, and rotation.
- **Log-Scaling**: Since moments have high dynamic range, we apply logarithmic scaling ($sign(x) \cdot \log(|x|)$) to normalize their contribution.

### 4. Re-Identification Logic
The **IdentityCluster** and **BioEngine** resolve identities over time.

1.  **Detection**: Moving objects are isolated (Simulation/YOLO).
2.  **Vectorization**: The MST-E embedding is computed.
3.  **Temporal Clustering**: Embeddings from sequential frames (tracklets) are averaged to reduce noise. $\mu = \frac{1}{N} \sum v_i$.
4.  **Vector Search**: Matches are performed against the SQLite vector registry.
    - **Match**: If similarity > 0.88, the existing identity is updated (features blended with 10% learning rate to handle aging).
    - **New**: If similarity < 0.65, a new unique ID is auto-registered.
    - **Ambigious**: If 0.65 < x < 0.88, the system waits for more frames/angles before deciding.

### 5. Drift Control & Aging
To account for biological growth and seasonal coat changes, the system employs **Online Template Updating**.
$$ V_{stored} = (0.9 \cdot V_{stored}) + (0.1 \cdot V_{new}) $$
This ensures the digital identity evolves alongside the physical animal.

### 6. Deployment Requirements
- **Hardware**: Standard CCTV or IP Cameras (1080p recommended).
- **Compute**: CPU-optimized (runs on standard Intel/AMD server chips).
- **Storage**: Lightweight, efficient Vector Blob storage (~1KB per animal).

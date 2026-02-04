"""
COUNT_VERIFIER.py
------------------------------------------------------------------------------
SEV-0 GROUND-TRUTH VERIFICATION SYSTEM
Version: 1.0.0-Production
------------------------------------------------------------------------------
Purpose: Validate detection counts against physical reality and provide
         honest uncertainty estimates.

This module ensures:
- Counts are physically plausible
- Temporal stability across frames
- Min/Max/Likely ranges instead of false precision
- Explicit uncertainty when accuracy is low
"""

import numpy as np
import logging
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

logger = logging.getLogger('CountVerifier')


@dataclass
class CountVerificationResult:
    """Result of count verification with honest uncertainty"""
    min_count: int
    max_count: int
    likely_count: int
    confidence_score: float  # 0-100
    uncertainty_level: str  # 'LOW', 'MEDIUM', 'HIGH', 'EXTREME'
    is_reliable: bool
    warnings: List[str]
    failure_reasons: List[str]
    temporal_stability: float  # 0-100, higher is better
    recommendation: Optional[str] = None


class CountVerifier:
    """
    SEV-0 MANDATED COUNT VERIFICATION
    
    Rules:
    1. Never report a single number unless variance is < 5%
    2. Always provide min/max/likely ranges
    3. Admit failure when confidence < 60%
    4. Flag physically impossible counts
    5. Validate temporal stability
    """
    
    def __init__(self, 
                 max_variance_threshold: float = 0.15,
                 min_confidence_threshold: float = 60.0,
                 temporal_window_size: int = 10):
        """
        Args:
            max_variance_threshold: Maximum acceptable coefficient of variation
            min_confidence_threshold: Minimum confidence to report as reliable
            temporal_window_size: Number of frames to analyze for stability
        """
        self.max_variance_threshold = max_variance_threshold
        self.min_confidence_threshold = min_confidence_threshold
        self.temporal_window_size = temporal_window_size
        
        logger.info(f"Count Verifier initialized (variance_threshold={max_variance_threshold}, "
                   f"min_confidence={min_confidence_threshold})")
    
    def verify_counts(self, 
                     counts_by_frame: Dict[int, int],
                     uncertainty_by_frame: Dict[int, float],
                     video_metadata: Optional[Dict] = None) -> CountVerificationResult:
        """
        Verify detection counts and provide ground-truth aligned results.
        
        Args:
            counts_by_frame: {frame_number: detected_count}
            uncertainty_by_frame: {frame_number: uncertainty_score (0-100)}
            video_metadata: Optional metadata (resolution, fps, etc.)
            
        Returns:
            CountVerificationResult with honest assessment
        """
        if not counts_by_frame:
            return self._create_failure_result("No detections found")
        
        counts = list(counts_by_frame.values())
        uncertainties = list(uncertainty_by_frame.values())
        
        warnings = []
        failure_reasons = []
        
        # 1. STATISTICAL ANALYSIS
        mean_count = np.mean(counts)
        median_count = np.median(counts)
        std_count = np.std(counts)
        cv = std_count / mean_count if mean_count > 0 else 1.0  # Coefficient of variation
        
        # 2. PEAK DENSITY ANALYSIS (Rule 4: Herd size = physical peak presence)
        peak_count = int(np.max(counts))
        peak_percentile_95 = int(np.percentile(counts, 95))
        peak_percentile_90 = int(np.percentile(counts, 90))
        
        # 3. TEMPORAL STABILITY CHECK
        temporal_stability = self._calculate_temporal_stability(counts)
        
        if temporal_stability < 50:
            warnings.append("High temporal instability detected - counts vary significantly across frames")
        
        # 4. OUTLIER DETECTION
        outliers = self._detect_outliers(counts)
        if len(outliers) > len(counts) * 0.2:  # More than 20% outliers
            warnings.append(f"High outlier rate: {len(outliers)} frames with unusual counts")
        
        # 5. UNCERTAINTY AGGREGATION
        avg_uncertainty = np.mean(uncertainties)
        max_uncertainty = np.max(uncertainties)
        
        # 6. PHYSICAL REALITY CHECKS
        if peak_count > 500:
            warnings.append("Extremely high count detected - may indicate detection errors")
        
        if peak_count < 5 and mean_count > 0:
            warnings.append("Very low count - verify video contains goats")
        
        # Sudden jumps (more than 50% change frame-to-frame)
        sudden_jumps = self._detect_sudden_jumps(counts_by_frame)
        if sudden_jumps > len(counts) * 0.1:
            warnings.append(f"Detected {sudden_jumps} sudden count changes - possible tracking errors")
        
        # 7. CALCULATE CONFIDENCE SCORE
        confidence_score = self._calculate_confidence(
            cv=cv,
            temporal_stability=temporal_stability,
            avg_uncertainty=avg_uncertainty,
            outlier_ratio=len(outliers) / len(counts) if counts else 0
        )
        
        # 8. DETERMINE COUNT RANGE (SEV-0 Rule 2: Ground-truth alignment)
        if cv < 0.05:  # Very stable
            # High confidence - use tight range
            likely_count = peak_percentile_95
            min_count = int(likely_count * 0.95)
            max_count = int(likely_count * 1.05)
        elif cv < 0.15:  # Moderate stability
            # Medium confidence - use peak window
            likely_count = peak_percentile_90
            min_count = int(likely_count * 0.90)
            max_count = int(peak_count * 1.05)
        else:  # High variance
            # Low confidence - use wide range
            likely_count = int(median_count)
            min_count = int(np.percentile(counts, 25))
            max_count = int(peak_count)
            warnings.append("High variance in counts - wide range reported")
        
        # 9. UNCERTAINTY CLASSIFICATION
        if avg_uncertainty > 60 or confidence_score < 40:
            uncertainty_level = 'EXTREME'
            failure_reasons.append("Extreme occlusion or poor video quality")
        elif avg_uncertainty > 40 or confidence_score < 60:
            uncertainty_level = 'HIGH'
            failure_reasons.append("High occlusion detected")
        elif avg_uncertainty > 20 or confidence_score < 75:
            uncertainty_level = 'MEDIUM'
        else:
            uncertainty_level = 'LOW'
        
        # 10. RELIABILITY DETERMINATION (SEV-0 Rule 6: Honest failure mode)
        is_reliable = confidence_score >= self.min_confidence_threshold
        
        if not is_reliable:
            failure_reasons.append(f"Confidence score ({confidence_score:.1f}%) below threshold ({self.min_confidence_threshold}%)")
        
        # 11. GENERATE RECOMMENDATION
        recommendation = None
        if not is_reliable:
            recommendation = self._generate_recommendation(
                avg_uncertainty=avg_uncertainty,
                cv=cv,
                temporal_stability=temporal_stability,
                video_metadata=video_metadata
            )
        
        result = CountVerificationResult(
            min_count=min_count,
            max_count=max_count,
            likely_count=likely_count,
            confidence_score=round(confidence_score, 1),
            uncertainty_level=uncertainty_level,
            is_reliable=is_reliable,
            warnings=warnings,
            failure_reasons=failure_reasons,
            temporal_stability=round(temporal_stability, 1),
            recommendation=recommendation
        )
        
        logger.info(f"Count verification complete: {likely_count} goats "
                   f"(range: {min_count}-{max_count}, confidence: {confidence_score:.1f}%, "
                   f"reliable: {is_reliable})")
        
        return result
    
    def _calculate_temporal_stability(self, counts: List[int]) -> float:
        """
        Calculate how stable counts are across frames.
        Returns 0-100, where 100 = perfectly stable.
        """
        if len(counts) < 2:
            return 0.0
        
        # Calculate frame-to-frame changes
        changes = []
        for i in range(1, len(counts)):
            if counts[i-1] > 0:
                change_pct = abs(counts[i] - counts[i-1]) / counts[i-1]
                changes.append(change_pct)
        
        if not changes:
            return 0.0
        
        # Stability = inverse of average change
        avg_change = np.mean(changes)
        stability = max(0, 100 * (1 - min(avg_change, 1.0)))
        
        return stability
    
    def _detect_outliers(self, counts: List[int]) -> List[int]:
        """Detect statistical outliers using IQR method"""
        if len(counts) < 4:
            return []
        
        q1 = np.percentile(counts, 25)
        q3 = np.percentile(counts, 75)
        iqr = q3 - q1
        
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outliers = [c for c in counts if c < lower_bound or c > upper_bound]
        return outliers
    
    def _detect_sudden_jumps(self, counts_by_frame: Dict[int, int]) -> int:
        """Count number of sudden jumps (>50% change frame-to-frame)"""
        sorted_frames = sorted(counts_by_frame.keys())
        jumps = 0
        
        for i in range(1, len(sorted_frames)):
            prev_count = counts_by_frame[sorted_frames[i-1]]
            curr_count = counts_by_frame[sorted_frames[i]]
            
            if prev_count > 0:
                change_pct = abs(curr_count - prev_count) / prev_count
                if change_pct > 0.5:  # 50% change
                    jumps += 1
        
        return jumps
    
    def _calculate_confidence(self, 
                             cv: float,
                             temporal_stability: float,
                             avg_uncertainty: float,
                             outlier_ratio: float) -> float:
        """
        Calculate overall confidence score (0-100).
        
        Factors:
        - Coefficient of variation (lower is better)
        - Temporal stability (higher is better)
        - Average uncertainty (lower is better)
        - Outlier ratio (lower is better)
        """
        # Normalize CV to 0-100 scale (0.5 CV = 0 confidence, 0 CV = 100)
        cv_score = max(0, 100 * (1 - min(cv / 0.5, 1.0)))
        
        # Temporal stability is already 0-100
        stability_score = temporal_stability
        
        # Uncertainty is 0-100, invert it
        uncertainty_score = 100 - avg_uncertainty
        
        # Outlier ratio to score (0.3 ratio = 0 confidence, 0 ratio = 100)
        outlier_score = max(0, 100 * (1 - min(outlier_ratio / 0.3, 1.0)))
        
        # Weighted average
        confidence = (
            cv_score * 0.30 +
            stability_score * 0.30 +
            uncertainty_score * 0.25 +
            outlier_score * 0.15
        )
        
        return min(100, max(0, confidence))
    
    def _generate_recommendation(self,
                                avg_uncertainty: float,
                                cv: float,
                                temporal_stability: float,
                                video_metadata: Optional[Dict]) -> str:
        """Generate actionable recommendation for improving accuracy"""
        recommendations = []
        
        if avg_uncertainty > 50:
            recommendations.append("Extreme occlusion detected")
            recommendations.append("Recommendation: Use higher camera angle or multiple cameras")
        
        if cv > 0.3:
            recommendations.append("High count variance across frames")
            recommendations.append("Recommendation: Ensure goats are in stable group, not moving rapidly")
        
        if temporal_stability < 40:
            recommendations.append("Unstable tracking detected")
            recommendations.append("Recommendation: Improve lighting and reduce motion blur")
        
        if video_metadata:
            resolution = video_metadata.get('resolution', (0, 0))
            if resolution[0] < 1280 or resolution[1] < 720:
                recommendations.append("Low resolution video")
                recommendations.append("Recommendation: Use HD or higher resolution camera (1080p minimum)")
        
        if not recommendations:
            recommendations.append("General recommendation: Improve video quality, lighting, and camera angle")
        
        return " | ".join(recommendations)
    
    def _create_failure_result(self, reason: str) -> CountVerificationResult:
        """Create a failure result"""
        return CountVerificationResult(
            min_count=0,
            max_count=0,
            likely_count=0,
            confidence_score=0.0,
            uncertainty_level='EXTREME',
            is_reliable=False,
            warnings=[],
            failure_reasons=[reason],
            temporal_stability=0.0,
            recommendation="Unable to process video - " + reason
        )


__all__ = ['CountVerifier', 'CountVerificationResult']

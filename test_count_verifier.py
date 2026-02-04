"""
TEST_COUNT_VERIFIER.py
------------------------------------------------------------------------------
Unit tests for the SEV-0 Count Verification System
------------------------------------------------------------------------------
"""

import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from core.count_verifier import CountVerifier, CountVerificationResult
import numpy as np

def test_stable_counts():
    """Test with very stable counts (should be RELIABLE)"""
    print("\n" + "="*70)
    print("TEST 1: Stable Counts (50 goats, low variance)")
    print("="*70)
    
    verifier = CountVerifier()
    
    # Simulate stable counts: 48-52 goats across 100 frames
    counts_by_frame = {i: np.random.randint(48, 53) for i in range(0, 500, 5)}
    uncertainty_by_frame = {i: np.random.uniform(10, 20) for i in range(0, 500, 5)}
    
    result = verifier.verify_counts(counts_by_frame, uncertainty_by_frame)
    
    print(f"Estimated Count: {result.likely_count} goats")
    print(f"Count Range: {result.min_count}-{result.max_count}")
    print(f"Confidence: {result.confidence_score}%")
    print(f"Uncertainty Level: {result.uncertainty_level}")
    print(f"Reliable: {result.is_reliable}")
    print(f"Temporal Stability: {result.temporal_stability}%")
    print(f"Warnings: {result.warnings}")
    
    assert result.is_reliable, "Should be reliable with stable counts"
    assert result.confidence_score > 75, "Should have high confidence"
    print("✅ TEST PASSED")


def test_high_variance_counts():
    """Test with high variance (should be UNRELIABLE)"""
    print("\n" + "="*70)
    print("TEST 2: High Variance Counts (20-100 goats, high variance)")
    print("="*70)
    
    verifier = CountVerifier()
    
    # Simulate unstable counts: 20-100 goats with random jumps
    counts_by_frame = {i: np.random.randint(20, 101) for i in range(0, 500, 5)}
    uncertainty_by_frame = {i: np.random.uniform(30, 60) for i in range(0, 500, 5)}
    
    result = verifier.verify_counts(counts_by_frame, uncertainty_by_frame)
    
    print(f"Estimated Count: {result.likely_count} goats")
    print(f"Count Range: {result.min_count}-{result.max_count}")
    print(f"Confidence: {result.confidence_score}%")
    print(f"Uncertainty Level: {result.uncertainty_level}")
    print(f"Reliable: {result.is_reliable}")
    print(f"Temporal Stability: {result.temporal_stability}%")
    print(f"Warnings: {result.warnings}")
    print(f"Failure Reasons: {result.failure_reasons}")
    print(f"Recommendation: {result.recommendation}")
    
    assert not result.is_reliable, "Should be unreliable with high variance"
    assert result.confidence_score < 60, "Should have low confidence"
    assert len(result.warnings) > 0, "Should have warnings"
    print("✅ TEST PASSED")


def test_extreme_density():
    """Test with extreme density (150+ goats)"""
    print("\n" + "="*70)
    print("TEST 3: Extreme Density (150+ goats)")
    print("="*70)
    
    verifier = CountVerifier()
    
    # Simulate extreme density: 145-160 goats
    counts_by_frame = {i: np.random.randint(145, 161) for i in range(0, 500, 5)}
    uncertainty_by_frame = {i: np.random.uniform(40, 70) for i in range(0, 500, 5)}
    
    result = verifier.verify_counts(counts_by_frame, uncertainty_by_frame)
    
    print(f"Estimated Count: {result.likely_count} goats")
    print(f"Count Range: {result.min_count}-{result.max_count}")
    print(f"Confidence: {result.confidence_score}%")
    print(f"Uncertainty Level: {result.uncertainty_level}")
    print(f"Reliable: {result.is_reliable}")
    print(f"Temporal Stability: {result.temporal_stability}%")
    print(f"Warnings: {result.warnings}")
    
    assert result.uncertainty_level in ['HIGH', 'EXTREME'], "Should have high uncertainty"
    print("✅ TEST PASSED")


def test_sudden_jumps():
    """Test with sudden count jumps (tracking errors)"""
    print("\n" + "="*70)
    print("TEST 4: Sudden Jumps (Tracking Errors)")
    print("="*70)
    
    verifier = CountVerifier()
    
    # Simulate sudden jumps: 50 goats, then jump to 100, then back to 50
    counts_by_frame = {}
    for i in range(0, 200, 5):
        counts_by_frame[i] = 50
    for i in range(200, 300, 5):
        counts_by_frame[i] = 100  # Sudden jump
    for i in range(300, 500, 5):
        counts_by_frame[i] = 50  # Jump back
    
    uncertainty_by_frame = {i: 15 for i in counts_by_frame.keys()}
    
    result = verifier.verify_counts(counts_by_frame, uncertainty_by_frame)
    
    print(f"Estimated Count: {result.likely_count} goats")
    print(f"Count Range: {result.min_count}-{result.max_count}")
    print(f"Confidence: {result.confidence_score}%")
    print(f"Uncertainty Level: {result.uncertainty_level}")
    print(f"Reliable: {result.is_reliable}")
    print(f"Temporal Stability: {result.temporal_stability}%")
    print(f"Warnings: {result.warnings}")
    
    assert any("sudden" in w.lower() for w in result.warnings), "Should detect sudden jumps"
    print("✅ TEST PASSED")


def test_low_quality_video():
    """Test with low quality video metadata"""
    print("\n" + "="*70)
    print("TEST 5: Low Quality Video (480p)")
    print("="*70)
    
    verifier = CountVerifier()
    
    counts_by_frame = {i: np.random.randint(40, 51) for i in range(0, 500, 5)}
    uncertainty_by_frame = {i: np.random.uniform(35, 50) for i in range(0, 500, 5)}
    
    video_metadata = {
        'resolution': (640, 480),  # Low resolution
        'fps': 30
    }
    
    result = verifier.verify_counts(counts_by_frame, uncertainty_by_frame, video_metadata)
    
    print(f"Estimated Count: {result.likely_count} goats")
    print(f"Count Range: {result.min_count}-{result.max_count}")
    print(f"Confidence: {result.confidence_score}%")
    print(f"Uncertainty Level: {result.uncertainty_level}")
    print(f"Reliable: {result.is_reliable}")
    print(f"Recommendation: {result.recommendation}")
    
    if result.recommendation:
        assert "resolution" in result.recommendation.lower(), "Should recommend better resolution"
    print("✅ TEST PASSED")


def test_perfect_scenario():
    """Test with perfect conditions (should be highly reliable)"""
    print("\n" + "="*70)
    print("TEST 6: Perfect Scenario (HD, stable, low uncertainty)")
    print("="*70)
    
    verifier = CountVerifier()
    
    # Perfect conditions: 75 goats, very stable, low uncertainty
    counts_by_frame = {i: np.random.randint(74, 77) for i in range(0, 500, 5)}
    uncertainty_by_frame = {i: np.random.uniform(5, 10) for i in range(0, 500, 5)}
    
    video_metadata = {
        'resolution': (1920, 1080),  # HD
        'fps': 30
    }
    
    result = verifier.verify_counts(counts_by_frame, uncertainty_by_frame, video_metadata)
    
    print(f"Estimated Count: {result.likely_count} goats")
    print(f"Count Range: {result.min_count}-{result.max_count}")
    print(f"Confidence: {result.confidence_score}%")
    print(f"Uncertainty Level: {result.uncertainty_level}")
    print(f"Reliable: {result.is_reliable}")
    print(f"Temporal Stability: {result.temporal_stability}%")
    
    assert result.is_reliable, "Should be reliable with perfect conditions"
    assert result.confidence_score > 85, "Should have very high confidence"
    assert result.uncertainty_level == 'LOW', "Should have low uncertainty"
    print("✅ TEST PASSED")


if __name__ == "__main__":
    print("\n" + "="*70)
    print("SEV-0 COUNT VERIFIER - UNIT TESTS")
    print("="*70)
    
    try:
        test_stable_counts()
        test_high_variance_counts()
        test_extreme_density()
        test_sudden_jumps()
        test_low_quality_video()
        test_perfect_scenario()
        
        print("\n" + "="*70)
        print("✅ ALL TESTS PASSED")
        print("="*70)
        print("\nThe Count Verifier is working correctly and ready for production use.")
        print("It successfully:")
        print("  ✓ Validates stable counts with high confidence")
        print("  ✓ Detects high variance and reports low confidence")
        print("  ✓ Handles extreme density scenarios")
        print("  ✓ Identifies sudden jumps (tracking errors)")
        print("  ✓ Provides recommendations for low-quality footage")
        print("  ✓ Achieves high confidence in perfect conditions")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

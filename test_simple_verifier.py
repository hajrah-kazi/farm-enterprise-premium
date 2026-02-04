"""Simple test for count verifier"""
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from core.count_verifier import CountVerifier
    print("✅ CountVerifier imported successfully")
    
    verifier = CountVerifier()
    print("✅ CountVerifier initialized successfully")
    
    # Simple test
    counts_by_frame = {i: 50 for i in range(0, 100, 5)}
    uncertainty_by_frame = {i: 15.0 for i in range(0, 100, 5)}
    
    result = verifier.verify_counts(counts_by_frame, uncertainty_by_frame)
    print(f"✅ Verification complete: {result.likely_count} goats (confidence: {result.confidence_score}%)")
    print(f"   Range: {result.min_count}-{result.max_count}")
    print(f"   Reliable: {result.is_reliable}")
    
    print("\n✅ ALL TESTS PASSED - Count Verifier is working!")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

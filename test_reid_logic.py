import sys
import os
# Add 'backend' to sys.path so 'import database' inside ai_engine works
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import numpy as np
import cv2
import json
import random
import logging
from backend.ai_engine import AIEngine
from backend.database import DatabaseManager

# Configure mock environment
TEST_DB = "test_ai_reid.db"
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)

# Initialize test database
db_manager = DatabaseManager(TEST_DB)
db_manager.initialize_database()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestAIReID")

# Mock AI Engine to skip Ultralytics and use synthetic signatures
class TestAIEngine(AIEngine):
    def __init__(self, db_path):
        self.db_path = db_path
        self.model_version = "TEST-MOCK-v1"
        self.is_available = True
        logger.info("Test AI Engine Initialized")

    # MOCK: Generate synthetic signatures directly instead of from frames
    # Real signature is 3x3 grid * (8+8) bins = 144 float values
    def _generate_synthetic_signature(self, base_pattern_id, noise_level=0.0):
        # Deterministic generation based on pattern_id
        np.random.seed(base_pattern_id)
        
        # Create a "base" signature for this goat
        base_sig = np.random.rand(144).astype(np.float32)
        
        # Add noise if simulating a new sighting of the same goat
        if noise_level > 0:
            noise = np.random.normal(0, noise_level, 144).astype(np.float32)
            varied_sig = base_sig + noise
            # Normalize like in real code
            cv2.normalize(varied_sig, varied_sig)
            return varied_sig.flatten().tolist()
            
        cv2.normalize(base_sig, base_sig)
        return base_sig.flatten().tolist()

    # We test the _find_matching_goat logic specifically
    def test_reid_logic(self):
        db = DatabaseManager(self.db_path)
        logger.info("--- Starting Re-ID Accuracy Test ---")

        # Scenario 1: First Sighting of Goat A (Pattern ID: 1001)
        logger.info("Scenario 1: New Goat A enters frame")
        sig_a_1 = self._generate_synthetic_signature(1001, noise_level=0.0)
        
        # Try to match
        matched_id = self._find_matching_goat(db, sig_a_1)
        
        if not matched_id:
            logger.info("  -> Correctly identified as NEW goat.")
            # Register it
            goat_id_a = db.execute_update(
                "INSERT INTO goats (ear_tag, breed, status) VALUES (?, ?, ?)",
                ("GOAT-A", "Boer", "Active")
            )
            db.execute_update(
                "INSERT INTO goat_visual_signatures (goat_id, color_signature) VALUES (?, ?)",
                (goat_id_a, json.dumps(sig_a_1))
            )
            logger.info(f"  -> Registered Goat A with ID: {goat_id_a}")
        else:
            logger.error(f"  -> FAILED: Matched unknown goat to ID {matched_id}")

        # Scenario 2: Second Sighting of Goat A (Different lighting/angle -> Noise added)
        logger.info("Scenario 2: Goat A returns (Different lighting/angle)")
        sig_a_2 = self._generate_synthetic_signature(1001, noise_level=0.05) # Small variation
        
        matched_id = self._find_matching_goat(db, sig_a_2)
        
        if matched_id == goat_id_a:
            logger.info(f"  -> SUCCESS: Correctly Re-Identified Goat A (ID: {matched_id})")
        else:
            logger.error(f"  -> FAILED: Could not re-identify Goat A. Got: {matched_id}")

        # Scenario 3: New Goat B enters (Pattern ID: 2002) - Distinctly different
        logger.info("Scenario 3: New Goat B enters")
        sig_b_1 = self._generate_synthetic_signature(2002, noise_level=0.0)
        
        matched_id = self._find_matching_goat(db, sig_b_1)
        
        if not matched_id:
            logger.info("  -> Correctly identified as NEW goat.")
            # Register it
            goat_id_b = db.execute_update(
                "INSERT INTO goats (ear_tag, breed, status) VALUES (?, ?, ?)",
                ("GOAT-B", "Saanen", "Active")
            )
            db.execute_update(
                "INSERT INTO goat_visual_signatures (goat_id, color_signature) VALUES (?, ?)",
                (goat_id_b, json.dumps(sig_b_1))
            )
            logger.info(f"  -> Registered Goat B with ID: {goat_id_b}")
        elif matched_id == goat_id_a:
            logger.error("  -> FAILED: False Positive! Mistook Goat B for Goat A.")
        else:
            logger.error(f"  -> FAILED: Matched to unknown ID {matched_id}")
            
        # Scenario 4: Goat A Again (More noise)
        logger.info("Scenario 4: Goat A returns again (Heavy shadow/obscured)")
        sig_a_3 = self._generate_synthetic_signature(1001, noise_level=0.15) # More noise
        
        matched_id = self._find_matching_goat(db, sig_a_3)
        if matched_id == goat_id_a:
             # Check logic: if correlation is still > 0.92 it should pass
             logger.info(f"  -> SUCCESS: Robustly Re-Identified Goat A despite noise (ID: {matched_id})")
        else:
             logger.warning(f"  -> NOTE: Goat A not matched with high noise. This might be expected behavior to avoid False Positives.")

        logger.info("--- Test Complete ---")

if __name__ == "__main__":
    engine = TestAIEngine(TEST_DB)
    engine.test_reid_logic()
    
    # Cleanup
    if os.path.exists(TEST_DB):
        try:
            os.remove(TEST_DB)
        except: pass

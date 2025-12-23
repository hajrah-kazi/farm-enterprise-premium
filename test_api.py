# -*- coding: utf-8 -*-
"""
Quick API Functionality Test
Tests all critical endpoints to verify system is working
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(method, endpoint, data=None, description=""):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=5)
        
        status = "[PASS]" if response.status_code < 400 else "[FAIL]"
        print(f"{status} | {method:4} {endpoint:40} | {response.status_code} | {description}")
        return response.status_code < 400
    except Exception as e:
        print(f"[FAIL] | {method:4} {endpoint:40} | ERROR | {str(e)[:50]}")
        return False

def run_tests():
    """Run all functionality tests"""
    print("\n" + "="*100)
    print("GoatAI Enterprise - API Functionality Test")
    print("="*100 + "\n")
    
    tests_passed = 0
    tests_total = 0
    
    # Health Check
    print("HEALTH & SYSTEM")
    tests_total += 1
    if test_endpoint("GET", "/health", description="System health check"):
        tests_passed += 1
    
    tests_total += 1
    if test_endpoint("GET", "/api/system/status", description="System metrics"):
        tests_passed += 1
    
    # Dashboard
    print("\nDASHBOARD")
    tests_total += 1
    if test_endpoint("GET", "/api/dashboard", description="Dashboard statistics"):
        tests_passed += 1
    
    tests_total += 1
    if test_endpoint("GET", "/api/analytics/advanced", description="Advanced analytics"):
        tests_passed += 1
    
    # Livestock
    print("\nLIVESTOCK MANAGEMENT")
    tests_total += 1
    if test_endpoint("GET", "/api/goats?page=1&status=Active", description="Get goats list"):
        tests_passed += 1
    
    tests_total += 1
    if test_endpoint("GET", "/api/goats/1", description="Get goat details"):
        tests_passed += 1
    
    # Videos
    print("\nVIDEO PROCESSING")
    tests_total += 1
    if test_endpoint("GET", "/api/videos", description="Get videos list"):
        tests_passed += 1
    
    # Live Feed
    print("\nLIVE MONITORING")
    tests_total += 1
    if test_endpoint("GET", "/api/live-feed", description="Live feed data"):
        tests_passed += 1
    
    tests_total += 1
    if test_endpoint("GET", "/api/detections", description="Detection history"):
        tests_passed += 1
    
    # Alerts
    print("\nALERTS & EVENTS")
    tests_total += 1
    if test_endpoint("GET", "/api/alerts", description="Get alerts"):
        tests_passed += 1
    
    # Health Stats
    print("\nHEALTH ANALYTICS")
    tests_total += 1
    if test_endpoint("GET", "/api/health/stats", description="Health statistics"):
        tests_passed += 1
    
    tests_total += 1
    if test_endpoint("GET", "/api/analytics/mass", description="Mass predictions"):
        tests_passed += 1
    
    # Reports
    print("\nREPORTS")
    tests_total += 1
    if test_endpoint("GET", "/api/reports", description="List reports"):
        tests_passed += 1
    
    # Settings
    print("\nSETTINGS")
    tests_total += 1
    if test_endpoint("GET", "/api/settings", description="Get settings"):
        tests_passed += 1

    # AI Chat
    print("\nAI ASSISTANT")
    tests_total += 1
    chat_payload = {"message": "Hello"}
    if test_endpoint("POST", "/api/chat", data=chat_payload, description="Chat functionality"):
        tests_passed += 1
    
    # Summary
    print("\n" + "="*100)
    print(f"RESULTS: {tests_passed}/{tests_total} tests passed ({int(tests_passed/tests_total*100)}%)")
    print("="*100 + "\n")
    
    if tests_passed == tests_total:
        print("[SUCCESS] ALL SYSTEMS OPERATIONAL - Ready for production!")
    elif tests_passed >= tests_total * 0.8:
        print("[WARNING] MOSTLY OPERATIONAL - Minor issues detected")
    else:
        print("[ERROR] CRITICAL ISSUES - System needs attention")

if __name__ == "__main__":
    run_tests()

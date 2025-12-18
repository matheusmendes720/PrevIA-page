#!/usr/bin/env python3
"""
Quick test script for Towers API
Tests all endpoints and validates responses
"""
import requests
import json
import sys
from typing import Dict, Any

API_BASE = "http://localhost:8000/api/v1/towers"

def test_endpoint(name: str, url: str, expected_status: int = 200) -> Dict[str, Any]:
    """Test an API endpoint"""
    print(f"\n🧪 Testing: {name}")
    print(f"   URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        status = response.status_code
        
        if status == expected_status:
            print(f"   ✅ Status: {status}")
            try:
                data = response.json()
                print(f"   ✅ Response: Valid JSON")
                return {"success": True, "status": status, "data": data}
            except:
                print(f"   ⚠️  Response: Not JSON")
                return {"success": True, "status": status, "data": response.text}
        else:
            print(f"   ❌ Status: {status} (expected {expected_status})")
            return {"success": False, "status": status, "error": f"Unexpected status {status}"}
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Connection Error: Backend not running on {API_BASE}")
        return {"success": False, "error": "Connection refused"}
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return {"success": False, "error": str(e)}

def main():
    print("=" * 60)
    print("🚀 TOWERS API TESTING SUITE")
    print("=" * 60)
    
    results = []
    
    # Test 1: Basic endpoint
    result = test_endpoint(
        "Get Towers (Basic)",
        f"{API_BASE}/?limit=10"
    )
    results.append(("Basic Endpoint", result))
    
    if result.get("success") and "data" in result:
        data = result["data"]
        if isinstance(data, dict) and "towers" in data:
            tower_count = len(data.get("towers", []))
            total = data.get("total", 0)
            print(f"   📊 Found {tower_count} towers (total: {total})")
    
    # Test 2: With filters
    result = test_endpoint(
        "Get Towers (Filtered - Active)",
        f"{API_BASE}/?status=active&limit=5"
    )
    results.append(("Filtered Endpoint", result))
    
    # Test 3: Stats endpoint
    result = test_endpoint(
        "Get Statistics",
        f"{API_BASE}/stats/summary"
    )
    results.append(("Stats Endpoint", result))
    
    if result.get("success") and "data" in result:
        data = result["data"]
        if isinstance(data, dict):
            total = data.get("total_towers", 0)
            print(f"   📊 Total Towers: {total}")
            by_status = data.get("by_status", {})
            if by_status:
                print(f"   📊 By Status: {json.dumps(by_status, indent=6)}")
    
    # Test 4: State filter
    result = test_endpoint(
        "Get Towers (By State - SP)",
        f"{API_BASE}/?state=SP&limit=5"
    )
    results.append(("State Filter", result))
    
    # Test 5: Priority filter
    result = test_endpoint(
        "Get Towers (High Priority)",
        f"{API_BASE}/?priority=High&limit=5"
    )
    results.append(("Priority Filter", result))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, r in results if r.get("success"))
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result.get("success") else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n✅ Passed: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check errors above.")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)




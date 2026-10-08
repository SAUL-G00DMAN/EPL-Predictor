"""
Comprehensive HTTP test suite for EPL Predictor FastAPI service.
Calls each endpoint and records status codes and response bodies.
"""

import json
import os
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://127.0.0.1:8000"
ADMIN_TOKEN = os.getenv("ADMIN_SECRET_TOKEN", "epl-admin-secret-dev")

def make_request(method, path, headers=None, data=None):
    url = f"{BASE_URL}{path}"
    headers = headers or {}
    req = urllib.request.Request(url, headers=headers, method=method)
    if data is not None:
        req.data = json.dumps(data).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            status_code = resp.status
            body = resp.read().decode("utf-8")
            return status_code, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return e.code, parsed

def run():
    results = {}

    print("1. Testing GET / (Health Check)...")
    code, res = make_request("GET", "/")
    print(f"   Status: {code}")
    print(f"   Response: {json.dumps(res, indent=2)}")
    results["GET /"] = (code, res)

    print("\n2. Testing GET /teams...")
    code, res = make_request("GET", "/teams")
    print(f"   Status: {code}")
    print(f"   Count: {res.get('count')}, Sample: {res.get('teams', [])[:5]}")
    results["GET /teams"] = (code, res)

    print("\n3. Testing GET /predictions/table?include_bands=true...")
    code, res = make_request("GET", "/predictions/table?include_bands=true")
    print(f"   Status: {code}")
    print(f"   Rows returned: {len(res.get('table', []))}")
    print(f"   Top 3 teams: {res.get('table', [])[:3]}")
    results["GET /predictions/table?include_bands=true"] = (code, res)

    print("\n4. Testing GET /predictions/table?include_bands=false...")
    code, res = make_request("GET", "/predictions/table?include_bands=false")
    print(f"   Status: {code}")
    sample_first = res.get('table', [])[0] if res.get('table') else {}
    print(f"   First team has points_p10?: {sample_first.get('points_p10') is not None}")
    results["GET /predictions/table?include_bands=false"] = (code, res)

    print("\n5. Testing GET /predictions/match?home_team=Arsenal&away_team=Chelsea...")
    code, res = make_request("GET", "/predictions/match?home_team=Arsenal&away_team=Chelsea")
    print(f"   Status: {code}")
    print(f"   Response: {json.dumps(res, indent=2)}")
    results["GET /predictions/match (Arsenal vs Chelsea)"] = (code, res)

    print("\n6. Testing GET /predictions/match?home_team=Man%20Utd&away_team=Spurs (Aliases)...")
    code, res = make_request("GET", "/predictions/match?home_team=Man%20Utd&away_team=Spurs")
    print(f"   Status: {code}")
    print(f"   Resolved: {res.get('home_team')} vs {res.get('away_team')}")
    print(f"   Probabilities: {res.get('probabilities')}")
    results["GET /predictions/match (Man Utd vs Spurs)"] = (code, res)

    print("\n7. Testing GET /predictions/match with INVALID team (Deliberate 404 test)...")
    code, res = make_request("GET", "/predictions/match?home_team=Real%20Madrid&away_team=Chelsea")
    print(f"   Status: {code}")
    print(f"   Error Detail: {json.dumps(res, indent=2)}")
    results["GET /predictions/match (Deliberate 404)"] = (code, res)

    print("\n8. Testing GET /predictions/match with IDENTICAL teams (Deliberate 400 test)...")
    code, res = make_request("GET", "/predictions/match?home_team=Arsenal&away_team=Arsenal")
    print(f"   Status: {code}")
    print(f"   Error Detail: {json.dumps(res, indent=2)}")
    results["GET /predictions/match (Deliberate 400)"] = (code, res)

    print("\n9. Testing POST /admin/reload-model without auth (Deliberate 403 test)...")
    code, res = make_request("POST", "/admin/reload-model")
    print(f"   Status: {code}")
    print(f"   Error Detail: {json.dumps(res, indent=2)}")
    results["POST /admin/reload-model (Deliberate 403)"] = (code, res)

    print("\n10. Testing POST /admin/reload-model with valid X-Admin-Token...")
    code, res = make_request("POST", "/admin/reload-model", headers={"X-Admin-Token": ADMIN_TOKEN})
    print(f"   Status: {code}")
    print(f"   Response: {json.dumps(res, indent=2)}")
    results["POST /admin/reload-model (Valid Token)"] = (code, res)

    print("\n11. Testing POST /admin/run-simulation with valid X-Admin-Token...")
    code, res = make_request("POST", "/admin/run-simulation?n_simulations=100", headers={"X-Admin-Token": ADMIN_TOKEN})
    print(f"   Status: {code}")
    print(f"   Response: {json.dumps(res, indent=2)}")
    results["POST /admin/run-simulation"] = (code, res)

    print("\n================== SUMMARY ==================")
    for test_name, (code, _) in results.items():
        print(f"{test_name:50} -> HTTP {code}")

if __name__ == "__main__":
    run()

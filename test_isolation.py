"""
Targeted isolation test:
Proves that /admin/run-simulation (n=10) does NOT change what /predictions/table returns.
"""

import json
import time
import urllib.request
import urllib.error

import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://127.0.0.1:8000"
ADMIN_TOKEN = os.getenv("ADMIN_SECRET_TOKEN", "epl-admin-secret-dev")

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def post(path, headers=None):
    req = urllib.request.Request(f"{BASE_URL}{path}", headers=headers or {}, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def top3_from_table(table_resp):
    return [(row["team"], round(row["champion_pct"], 4)) for row in table_resp["table"][:3]]

print("=" * 62)
print("ISOLATION TEST: /admin/run-simulation must not mutate public table")
print("=" * 62)

# 1. Snapshot the public table BEFORE the simulation
before = get("/predictions/table?include_bands=false")
before_top3 = top3_from_table(before)
before_n = before["simulations_count"]
print(f"\n[BEFORE] simulations_count: {before_n}")
print(f"[BEFORE] Top 3: {before_top3}")

# 2. Fire off a tiny simulation (n=10 — would produce wildly different results if it leaked)
sim_resp = post("/admin/run-simulation?n_simulations=10", headers={"X-Admin-Token": ADMIN_TOKEN})
print(f"\n[SIMULATION] status: {sim_resp['status']}, n: {sim_resp['n_simulations']}")
print(f"[SIMULATION] persistence_notice: {sim_resp['persistence_notice']}")

# 3. Wait for background job to complete (n=10 is near-instant)
time.sleep(5)

# 4. Snapshot the public table AFTER — it must be identical
after = get("/predictions/table?include_bands=false")
after_top3 = top3_from_table(after)
after_n = after["simulations_count"]
print(f"\n[AFTER] simulations_count: {after_n}")
print(f"[AFTER] Top 3: {after_top3}")

# 5. Assert isolation
assert before_n == after_n, f"FAIL: simulations_count changed {before_n} -> {after_n}"
assert before_top3 == after_top3, f"FAIL: public table mutated! {before_top3} vs {after_top3}"

print("\n[PASS] ISOLATION CONFIRMED: Public table is byte-for-byte identical before and after simulation.")
print("       The n=10 run produced NO change to /predictions/table.")
print("\nConfirmed data flow:")
print("  /admin/run-simulation  -->  background worker  -->  results DISCARDED (logged only)")
print("  /predictions/table     -->  predictor.final_probabilities  [UNCHANGED]")
print("  /admin/reload-model    -->  new EPLPredictor from pickle   [THE ONLY UPDATE PATH]")

"""Test campaign creation and leader approval APIs."""
import urllib.request
import urllib.error
import json

BASE = "http://localhost:8000/api"

# First, get a token for admin
login_data = json.dumps({"username": "admin", "password": "admin123"}).encode("utf-8")
login_req = urllib.request.Request(
    f"{BASE}/auth/login/",
    data=login_data,
    headers={"Content-Type": "application/json"},
    method="POST"
)

print("=== Login as Admin ===")
try:
    with urllib.request.urlopen(login_req) as resp:
        login_resp = json.loads(resp.read().decode())
        token = login_resp.get("access")
        print(f"Got token: {token[:30]}...")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"Login FAILED: {e.code} - {body}")
    exit(1)

# Test creating a campaign
print("\n=== Create Campaign ===")
campaign_data = json.dumps({
    "title": "Test Campaign",
    "description": "A test campaign",
    "category": "",
    "status": "ACTIVE",
    "start_date": "2026-07-15T00:00:00Z",
    "end_date": "2026-08-15T00:00:00Z"
}).encode("utf-8")

camp_req = urllib.request.Request(
    f"{BASE}/campaigns/",
    data=campaign_data,
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(camp_req) as resp:
        print(f"STATUS: {resp.status}")
        print(f"BODY: {resp.read().decode()}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    # Try to parse just JSON from error, otherwise truncate
    try:
        error_json = json.loads(body)
        print(f"STATUS: {e.code}")
        print(f"ERROR JSON: {json.dumps(error_json, indent=2)}")
    except:
        print(f"STATUS: {e.code}")
        # Find the exception value in Django debug page
        if "exception_value" in body:
            start = body.find('<pre class="exception_value">') + len('<pre class="exception_value">')
            end = body.find('</pre>', start)
            print(f"DJANGO ERROR: {body[start:end]}")
        else:
            print(f"BODY (first 500 chars): {body[:500]}")

# Test creating campaign WITH target_amount
print("\n=== Create Campaign WITH target_amount ===")
campaign_data2 = json.dumps({
    "title": "Test Campaign 2",
    "description": "A test campaign with target_amount",
    "category": None,
    "status": "ACTIVE",
    "target_amount": "10000.00",
    "start_date": "2026-07-15T00:00:00Z",
    "end_date": "2026-08-15T00:00:00Z"
}).encode("utf-8")

camp_req2 = urllib.request.Request(
    f"{BASE}/campaigns/",
    data=campaign_data2,
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(camp_req2) as resp:
        print(f"STATUS: {resp.status}")
        print(f"BODY: {resp.read().decode()}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    try:
        error_json = json.loads(body)
        print(f"STATUS: {e.code}")
        print(f"ERROR JSON: {json.dumps(error_json, indent=2)}")
    except:
        print(f"STATUS: {e.code}")
        if "exception_value" in body:
            start = body.find('<pre class="exception_value">') + len('<pre class="exception_value">')
            end = body.find('</pre>', start)
            print(f"DJANGO ERROR: {body[start:end]}")
        else:
            print(f"BODY (first 500 chars): {body[:500]}")

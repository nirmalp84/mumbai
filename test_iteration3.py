"""Iteration 3 tests: login rate-limit, CSV export, email graceful fallback."""
import os
import time
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://dreams-wholesale-1.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@dreamslatkans.com"
ADMIN_PASSWORD = "Dreams@2026"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")


@pytest.fixture
def mongo():
    c = MongoClient(MONGO_URL, serverSelectionTimeoutMS=2000)
    yield c[DB_NAME]
    c.close()


@pytest.fixture
def clean_attempts(mongo):
    mongo.login_attempts.delete_many({})
    yield
    mongo.login_attempts.delete_many({})


@pytest.fixture
def admin_token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                      timeout=10)
    assert r.status_code == 200, r.text
    return r.json()["token"]


# ============ Rate-limit ============

def test_rate_limit_5_fails_then_429_with_retry_after(clean_attempts):
    """5 failed POST /auth/login = 401 each; 6th = 429 with Retry-After header & '15 minutes' message."""
    email = "admin@dreamslatkans.com"
    for i in range(5):
        r = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": "wrongpw"}, timeout=10)
        assert r.status_code == 401, f"attempt {i+1}: expected 401, got {r.status_code}"

    # 6th attempt -> 429
    r6 = requests.post(f"{API}/auth/login",
                       json={"email": email, "password": "wrongpw"}, timeout=10)
    assert r6.status_code == 429, r6.text
    assert "Retry-After" in r6.headers
    retry_after = int(r6.headers["Retry-After"])
    assert 0 < retry_after <= 15 * 60 + 1
    detail = r6.json().get("detail", "")
    assert "minute" in detail.lower()


def test_rate_limit_blocks_even_correct_password(clean_attempts):
    """While locked out, even the correct password returns 429."""
    email = ADMIN_EMAIL
    for _ in range(5):
        requests.post(f"{API}/auth/login",
                      json={"email": email, "password": "wrongpw"}, timeout=10)
    # Now try correct password -> still 429
    r = requests.post(f"{API}/auth/login",
                      json={"email": email, "password": ADMIN_PASSWORD}, timeout=10)
    assert r.status_code == 429, r.text


def test_rate_limit_different_email_not_locked(clean_attempts):
    """Lockout keyed by ip:email — failing email A should NOT lock email B."""
    for _ in range(5):
        requests.post(f"{API}/auth/login",
                      json={"email": "nobody@dreamslatkans.com", "password": "wrongpw"}, timeout=10)
    # different email (the real admin) should still be allowed (and succeed)
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
    assert r.status_code == 200, r.text


def test_successful_login_clears_prior_failures(clean_attempts):
    """A successful login clears the prior failed-attempt counter for that identifier."""
    email = ADMIN_EMAIL
    # 4 failures (under threshold)
    for _ in range(4):
        r = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": "wrongpw"}, timeout=10)
        assert r.status_code == 401
    # successful login should clear
    r_ok = requests.post(f"{API}/auth/login",
                         json={"email": email, "password": ADMIN_PASSWORD}, timeout=10)
    assert r_ok.status_code == 200
    # Now 4 more failures should still NOT lock out (would be 8 total without clear)
    for _ in range(4):
        r = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": "wrongpw"}, timeout=10)
        assert r.status_code == 401, f"got {r.status_code} - looks like clear didn't work"


# ============ CSV Export ============

def test_csv_export_requires_auth():
    r = requests.get(f"{API}/admin/enquiries.csv", timeout=10)
    assert r.status_code == 401


def test_csv_export_content_and_headers(admin_token):
    # First make sure at least one enquiry exists
    requests.post(f"{API}/enquiry", json={
        "full_name": "TEST_CSV User",
        "business_name": "TEST_CSV Biz",
        "phone": "9000000099",
        "email": "csv@test.com",
        "category": "Fancy Latkans",
        "quantity": "100",
        "message": "csv export test",
    }, timeout=10)

    r = requests.get(f"{API}/admin/enquiries.csv",
                     headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r.status_code == 200, r.text
    ctype = r.headers.get("content-type", "")
    assert "text/csv" in ctype, f"Expected text/csv, got {ctype}"
    cdisp = r.headers.get("content-disposition", "")
    assert "attachment" in cdisp.lower()
    assert "dlas-enquiries-" in cdisp
    assert ".csv" in cdisp

    body = r.text
    lines = body.strip().split("\n")
    expected_header = "Created At,Status,Full Name,Business Name,Phone,Email,City / State,Category,Quantity,Message,ID"
    assert lines[0].strip() == expected_header, f"Header mismatch: {lines[0]!r}"
    assert len(lines) >= 2, "Expected at least header + 1 row"


# ============ Email graceful fallback ============

def test_enquiry_returns_201_quickly_with_email_disabled():
    """Email send must NOT block: enquiry POST returns quickly even if emailer runs in background."""
    payload = {
        "full_name": "TEST_Email User",
        "business_name": "TEST_Email Biz",
        "phone": "9000000123",
        "category": "Fancy Latkans",
        "message": "TEST_email_check",
    }
    start = time.time()
    r = requests.post(f"{API}/enquiry", json=payload, timeout=10)
    elapsed = time.time() - start
    assert r.status_code == 201, r.text
    assert elapsed < 3.0, f"Enquiry POST took {elapsed:.2f}s — email may be blocking"


def test_enquiry_creation_does_not_fail_when_email_disabled():
    """Even when RESEND_API_KEY is empty, enquiry creation succeeds."""
    # Confirm key is empty / non-re_ prefix
    assert os.environ.get("RESEND_API_KEY", "") in ("", None) or not os.environ.get("RESEND_API_KEY", "").startswith("re_")
    r = requests.post(f"{API}/enquiry", json={
        "full_name": "TEST_NoEmail",
        "business_name": "TEST_NoEmailBiz",
        "phone": "9000000200",
        "category": "Laces & Borders",
    }, timeout=10)
    assert r.status_code == 201


def test_backend_log_contains_emailer_disabled_line():
    """After an enquiry POST, supervisor log should show 'emailer disabled' line."""
    # Trigger a new enquiry to guarantee a fresh log entry
    requests.post(f"{API}/enquiry", json={
        "full_name": "TEST_LogCheck",
        "business_name": "TEST_LogCheckBiz",
        "phone": "9000000201",
        "category": "Fancy Latkans",
    }, timeout=10)
    time.sleep(1.5)  # let background task flush log
    # Look across both stderr and stdout supervisor backend logs
    import glob
    log_paths = glob.glob("/var/log/supervisor/backend.*.log")
    found = False
    for p in log_paths:
        try:
            with open(p, "r") as f:
                content = f.read()[-20000:]
            if "emailer disabled" in content:
                found = True
                break
        except Exception:
            continue
    assert found, f"Expected 'emailer disabled' in backend logs at {log_paths}"

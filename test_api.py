"""Backend API tests for Dream's Latkans & Laces.
Covers: health, public enquiry CRUD/regression, auth (login/me),
admin endpoints (list/stats/patch/delete), DB admin seed, SEO static files.
"""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://dreams-wholesale-1.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@dreamslatkans.com"
ADMIN_PASSWORD = "Dreams@2026"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed ({r.status_code}); cannot test admin endpoints")
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_client(admin_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}",
    })
    return s


# ============ Health ============
def test_health(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "message" in data


# ============ Public Enquiry — Regression ============
def test_enquiry_missing_required_returns_422(client):
    r = client.post(f"{API}/enquiry", json={"full_name": "x"})
    assert r.status_code == 422


def test_enquiry_empty_body_returns_422(client):
    r = client.post(f"{API}/enquiry", json={})
    assert r.status_code == 422


def test_enquiry_create_returns_201_with_status_new(client):
    """Iteration 2: POST /api/enquiry now returns 201 (was 200) and status='new'."""
    payload = {
        "full_name": "TEST_Sai Test",
        "business_name": "TEST_Dream Sarees",
        "phone": "9876543210",
        "email": "test@example.com",
        "city_state": "Mumbai, MH",
        "category": "Fancy Latkans",
        "quantity": "500 pcs",
        "message": "TEST_automated",
    }
    r = client.post(f"{API}/enquiry", json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["full_name"] == payload["full_name"]
    assert body["business_name"] == payload["business_name"]
    assert body.get("status") == "new"
    assert "id" in body and isinstance(body["id"], str) and len(body["id"]) > 0
    assert "_id" not in body


def test_enquiry_minimal_required(client):
    r = client.post(f"{API}/enquiry", json={
        "full_name": "TEST_Min",
        "business_name": "TEST_MinBiz",
        "phone": "9999999999",
        "category": "Laces & Borders",
    })
    assert r.status_code == 201
    assert r.json().get("status") == "new"


def test_public_enquiries_list_has_status_on_every_item(client):
    r = client.get(f"{API}/enquiries")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    for it in items[:20]:
        assert "status" in it and it["status"] in ("new", "contacted", "closed")
        assert "_id" not in it


# ============ Auth ============
def test_login_invalid_credentials_returns_401(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401
    body = r.json()
    assert "detail" in body


def test_login_valid_returns_token(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
    assert data["email"] == ADMIN_EMAIL
    assert data["role"] == "admin"
    # JWT structure
    assert data["token"].count(".") == 2


def test_login_email_case_insensitive(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL.upper(), "password": ADMIN_PASSWORD})
    assert r.status_code == 200


def test_me_without_token_returns_401(client):
    r = client.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_with_invalid_token_returns_401(client):
    r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401


def test_me_with_valid_token_returns_admin(admin_client):
    r = admin_client.get(f"{API}/auth/me")
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert data["role"] == "admin"
    assert "id" in data


# ============ Admin: Protection ============
def test_admin_enquiries_without_token_returns_401(client):
    r = client.get(f"{API}/admin/enquiries")
    assert r.status_code == 401


def test_admin_stats_without_token_returns_401(client):
    r = client.get(f"{API}/admin/stats")
    assert r.status_code == 401


# ============ Admin: GET enquiries + stats ============
def test_admin_list_enquiries(admin_client):
    r = admin_client.get(f"{API}/admin/enquiries")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    for it in items:
        assert "status" in it and it["status"] in ("new", "contacted", "closed")
        assert "_id" not in it
        assert "id" in it


def test_admin_stats_shape(admin_client):
    r = admin_client.get(f"{API}/admin/stats")
    assert r.status_code == 200
    data = r.json()
    for k in ("total", "new", "contacted", "closed", "latest"):
        assert k in data
    assert isinstance(data["latest"], list)
    assert len(data["latest"]) <= 5
    # totals consistency
    assert data["total"] >= data["new"] + data["contacted"] + data["closed"] - 1  # allow legacy null


# ============ Admin: PATCH status ============
def test_admin_patch_status_full_flow(client, admin_client):
    # create a fresh enquiry as public
    create = client.post(f"{API}/enquiry", json={
        "full_name": "TEST_Patch User",
        "business_name": "TEST_PatchBiz",
        "phone": "9000000001",
        "category": "Fancy Latkans",
    })
    assert create.status_code == 201
    enq_id = create.json()["id"]

    # PATCH -> contacted
    r = admin_client.patch(f"{API}/admin/enquiries/{enq_id}", json={"status": "contacted"})
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "contacted"

    # Verify persistence via list
    r2 = admin_client.get(f"{API}/admin/enquiries")
    found = next((x for x in r2.json() if x["id"] == enq_id), None)
    assert found is not None
    assert found["status"] == "contacted"

    # Invalid status -> 400
    r3 = admin_client.patch(f"{API}/admin/enquiries/{enq_id}", json={"status": "garbage"})
    assert r3.status_code == 400

    # Unknown id -> 404
    r4 = admin_client.patch(f"{API}/admin/enquiries/non-existent-uuid", json={"status": "new"})
    assert r4.status_code == 404

    # Cleanup
    admin_client.delete(f"{API}/admin/enquiries/{enq_id}")


# ============ Admin: DELETE ============
def test_admin_delete_full_flow(client, admin_client):
    create = client.post(f"{API}/enquiry", json={
        "full_name": "TEST_Delete User",
        "business_name": "TEST_DelBiz",
        "phone": "9000000002",
        "category": "Laces & Borders",
    })
    assert create.status_code == 201
    enq_id = create.json()["id"]

    r = admin_client.delete(f"{API}/admin/enquiries/{enq_id}")
    assert r.status_code == 200
    assert r.json() == {"deleted": enq_id}

    # second delete -> 404
    r2 = admin_client.delete(f"{API}/admin/enquiries/{enq_id}")
    assert r2.status_code == 404


def test_admin_delete_unknown_returns_404(admin_client):
    r = admin_client.delete(f"{API}/admin/enquiries/does-not-exist-uuid")
    assert r.status_code == 404


# ============ Admin: DB seed verification ============
def test_admin_user_bcrypt_hash_in_db():
    """Verify the seeded admin row uses a bcrypt $2b$ hash."""
    try:
        from pymongo import MongoClient
    except ImportError:
        pytest.skip("pymongo not installed locally; skipping DB introspection")
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")
    c = MongoClient(mongo_url, serverSelectionTimeoutMS=2000)
    try:
        admins = list(c[db_name].admin_users.find({"email": ADMIN_EMAIL}))
    except Exception as e:
        pytest.skip(f"Cannot reach MongoDB locally: {e}")
    assert len(admins) == 1, f"Expected exactly one admin row, found {len(admins)}"
    h = admins[0].get("password_hash", "")
    assert h.startswith("$2b$"), f"Password hash should start with $2b$, got prefix={h[:4]!r}"


# ============ SEO static files ============
def test_robots_txt():
    r = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
    assert r.status_code == 200
    text = r.text
    assert "User-agent: *" in text
    assert re.search(r"Disallow:\s*/admin", text)
    assert "Sitemap:" in text


def test_sitemap_xml():
    r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
    assert r.status_code == 200
    body = r.text
    assert "<urlset" in body and "</urlset>" in body
    locs = re.findall(r"<loc>([^<]+)</loc>", body)
    assert len(locs) == 4, f"Expected 4 URLs in sitemap, got {len(locs)}: {locs}"
    joined = " ".join(locs)
    # Should include products, about, contact, and a root URL (ends with .com or .com/)
    assert re.search(r"\.com/?\s", joined + " ") or any(l.endswith(".com") or l.endswith(".com/") for l in locs), \
        f"Missing root URL in sitemap: {locs}"
    for needed in ("/products", "/about", "/contact"):
        assert any(needed in l for l in locs), f"Missing {needed} in sitemap; got {locs}"


def test_og_image_served():
    r = requests.get(f"{BASE_URL}/images/og-default.png", timeout=10)
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("image/")


def test_index_html_has_og_image_and_twitter_card():
    r = requests.get(f"{BASE_URL}/", timeout=10)
    assert r.status_code == 200
    html = r.text.lower()
    assert "og:image" in html
    assert "og-default.png" in html
    assert "twitter:card" in html

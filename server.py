from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import csv
import asyncio
import logging
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from auth import (
    verify_password, create_access_token, require_admin, seed_admin,
    check_lockout, record_attempt, client_ip,
)
from emailer import send_enquiry_notification

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Ensure static dirs exist
STATIC_DIR = ROOT_DIR / "static"
GENERATED_DIR = STATIC_DIR / "generated"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Dream's Latkans & Laces API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class EnquiryCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    full_name: str = Field(..., min_length=2, max_length=120)
    business_name: str = Field(..., min_length=2, max_length=160)
    phone: str = Field(..., min_length=6, max_length=30)
    email: Optional[str] = None
    city_state: Optional[str] = None
    category: str
    quantity: Optional[str] = None
    message: Optional[str] = None


class Enquiry(EnquiryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"


class LoginPayload(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    email: str
    role: str = "admin"


class StatusUpdate(BaseModel):
    status: str  # "new" | "contacted" | "closed"


# ---------- Public Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Dream's Latkans & Laces API", "status": "ok"}


@api_router.post("/enquiry", response_model=Enquiry, status_code=201)
async def create_enquiry(payload: EnquiryCreate):
    obj = Enquiry(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.enquiries.insert_one(doc)
    # Fire-and-forget email notification (never blocks the response)
    asyncio.create_task(send_enquiry_notification(doc))
    return obj


@api_router.get("/enquiries", response_model=List[Enquiry])
async def list_enquiries_public():
    """Kept for backwards compatibility with existing tests; mirrors admin list."""
    items = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        if isinstance(it.get('created_at'), str):
            it['created_at'] = datetime.fromisoformat(it['created_at'])
        it.setdefault("status", "new")
    return items


# ---------- Auth ----------
@api_router.post("/auth/login", response_model=LoginResponse)
async def admin_login(payload: LoginPayload, request: Request):
    email = (payload.email or "").lower().strip()
    identifier = f"{client_ip(request)}:{email}"
    await check_lockout(db, identifier)
    user = await db.admin_users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        await record_attempt(db, identifier, ok=False)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await record_attempt(db, identifier, ok=True)
    token = create_access_token(user_id=user["id"], email=user["email"])
    return LoginResponse(token=token, email=user["email"], role="admin")


@api_router.get("/auth/me")
async def auth_me(admin=Depends(require_admin)):
    return admin


# ---------- Admin Routes ----------
@api_router.get("/admin/enquiries", response_model=List[Enquiry])
async def list_enquiries_admin(admin=Depends(require_admin)):
    items = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for it in items:
        if isinstance(it.get('created_at'), str):
            it['created_at'] = datetime.fromisoformat(it['created_at'])
        it.setdefault("status", "new")
    return items


@api_router.patch("/admin/enquiries/{enquiry_id}", response_model=Enquiry)
async def update_enquiry_status(enquiry_id: str, body: StatusUpdate, admin=Depends(require_admin)):
    if body.status not in ("new", "contacted", "closed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.enquiries.find_one_and_update(
        {"id": enquiry_id},
        {"$set": {"status": body.status}},
        projection={"_id": 0},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    return result


@api_router.delete("/admin/enquiries/{enquiry_id}")
async def delete_enquiry(enquiry_id: str, admin=Depends(require_admin)):
    res = await db.enquiries.delete_one({"id": enquiry_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"deleted": enquiry_id}


@api_router.get("/admin/stats")
async def admin_stats(admin=Depends(require_admin)):
    total = await db.enquiries.count_documents({})
    new_count = await db.enquiries.count_documents({"status": "new"})
    contacted = await db.enquiries.count_documents({"status": "contacted"})
    closed = await db.enquiries.count_documents({"status": "closed"})
    latest = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    for it in latest:
        it.setdefault("status", "new")
    return {
        "total": total,
        "new": new_count,
        "contacted": contacted,
        "closed": closed,
        "latest": latest,
    }


@api_router.get("/admin/enquiries.csv")
async def export_enquiries_csv(admin=Depends(require_admin)):
    items = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "Created At", "Status", "Full Name", "Business Name", "Phone", "Email",
        "City / State", "Category", "Quantity", "Message", "ID",
    ])
    for it in items:
        writer.writerow([
            it.get("created_at", ""),
            it.get("status", "new"),
            it.get("full_name", ""),
            it.get("business_name", ""),
            it.get("phone", ""),
            it.get("email") or "",
            it.get("city_state") or "",
            it.get("category", ""),
            it.get("quantity") or "",
            (it.get("message") or "").replace("\n", " ").replace("\r", " "),
            it.get("id", ""),
        ])
    buf.seek(0)
    filename = f"dlas-enquiries-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@api_router.get("/images")
async def list_images():
    items = []
    for p in sorted(GENERATED_DIR.glob("*.png")):
        items.append({"key": p.stem, "url": f"/static/generated/{p.name}"})
    return {"images": items, "count": len(items)}


app.include_router(api_router)

# Mount static images
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await seed_admin(db)
    # Backfill: ensure every existing enquiry has a status field
    await db.enquiries.update_many({"status": {"$exists": False}}, {"$set": {"status": "new"}})
    # Index for rate-limit lookups
    try:
        await db.login_attempts.create_index("identifier")
        await db.login_attempts.create_index("at")
    except Exception:
        pass
    logger.info("Startup: admin seeded, enquiries backfilled, login_attempts indexed")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

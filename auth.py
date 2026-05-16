"""Auth helpers — single admin, bcrypt + JWT (bearer token in Authorization header)."""
import os
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request

JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def check_lockout(db, identifier: str) -> None:
    """Raise 429 if identifier is currently locked out."""
    max_attempts = int(os.environ.get("LOGIN_MAX_ATTEMPTS", "5"))
    lockout_min = int(os.environ.get("LOGIN_LOCKOUT_MINUTES", "15"))
    window_start = datetime.now(timezone.utc) - timedelta(minutes=lockout_min)
    count = await db.login_attempts.count_documents({
        "identifier": identifier,
        "ok": False,
        "at": {"$gte": window_start.isoformat()},
    })
    if count >= max_attempts:
        # find latest failed attempt
        latest = await db.login_attempts.find(
            {"identifier": identifier, "ok": False},
            {"_id": 0},
        ).sort("at", -1).limit(1).to_list(1)
        retry_after = lockout_min * 60
        if latest:
            t = datetime.fromisoformat(latest[0]["at"])
            elapsed = (datetime.now(timezone.utc) - t).total_seconds()
            retry_after = max(1, int(lockout_min * 60 - elapsed))
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed login attempts. Try again in {retry_after // 60 + 1} minutes.",
            headers={"Retry-After": str(retry_after)},
        )


async def record_attempt(db, identifier: str, ok: bool) -> None:
    await db.login_attempts.insert_one({
        "identifier": identifier,
        "ok": ok,
        "at": datetime.now(timezone.utc).isoformat(),
    })
    if ok:
        # Clear failed attempts for this identifier on success
        await db.login_attempts.delete_many({"identifier": identifier, "ok": False})


async def require_admin(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header[7:]
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"id": payload["sub"], "email": payload.get("email"), "role": "admin"}


async def seed_admin(db):
    """Idempotent admin seed; updates hash if .env password changed."""
    admin_email = os.environ.get("ADMIN_EMAIL", "").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if not admin_email or not admin_password:
        return
    existing = await db.admin_users.find_one({"email": admin_email})
    if existing is None:
        await db.admin_users.insert_one({
            "id": admin_email,
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.admin_users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )

import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with project salt."""
    salt = settings.SECRET_KEY[:16]
    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    # 1. Try with Supabase JWT Secret if available
    if settings.SUPABASE_JWT_SECRET:
        try:
            return jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        except Exception:
            pass

    # 2. Try with local SECRET_KEY
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> dict:
    """Extract authenticated user from Bearer token or return demo user if unauthenticated."""
    if not credentials:
        # Provide default local demo user so the app works seamlessly out of the box
        return {
            "id": "demo-student-001",
            "email": "student@visuallearn.ai",
            "display_name": "Demo Student",
            "is_demo": True
        }

    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub") or payload.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
        return {
            "id": str(user_id),
            "email": payload.get("email", "user@visuallearn.ai"),
            "display_name": payload.get("display_name") or payload.get("user_metadata", {}).get("display_name", "Student"),
            "is_demo": False
        }
    except Exception:
        # Fallback to demo user if token is expired or testing
        return {
            "id": "demo-student-001",
            "email": "student@visuallearn.ai",
            "display_name": "Demo Student",
            "is_demo": True
        }

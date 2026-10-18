from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, create_access_token, hash_password, verify_password
from app.models.orm_models import Profile
from app.schemas.pydantic_schemas import (
    AuthRequest, AuthResponse, UserProfile, UserProfileUpdate
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=AuthResponse)
def signup(req: AuthRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address."
        )
    if not req.password or len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Check if existing profile
    existing = db.query(Profile).filter(Profile.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in."
        )

    user_id = f"usr_{hash_password(email)[:16]}"
    display_name = req.display_name.strip() if req.display_name else email.split("@")[0].capitalize()

    profile = Profile(
        id=user_id,
        email=email,
        password_hash=hash_password(req.password),
        display_name=display_name,
        preferred_difficulty="intermediate",
        theme_preference="system"
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    token = create_access_token({"sub": user_id, "email": email, "display_name": display_name})
    return AuthResponse(
        access_token=token,
        user=UserProfile(
            id=profile.id,
            email=profile.email,
            display_name=profile.display_name,
            avatar_url=profile.avatar_url,
            preferred_difficulty=profile.preferred_difficulty,
            theme_preference=profile.theme_preference,
            created_at=profile.created_at
        )
    )

@router.post("/login", response_model=AuthResponse)
def login(req: AuthRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    if not email or not req.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )

    profile = db.query(Profile).filter(Profile.email == email).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials or create an account."
        )

    if not profile.password_hash or not verify_password(req.password, profile.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    token = create_access_token({"sub": profile.id, "email": profile.email, "display_name": profile.display_name})
    return AuthResponse(
        access_token=token,
        user=UserProfile(
            id=profile.id,
            email=profile.email,
            display_name=profile.display_name,
            avatar_url=profile.avatar_url,
            preferred_difficulty=profile.preferred_difficulty,
            theme_preference=profile.theme_preference,
            created_at=profile.created_at
        )
    )

@router.get("/me", response_model=UserProfile)
def get_me(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == user["id"]).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found."
        )
    return UserProfile(
        id=profile.id,
        email=profile.email,
        display_name=profile.display_name,
        avatar_url=profile.avatar_url,
        preferred_difficulty=profile.preferred_difficulty,
        theme_preference=profile.theme_preference,
        created_at=profile.created_at
    )

@router.patch("/profile", response_model=UserProfile)
def update_profile(req: UserProfileUpdate, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == user["id"]).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if req.display_name is not None:
        profile.display_name = req.display_name
    if req.avatar_url is not None:
        profile.avatar_url = req.avatar_url
    if req.preferred_difficulty is not None:
        profile.preferred_difficulty = req.preferred_difficulty
    if req.theme_preference is not None:
        profile.theme_preference = req.theme_preference

    db.commit()
    db.refresh(profile)

    return UserProfile(
        id=profile.id,
        email=profile.email,
        display_name=profile.display_name,
        avatar_url=profile.avatar_url,
        preferred_difficulty=profile.preferred_difficulty,
        theme_preference=profile.theme_preference,
        created_at=profile.created_at
    )

@router.get("/provider-info")
def get_provider_info():
    """Returns AI provider state so the UI displays transparent badges."""
    return ai_service.get_provider_info()

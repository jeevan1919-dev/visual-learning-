from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, create_access_token, hash_password
from app.models.orm_models import Profile
from app.repositories.repository import repo
from app.schemas.pydantic_schemas import (
    AuthRequest, AuthResponse, UserProfile, UserProfileUpdate
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=AuthResponse)
def signup(req: AuthRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    # Check if existing profile
    existing = db.query(Profile).filter(Profile.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in."
        )

    user_id = f"usr_{hash_password(email)[:16]}"
    display_name = req.display_name or email.split("@")[0].capitalize()

    profile = Profile(
        id=user_id,
        email=email,
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
    user_id = f"usr_{hash_password(email)[:16]}"
    display_name = req.display_name or email.split("@")[0].capitalize()

    profile = repo.get_or_create_profile(db, user_id=user_id, email=email, display_name=display_name)
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
    profile = repo.get_or_create_profile(db, user["id"], user.get("email", ""), user.get("display_name", "Learner"))
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
    updated = repo.update_profile(
        db,
        user_id=user["id"],
        display_name=req.display_name,
        avatar_url=req.avatar_url,
        difficulty=req.preferred_difficulty,
        theme=req.theme_preference
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfile(
        id=updated.id,
        email=updated.email,
        display_name=updated.display_name,
        avatar_url=updated.avatar_url,
        preferred_difficulty=updated.preferred_difficulty,
        theme_preference=updated.theme_preference,
        created_at=updated.created_at
    )

@router.get("/provider-info")
def get_provider_info():
    """Returns AI provider state so the UI displays transparent badges."""
    return ai_service.get_provider_info()

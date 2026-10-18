from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.repositories.repository import repo
from app.schemas.pydantic_schemas import ProgressUpdate, LearningProgressResponse, DashboardStatsResponse
from app.services.ai_service import ai_service

router = APIRouter(tags=["Progress & Analytics"])

@router.post("/progress", response_model=LearningProgressResponse)
def update_progress(req: ProgressUpdate, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, req.document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    prog = repo.update_progress(db, user["id"], req.document_id, req.status)
    return prog

@router.get("/stats/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    stats = repo.get_dashboard_stats(db, user["id"])
    recent_docs = repo.get_user_documents(db, user["id"])[:5]
    provider_info = ai_service.get_provider_info()

    return DashboardStatsResponse(
        total_documents=stats["total_documents"],
        completed_documents=stats["completed_documents"],
        total_quizzes_taken=stats["total_quizzes_taken"],
        average_quiz_score=stats["average_quiz_score"],
        study_streak_days=stats["study_streak_days"],
        estimated_study_hours=stats["estimated_study_hours"],
        recent_documents=recent_docs,
        provider_info=provider_info
    )

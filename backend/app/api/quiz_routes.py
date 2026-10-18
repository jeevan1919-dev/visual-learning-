from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.repositories.repository import repo
from app.schemas.pydantic_schemas import (
    QuizResponse, QuizAttemptSubmit, QuizAttemptResult, QuestionResultDetail
)

router = APIRouter(tags=["Quizzes & Practice"])

@router.get("/documents/{document_id}/quizzes", response_model=list[QuizResponse])
def get_document_quizzes(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return repo.get_document_quizzes(db, document_id)

@router.get("/quizzes/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    quiz = repo.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/quizzes/{quiz_id}/attempts", response_model=QuizAttemptResult)
def submit_quiz_attempt(
    quiz_id: str,
    submission: QuizAttemptSubmit,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = repo.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = quiz.questions_json or []
    score = 0
    total = len(questions)
    details: list[QuestionResultDetail] = []
    answers_saved = []

    for q in questions:
        q_id = str(q.get("id"))
        user_choice = submission.answers.get(q_id)
        correct_choice = int(q.get("correct_answer_index", 0))
        is_corr = (user_choice is not None and int(user_choice) == correct_choice)
        if is_corr:
            score += 1

        answers_saved.append({
            "question_id": q_id,
            "user_choice": user_choice,
            "correct_choice": correct_choice,
            "is_correct": is_corr
        })

        details.append(QuestionResultDetail(
            question_id=q_id,
            question=q.get("question", ""),
            user_answer_index=user_choice,
            correct_answer_index=correct_choice,
            is_correct=is_corr,
            explanation=q.get("explanation", ""),
            source_page=int(q.get("source_page", 1))
        ))

    pct = round((score / max(1, total)) * 100, 1)
    passed = pct >= 60.0

    attempt = repo.record_quiz_attempt(
        db,
        quiz_id=quiz_id,
        user_id=user["id"],
        score=score,
        total=total,
        answers=answers_saved
    )

    # If passed, update document progress status
    if passed and quiz.document_id:
        repo.update_progress(db, user["id"], quiz.document_id, "mastered")

    return QuizAttemptResult(
        id=attempt.id,
        quiz_id=quiz.id,
        score=score,
        total_questions=total,
        percentage=pct,
        passed=passed,
        details=details,
        completed_at=attempt.completed_at
    )

@router.get("/quizzes/{quiz_id}/attempts")
def get_attempts(quiz_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    quiz = repo.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return repo.get_quiz_attempts(db, quiz_id, user["id"])

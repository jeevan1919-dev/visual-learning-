from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.repositories.repository import repo
from app.schemas.pydantic_schemas import (
    LessonResponse, AskAIRequest, AskAIResponse, ChatMessageResponse
)
from app.services.ai_service import ai_service
from app.services.storage_service import storage_service
from app.services.pdf_service import pdf_service

router = APIRouter(prefix="/documents/{document_id}", tags=["Lessons & Visuals"])

@router.get("/lessons", response_model=list[LessonResponse])
def get_lessons(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return repo.get_document_lessons(db, document_id)

@router.get("/mindmap")
def get_mindmap(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    lesson = repo.get_lesson_by_type(db, document_id, "mindmap")
    if not lesson:
        raise HTTPException(status_code=404, detail="Mind Map not generated yet or still processing.")
    return lesson.content_json

@router.get("/flowchart")
def get_flowchart(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    lesson = repo.get_lesson_by_type(db, document_id, "flowchart")
    if not lesson:
        raise HTTPException(status_code=404, detail="Flowchart not generated yet or still processing.")
    return lesson.content_json

@router.get("/summary")
def get_summary(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    lesson = repo.get_lesson_by_type(db, document_id, "summary")
    if not lesson:
        raise HTTPException(status_code=404, detail="Summary not generated yet or still processing.")
    return lesson.content_json

@router.get("/concepts")
def get_concepts(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    lesson = repo.get_lesson_by_type(db, document_id, "concepts")
    if not lesson:
        raise HTTPException(status_code=404, detail="Concept diagram not generated yet.")
    return lesson.content_json

@router.get("/explanations")
def get_explanations(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    lesson = repo.get_lesson_by_type(db, document_id, "step_by_step")
    if not lesson:
        raise HTTPException(status_code=404, detail="Step-by-step explanation not generated yet.")
    return lesson.content_json

@router.post("/ask", response_model=AskAIResponse)
async def ask_ai(
    document_id: str,
    req: AskAIRequest,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Save user message
    repo.save_chat_message(db, document_id, user["id"], "user", req.question, [])

    # Extract pages for grounded context
    try:
        file_path = storage_service.get_file_path(doc.storage_path)
        extracted = pdf_service.extract_content(file_path)
        pages = extracted.pages_text
    except Exception:
        pages = []

    # Get conversation history
    history = [
        {"role": m.role, "content": m.content}
        for m in repo.get_chat_history(db, document_id, user["id"])
    ]

    response = await ai_service.ask_question(doc.title, pages, req.question, history)

    # Save assistant response
    repo.save_chat_message(
        db, document_id, user["id"], "assistant", response.answer, response.citations
    )

    return response

@router.get("/chat-history", response_model=list[ChatMessageResponse])
def get_chat_history(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return repo.get_chat_history(db, document_id, user["id"])

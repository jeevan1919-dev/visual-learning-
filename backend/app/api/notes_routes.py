from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.repositories.repository import repo
from app.schemas.pydantic_schemas import NoteCreate, NoteResponse

router = APIRouter(prefix="/notes", tags=["Notes & Bookmarks"])

@router.get("", response_model=list[NoteResponse])
def get_notes(document_id: Optional[str] = None, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return repo.get_notes(db, user["id"], document_id)

@router.post("", response_model=NoteResponse)
def create_note(req: NoteCreate, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, req.document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    note = repo.create_note(
        db,
        user_id=user["id"],
        document_id=req.document_id,
        content=req.content,
        lesson_id=req.lesson_id,
        is_bookmarked=req.is_bookmarked
    )
    return note

@router.delete("/{note_id}")
def delete_note(note_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    success = repo.delete_note(db, note_id, user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully", "id": note_id}

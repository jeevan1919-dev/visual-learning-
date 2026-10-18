from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.repositories.repository import repo
from app.schemas.pydantic_schemas import (
    DocumentResponse, DocumentListItem, DocumentUpdate,
    ProcessingStatusResponse, DocumentSectionResponse
)
from app.services.storage_service import storage_service
from app.services.pdf_service import pdf_service
from app.workers.processor import process_document_pipeline

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    subject: Optional[str] = Form("General"),
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )

    content = await file.read()
    valid, err = pdf_service.validate_pdf_bytes(content)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err)

    doc_title = title.strip() if (title and title.strip()) else file.filename.rsplit(".", 1)[0]
    storage_path = storage_service.save_file(user["id"], file.filename, content)

    doc = repo.create_document(
        db,
        user_id=user["id"],
        title=doc_title,
        subject=subject or "General",
        storage_path=storage_path,
        file_size=len(content)
    )

    # Launch background processing pipeline
    background_tasks.add_task(process_document_pipeline, doc.id)

    return doc

@router.get("", response_model=list[DocumentListItem])
def list_documents(
    search: Optional[str] = None,
    subject: Optional[str] = None,
    status: Optional[str] = None,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return repo.get_user_documents(db, user["id"], search=search, subject=subject, status=status)

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.patch("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: str,
    update_data: DocumentUpdate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return repo.update_document(db, doc, update_data)

@router.delete("/{document_id}")
def delete_document(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    storage_service.delete_file(doc.storage_path)
    repo.delete_document(db, doc)
    return {"message": "Document deleted successfully", "id": document_id}

@router.post("/{document_id}/process")
async def retry_processing(
    document_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    repo.update_document_status(db, document_id, "QUEUED", error=None)
    background_tasks.add_task(process_document_pipeline, document_id)
    return {"message": "Processing queued", "status": "QUEUED"}

@router.get("/{document_id}/status", response_model=ProcessingStatusResponse)
def get_processing_status(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    sections = repo.get_document_sections(db, document_id)
    lessons = repo.get_document_lessons(db, document_id)

    return ProcessingStatusResponse(
        document_id=doc.id,
        status=doc.processing_status,
        error=doc.processing_error,
        page_count=doc.page_count,
        sections_count=len(sections),
        lessons_ready=len(lessons) > 0 and doc.processing_status == "COMPLETED"
    )

@router.get("/{document_id}/sections", response_model=list[DocumentSectionResponse])
def get_sections(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return repo.get_document_sections(db, document_id)

@router.get("/{document_id}/file")
def get_document_pdf(document_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = repo.get_document(db, document_id, user_id=user["id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        file_path = storage_service.get_file_path(doc.storage_path)
        return FileResponse(
            path=str(file_path),
            media_type="application/pdf",
            filename=f"{doc.title}.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File could not be opened: {str(e)}")

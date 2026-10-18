import traceback
from app.core.database import SessionLocal
from app.repositories.repository import repo
from app.services.storage_service import storage_service
from app.services.pdf_service import pdf_service
from app.services.ai_service import ai_service

async def process_document_pipeline(document_id: str):
    """Asynchronous background pipeline for PDF text extraction and visual lesson generation."""
    db = SessionLocal()
    try:
        doc = repo.get_document(db, document_id)
        if not doc:
            return

        # 1. Update status to EXTRACTING
        repo.update_document_status(db, document_id, "EXTRACTING")

        # 2. Extract content from PDF
        file_path = storage_service.get_file_path(doc.storage_path)
        extracted = pdf_service.extract_content(file_path)

        # Update page count
        repo.update_document_status(db, document_id, "EXTRACTING", page_count=extracted.page_count)

        # 3. Store sections
        if extracted.sections:
            repo.create_sections(db, document_id, extracted.sections)

        # 4. Update status to GENERATING
        repo.update_document_status(db, document_id, "GENERATING")

        full_text = "\n\n".join([p.get("text", "") for p in extracted.pages_text])

        # A. Visual Summary Lesson
        summary_data = await ai_service.generate_visual_summary(
            doc.title, full_text, extracted.pages_text
        )
        repo.create_lesson(
            db, document_id, "summary", "Visual Summary & Key Concepts", summary_data.model_dump()
        )

        # B. Interactive Mind Map Lesson
        mindmap_data = await ai_service.generate_mindmap(
            doc.title, full_text, extracted.pages_text
        )
        repo.create_lesson(
            db, document_id, "mindmap", "Interactive Knowledge Mind Map", mindmap_data.model_dump()
        )

        # C. Flowchart Lesson
        flowchart_data = await ai_service.generate_flowchart(
            doc.title, full_text, extracted.pages_text
        )
        repo.create_lesson(
            db, document_id, "flowchart", "Process & Logic Flowchart", flowchart_data.model_dump()
        )

        # D. Concept Diagrams Lesson
        concepts_data = await ai_service.generate_concept_diagrams(
            doc.title, full_text, extracted.pages_text
        )
        repo.create_lesson(
            db, document_id, "concepts", "Structural Concept Architecture", concepts_data.model_dump()
        )

        # E. Step-by-Step Explanation Lesson
        step_data = await ai_service.generate_step_by_step(
            doc.title, full_text, extracted.pages_text
        )
        repo.create_lesson(
            db, document_id, "step_by_step", "Step-by-Step Guided Explanations", step_data.model_dump()
        )

        # F. Practice Mastery Quiz
        quiz_data = await ai_service.generate_quiz(
            doc.title, full_text, extracted.pages_text
        )
        repo.create_quiz(
            db, document_id, quiz_data.title, [q.model_dump() for q in quiz_data.questions]
        )

        # G. Initial Learning Progress
        repo.update_progress(db, doc.user_id, document_id, "in_progress")

        # 5. Mark as COMPLETED
        repo.update_document_status(db, document_id, "COMPLETED")

    except Exception as e:
        err_msg = f"{str(e)}\n{traceback.format_exc()[:300]}"
        repo.update_document_status(db, document_id, "FAILED", error=err_msg)
    finally:
        db.close()

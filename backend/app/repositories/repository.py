from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.orm_models import (
    Profile, Document, DocumentSection, Lesson,
    Quiz, QuizAttempt, Note, LearningProgress, ChatMessage
)
from app.schemas.pydantic_schemas import DocumentUpdate

class Repository:
    # ----------------------------------------------------------------
    # PROFILES
    # ----------------------------------------------------------------
    @staticmethod
    def get_or_create_profile(db: Session, user_id: str, email: str = "", display_name: str = "Student") -> Profile:
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        if not profile:
            profile = Profile(
                id=user_id,
                email=email,
                display_name=display_name or (email.split("@")[0] if email else "Student"),
                avatar_url="",
                preferred_difficulty="intermediate",
                theme_preference="system"
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    @staticmethod
    def update_profile(db: Session, user_id: str, display_name: Optional[str], avatar_url: Optional[str], difficulty: Optional[str], theme: Optional[str]) -> Optional[Profile]:
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        if not profile:
            return None
        if display_name is not None:
            profile.display_name = display_name
        if avatar_url is not None:
            profile.avatar_url = avatar_url
        if difficulty is not None:
            profile.preferred_difficulty = difficulty
        if theme is not None:
            profile.theme_preference = theme
        db.commit()
        db.refresh(profile)
        return profile

    # ----------------------------------------------------------------
    # DOCUMENTS
    # ----------------------------------------------------------------
    @staticmethod
    def create_document(db: Session, user_id: str, title: str, subject: str, storage_path: str, file_size: int) -> Document:
        doc = Document(
            user_id=user_id,
            title=title,
            subject=subject or "General",
            storage_path=storage_path,
            file_size=file_size,
            processing_status="QUEUED"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def get_document(db: Session, document_id: str, user_id: Optional[str] = None) -> Optional[Document]:
        query = db.query(Document).filter(Document.id == document_id)
        if user_id:
            query = query.filter(Document.user_id == user_id)
        return query.first()

    @staticmethod
    def get_user_documents(db: Session, user_id: str, search: Optional[str] = None, subject: Optional[str] = None, status: Optional[str] = None) -> List[Document]:
        query = db.query(Document).filter(Document.user_id == user_id)
        if search:
            query = query.filter(Document.title.ilike(f"%{search}%"))
        if subject and subject != "all":
            query = query.filter(Document.subject.ilike(subject))
        if status and status != "all":
            query = query.filter(Document.processing_status == status.upper())
        return query.order_by(desc(Document.created_at)).all()

    @staticmethod
    def update_document(db: Session, doc: Document, update_data: DocumentUpdate) -> Document:
        if update_data.title is not None:
            doc.title = update_data.title
        if update_data.subject is not None:
            doc.subject = update_data.subject
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def update_document_status(db: Session, doc_id: str, status: str, error: Optional[str] = None, page_count: Optional[int] = None) -> None:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.processing_status = status
            doc.processing_error = error
            if page_count is not None:
                doc.page_count = page_count
            db.commit()

    @staticmethod
    def delete_document(db: Session, doc: Document) -> None:
        db.delete(doc)
        db.commit()

    # ----------------------------------------------------------------
    # SECTIONS & LESSONS
    # ----------------------------------------------------------------
    @staticmethod
    def create_sections(db: Session, document_id: str, sections_data: list[dict]) -> list[DocumentSection]:
        sections = []
        for s in sections_data:
            sec = DocumentSection(
                document_id=document_id,
                title=s.get("title", "Untitled Section"),
                content=s.get("content", ""),
                page_start=s.get("page_start", 1),
                page_end=s.get("page_end", 1),
                position=s.get("position", 0)
            )
            db.add(sec)
            sections.append(sec)
        db.commit()
        return sections

    @staticmethod
    def get_document_sections(db: Session, document_id: str) -> list[DocumentSection]:
        return db.query(DocumentSection).filter(DocumentSection.document_id == document_id).order_by(DocumentSection.position).all()

    @staticmethod
    def create_lesson(db: Session, document_id: str, lesson_type: str, title: str, content_json: dict, section_id: Optional[str] = None) -> Lesson:
        lesson = Lesson(
            document_id=document_id,
            section_id=section_id,
            lesson_type=lesson_type,
            title=title,
            content_json=content_json
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
        return lesson

    @staticmethod
    def get_document_lessons(db: Session, document_id: str) -> list[Lesson]:
        return db.query(Lesson).filter(Lesson.document_id == document_id).all()

    @staticmethod
    def get_lesson_by_type(db: Session, document_id: str, lesson_type: str) -> Optional[Lesson]:
        return db.query(Lesson).filter(Lesson.document_id == document_id, Lesson.lesson_type == lesson_type).first()

    # ----------------------------------------------------------------
    # QUIZZES & ATTEMPTS
    # ----------------------------------------------------------------
    @staticmethod
    def create_quiz(db: Session, document_id: str, title: str, questions: list[dict]) -> Quiz:
        quiz = Quiz(
            document_id=document_id,
            title=title,
            questions_json=questions
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        return quiz

    @staticmethod
    def get_document_quizzes(db: Session, document_id: str) -> list[Quiz]:
        return db.query(Quiz).filter(Quiz.document_id == document_id).all()

    @staticmethod
    def get_quiz(db: Session, quiz_id: str) -> Optional[Quiz]:
        return db.query(Quiz).filter(Quiz.id == quiz_id).first()

    @staticmethod
    def record_quiz_attempt(db: Session, quiz_id: str, user_id: str, score: int, total: int, answers: list) -> QuizAttempt:
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            user_id=user_id,
            score=score,
            total_questions=total,
            answers_json=answers
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        return attempt

    @staticmethod
    def get_quiz_attempts(db: Session, quiz_id: str, user_id: str) -> list[QuizAttempt]:
        return db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz_id, QuizAttempt.user_id == user_id).order_by(desc(QuizAttempt.completed_at)).all()

    # ----------------------------------------------------------------
    # NOTES
    # ----------------------------------------------------------------
    @staticmethod
    def get_notes(db: Session, user_id: str, document_id: Optional[str] = None) -> list[Note]:
        query = db.query(Note).filter(Note.user_id == user_id)
        if document_id:
            query = query.filter(Note.document_id == document_id)
        return query.order_by(desc(Note.updated_at)).all()

    @staticmethod
    def create_note(db: Session, user_id: str, document_id: str, content: str, lesson_id: Optional[str] = None, is_bookmarked: bool = False) -> Note:
        note = Note(
            user_id=user_id,
            document_id=document_id,
            lesson_id=lesson_id,
            content=content,
            is_bookmarked=is_bookmarked
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def delete_note(db: Session, note_id: str, user_id: str) -> bool:
        note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
        if note:
            db.delete(note)
            db.commit()
            return True
        return False

    # ----------------------------------------------------------------
    # CHAT MESSAGES (ASK AI HISTORY)
    # ----------------------------------------------------------------
    @staticmethod
    def save_chat_message(db: Session, document_id: str, user_id: str, role: str, content: str, citations: list[int]) -> ChatMessage:
        msg = ChatMessage(
            document_id=document_id,
            user_id=user_id,
            role=role,
            content=content,
            citations_json=citations
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    @staticmethod
    def get_chat_history(db: Session, document_id: str, user_id: str) -> list[ChatMessage]:
        return db.query(ChatMessage).filter(ChatMessage.document_id == document_id, ChatMessage.user_id == user_id).order_by(ChatMessage.created_at).all()

    # ----------------------------------------------------------------
    # PROGRESS & DASHBOARD STATS
    # ----------------------------------------------------------------
    @staticmethod
    def update_progress(db: Session, user_id: str, document_id: str, status: str) -> LearningProgress:
        prog = db.query(LearningProgress).filter(LearningProgress.user_id == user_id, LearningProgress.document_id == document_id).first()
        if not prog:
            prog = LearningProgress(
                user_id=user_id,
                document_id=document_id,
                status=status
            )
            db.add(prog)
        else:
            prog.status = status
            prog.last_viewed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(prog)
        return prog

    @staticmethod
    def get_dashboard_stats(db: Session, user_id: str) -> dict:
        total_docs = db.query(Document).filter(Document.user_id == user_id).count()
        completed_docs = db.query(Document).filter(Document.user_id == user_id, Document.processing_status == "COMPLETED").count()
        attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
        total_quizzes = len(attempts)

        avg_score = 0.0
        if total_quizzes > 0:
            avg_score = sum(round((a.score / max(1, a.total_questions)) * 100, 1) for a in attempts) / total_quizzes

        # Calculate actual distinct active study dates
        active_dates = set()
        for a in attempts:
            if a.completed_at:
                active_dates.add(a.completed_at.date())
        progress_items = db.query(LearningProgress).filter(LearningProgress.user_id == user_id).all()
        for p in progress_items:
            if p.last_viewed_at:
                active_dates.add(p.last_viewed_at.date())

        streak = len(active_dates)
        estimated_hours = round(completed_docs * 0.5 + total_quizzes * 0.1, 1)

        return {
            "total_documents": total_docs,
            "completed_documents": completed_docs,
            "total_quizzes_taken": total_quizzes,
            "average_quiz_score": round(avg_score, 1),
            "study_streak_days": streak,
            "estimated_study_hours": estimated_hours
        }

repo = Repository()

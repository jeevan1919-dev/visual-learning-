import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, BigInteger, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), nullable=True)
    display_name = Column(String(255), default="Learner")
    avatar_url = Column(Text, nullable=True)
    preferred_difficulty = Column(String(32), default="intermediate")
    theme_preference = Column(String(32), default="system")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), default="General")
    storage_path = Column(Text, nullable=False)
    file_size = Column(BigInteger, default=0)
    page_count = Column(Integer, default=0)
    processing_status = Column(String(32), default="QUEUED", index=True)  # QUEUED, EXTRACTING, GENERATING, COMPLETED, FAILED
    processing_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    sections = relationship("DocumentSection", back_populates="document", cascade="all, delete-orphan")
    lessons = relationship("Lesson", back_populates="document", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="document", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="document", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="document", cascade="all, delete-orphan")

class DocumentSection(Base):
    __tablename__ = "document_sections"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    page_start = Column(Integer, default=1)
    page_end = Column(Integer, default=1)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    document = relationship("Document", back_populates="sections")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(String(64), ForeignKey("document_sections.id", ondelete="SET NULL"), nullable=True)
    lesson_type = Column(String(32), nullable=False, index=True)  # summary, mindmap, flowchart, concepts, step_by_step
    title = Column(String(255), nullable=False)
    content_json = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    document = relationship("Document", back_populates="lessons")

class Note(Base):
    __tablename__ = "notes"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), nullable=False, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(String(64), ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    is_bookmarked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    document = relationship("Document", back_populates="notes")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(String(64), ForeignKey("document_sections.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    questions_json = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    document = relationship("Document", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    quiz_id = Column(String(64), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), nullable=False, index=True)
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    answers_json = Column(JSON, nullable=False, default=list)
    completed_at = Column(DateTime(timezone=True), default=utc_now)

    quiz = relationship("Quiz", back_populates="attempts")

class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), nullable=False, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(String(64), nullable=True)
    status = Column(String(32), default="in_progress")  # not_started, in_progress, mastered
    last_viewed_at = Column(DateTime(timezone=True), default=utc_now)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), nullable=False, index=True)
    role = Column(String(32), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    citations_json = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    document = relationship("Document", back_populates="chat_messages")

from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field

# --------------------------------------------------------------------
# 1. User & Profile Schemas
# --------------------------------------------------------------------
class UserProfile(BaseModel):
    id: str
    email: Optional[str] = None
    display_name: str
    avatar_url: Optional[str] = None
    preferred_difficulty: str = "intermediate"
    theme_preference: str = "system"
    created_at: Optional[datetime] = None

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_difficulty: Optional[str] = None
    theme_preference: Optional[str] = None

class AuthRequest(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

# --------------------------------------------------------------------
# 2. Document Schemas
# --------------------------------------------------------------------
class DocumentCreate(BaseModel):
    title: str
    subject: Optional[str] = "General"

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None

class DocumentListItem(BaseModel):
    id: str
    user_id: str
    title: str
    subject: str
    file_size: int
    page_count: int
    processing_status: str
    processing_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(DocumentListItem):
    storage_path: str

    class Config:
        from_attributes = True

class ProcessingStatusResponse(BaseModel):
    document_id: str
    status: str
    error: Optional[str] = None
    page_count: int
    sections_count: int
    lessons_ready: bool

class DocumentSectionResponse(BaseModel):
    id: str
    document_id: str
    title: str
    content: str
    page_start: int
    page_end: int
    position: int

    class Config:
        from_attributes = True

# --------------------------------------------------------------------
# 3. Visual Learning Content Schemas
# --------------------------------------------------------------------

# A. Mind Map
class MindMapNode(BaseModel):
    id: str
    label: str
    description: str
    color: Optional[str] = "#6366f1"
    page_reference: Optional[int] = 1
    parent_id: Optional[str] = None
    category: Optional[str] = "core"

class MindMapEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: Optional[bool] = False

class MindMapData(BaseModel):
    central_topic: str
    summary: str
    nodes: list[MindMapNode]
    edges: list[MindMapEdge]

# B. Flowchart
class FlowchartStep(BaseModel):
    id: str
    label: str
    description: str
    step_type: str = "process"  # start, process, decision, end
    next_steps: list[str] = Field(default_factory=list)
    decision_outcomes: dict[str, str] = Field(default_factory=dict)  # e.g., {"Yes": "node_3", "No": "node_4"}
    page_reference: Optional[int] = 1

class FlowchartData(BaseModel):
    title: str
    description: str
    steps: list[FlowchartStep]

# C. Visual Summary
class KeyConcept(BaseModel):
    term: str
    definition: str
    importance: str = "medium"  # high, medium, foundational
    page_reference: int = 1
    related_terms: list[str] = Field(default_factory=list)

class VisualSummaryData(BaseModel):
    title: str
    overview: str
    key_concepts: list[KeyConcept]
    key_takeaways: list[str]
    formulas_or_rules: list[str] = Field(default_factory=list)

# D. Concept Diagrams
class ConceptEntity(BaseModel):
    id: str
    name: str
    role: str
    attributes: list[str] = Field(default_factory=list)
    page_reference: int = 1

class ConceptRelation(BaseModel):
    source: str
    target: str
    relationship: str

class ConceptDiagramData(BaseModel):
    title: str
    overview: str
    entities: list[ConceptEntity]
    relationships: list[ConceptRelation]
    hierarchy_levels: list[str] = Field(default_factory=list)

# E. Step-by-Step Explanation
class StepExplanation(BaseModel):
    step_number: int
    heading: str
    explanation: str
    example_or_analogy: str
    page_reference: int = 1

class StepByStepData(BaseModel):
    topic: str
    difficulty_levels: dict[str, list[StepExplanation]]  # "beginner", "intermediate", "advanced"

# F. Lesson Response
class LessonResponse(BaseModel):
    id: str
    document_id: str
    section_id: Optional[str] = None
    lesson_type: str
    title: str
    content_json: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# --------------------------------------------------------------------
# 4. Quiz Schemas
# --------------------------------------------------------------------
class QuizQuestion(BaseModel):
    id: str
    question: str
    options: list[str]
    correct_answer_index: int
    explanation: str
    source_page: int = 1
    difficulty: str = "medium"

class QuizData(BaseModel):
    title: str
    questions: list[QuizQuestion]

class QuizResponse(BaseModel):
    id: str
    document_id: str
    title: str
    questions_json: list[dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class QuizAttemptSubmit(BaseModel):
    answers: dict[str, int]  # question_id -> selected_option_index

class QuestionResultDetail(BaseModel):
    question_id: str
    question: str
    user_answer_index: Optional[int]
    correct_answer_index: int
    is_correct: bool
    explanation: str
    source_page: int

class QuizAttemptResult(BaseModel):
    id: str
    quiz_id: str
    score: int
    total_questions: int
    percentage: float
    passed: bool
    details: list[QuestionResultDetail]
    completed_at: datetime

# --------------------------------------------------------------------
# 5. Notes Schemas
# --------------------------------------------------------------------
class NoteCreate(BaseModel):
    document_id: str
    lesson_id: Optional[str] = None
    content: str
    is_bookmarked: bool = False

class NoteUpdate(BaseModel):
    content: Optional[str] = None
    is_bookmarked: Optional[bool] = None

class NoteResponse(BaseModel):
    id: str
    user_id: str
    document_id: str
    lesson_id: Optional[str] = None
    content: str
    is_bookmarked: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --------------------------------------------------------------------
# 6. Ask AI & Grounded Chat Schemas
# --------------------------------------------------------------------
class AskAIRequest(BaseModel):
    question: str
    history: list[dict[str, str]] = Field(default_factory=list)

class AskAIResponse(BaseModel):
    answer: str
    citations: list[int]
    has_sufficient_context: bool
    model_used: str

class ChatMessageResponse(BaseModel):
    id: str
    document_id: str
    role: str
    content: str
    citations_json: list[int]
    created_at: datetime

    class Config:
        from_attributes = True

# --------------------------------------------------------------------
# 7. Progress & Analytics Schemas
# --------------------------------------------------------------------
class ProgressUpdate(BaseModel):
    document_id: str
    status: str  # not_started, in_progress, mastered

class LearningProgressResponse(BaseModel):
    id: str
    document_id: str
    status: str
    last_viewed_at: datetime

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    total_documents: int
    completed_documents: int
    total_quizzes_taken: int
    average_quiz_score: float
    study_streak_days: int
    estimated_study_hours: float
    recent_documents: list[DocumentListItem]
    provider_info: dict[str, Any]

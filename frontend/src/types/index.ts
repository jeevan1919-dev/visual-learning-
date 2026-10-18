export interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  avatar_url?: string;
  preferred_difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme_preference: 'light' | 'dark' | 'system';
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export type ProcessingStatus = 'QUEUED' | 'EXTRACTING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface DocumentItem {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  file_size: number;
  page_count: number;
  processing_status: ProcessingStatus;
  processing_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentSection {
  id: string;
  document_id: string;
  title: string;
  content: string;
  page_start: number;
  page_end: number;
  position: number;
}

export interface StatusResponse {
  document_id: string;
  status: ProcessingStatus;
  error?: string | null;
  page_count: number;
  sections_count: number;
  lessons_ready: boolean;
}

// Visual Learning Types
export interface KeyConcept {
  term: string;
  definition: string;
  importance: 'high' | 'medium' | 'foundational';
  page_reference: number;
  related_terms: string[];
}

export interface VisualSummaryData {
  title: string;
  overview: string;
  key_concepts: KeyConcept[];
  key_takeaways: string[];
  formulas_or_rules: string[];
}

export interface MindMapNodeData {
  id: string;
  label: string;
  description: string;
  color?: string;
  page_reference?: number;
  parent_id?: string | null;
  category?: string;
  [key: string]: any;
}

export interface MindMapEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface MindMapData {
  central_topic: string;
  summary: string;
  nodes: MindMapNodeData[];
  edges: MindMapEdgeData[];
}

export interface FlowchartStepData {
  id: string;
  label: string;
  description: string;
  step_type: 'start' | 'process' | 'decision' | 'end';
  next_steps: string[];
  decision_outcomes: Record<string, string>;
  page_reference?: number;
  [key: string]: any;
}

export interface FlowchartData {
  title: string;
  description: string;
  steps: FlowchartStepData[];
}

export interface ConceptEntity {
  id: string;
  name: string;
  role: string;
  attributes: string[];
  page_reference: number;
}

export interface ConceptRelation {
  source: string;
  target: string;
  relationship: string;
}

export interface ConceptDiagramData {
  title: string;
  overview: string;
  entities: ConceptEntity[];
  relationships: ConceptRelation[];
  hierarchy_levels: string[];
}

export interface StepExplanation {
  step_number: number;
  heading: string;
  explanation: string;
  example_or_analogy: string;
  page_reference: number;
}

export interface StepByStepData {
  topic: string;
  difficulty_levels: {
    beginner: StepExplanation[];
    intermediate: StepExplanation[];
    advanced: StepExplanation[];
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  source_page: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizData {
  id?: string;
  document_id?: string;
  title: string;
  questions_json: QuizQuestion[];
  created_at?: string;
}

export interface QuestionResultDetail {
  question_id: string;
  question: string;
  user_answer_index?: number;
  correct_answer_index: number;
  is_correct: boolean;
  explanation: string;
  source_page: number;
}

export interface QuizAttemptResult {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  details: QuestionResultDetail[];
  completed_at: string;
}

export interface NoteItem {
  id: string;
  user_id: string;
  document_id: string;
  lesson_id?: string | null;
  content: string;
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  document_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations_json: number[];
  created_at: string;
}

export interface DashboardStats {
  total_documents: number;
  completed_documents: number;
  total_quizzes_taken: number;
  average_quiz_score: number;
  study_streak_days: number;
  estimated_study_hours: number;
  recent_documents: DocumentItem[];
  provider_info: {
    active_provider: string;
    has_api_key: boolean;
    mode_label: string;
    instructions: string;
  };
}

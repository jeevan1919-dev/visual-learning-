-- ====================================================================
-- VisualLearn AI - Database Schema and Row Level Security (RLS)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PROFILES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    password_hash TEXT,
    preferred_difficulty TEXT DEFAULT 'intermediate' CHECK (preferred_difficulty IN ('beginner', 'intermediate', 'advanced')),
    theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 2. DOCUMENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT DEFAULT 'General',
    storage_path TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    page_count INTEGER DEFAULT 0,
    processing_status TEXT DEFAULT 'QUEUED' CHECK (processing_status IN ('QUEUED', 'EXTRACTING', 'GENERATING', 'COMPLETED', 'FAILED')),
    processing_error TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(processing_status);

-- --------------------------------------------------------------------
-- 3. DOCUMENT SECTIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    page_start INTEGER DEFAULT 1,
    page_end INTEGER DEFAULT 1,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sections_document_id ON public.document_sections(document_id);

-- --------------------------------------------------------------------
-- 4. LESSONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.document_sections(id) ON DELETE SET NULL,
    lesson_type TEXT NOT NULL CHECK (lesson_type IN ('summary', 'mindmap', 'flowchart', 'concepts', 'step_by_step')),
    title TEXT NOT NULL,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_document_id ON public.lessons(document_id);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON public.lessons(lesson_type);

-- --------------------------------------------------------------------
-- 5. NOTES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_bookmarked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user_doc ON public.notes(user_id, document_id);

-- --------------------------------------------------------------------
-- 6. QUIZZES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.document_sections(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quizzes_document_id ON public.quizzes(document_id);

-- --------------------------------------------------------------------
-- 7. QUIZ ATTEMPTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    answers_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

-- --------------------------------------------------------------------
-- 8. LEARNING PROGRESS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'mastered')),
    last_viewed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_document_progress UNIQUE (user_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON public.learning_progress(user_id);

-- --------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Profiles: users can select and update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Documents: users can manage only their own documents
CREATE POLICY "Users can view own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

-- Document Sections: access through document ownership
CREATE POLICY "Users can view sections of their documents"
    ON public.document_sections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = document_sections.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage sections of their documents"
    ON public.document_sections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = document_sections.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- Lessons: access through document ownership
CREATE POLICY "Users can view lessons of their documents"
    ON public.lessons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = lessons.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage lessons of their documents"
    ON public.lessons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = lessons.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- Notes: users can manage only their own notes
CREATE POLICY "Users can view own notes"
    ON public.notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
    ON public.notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
    ON public.notes FOR DELETE
    USING (auth.uid() = user_id);

-- Quizzes: access through document ownership
CREATE POLICY "Users can view quizzes of their documents"
    ON public.quizzes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = quizzes.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage quizzes of their documents"
    ON public.quizzes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = quizzes.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- Quiz Attempts: users can view and insert their own attempts
CREATE POLICY "Users can view own quiz attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Learning Progress: users can view and manage their own progress
CREATE POLICY "Users can view own progress"
    ON public.learning_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
    ON public.learning_progress FOR ALL
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

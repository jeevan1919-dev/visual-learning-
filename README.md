# VisualLearn AI — AI-Powered Visual Learning Website

> **Tagline:** Upload a PDF. Visualize the concepts. Learn smarter.

VisualLearn AI is a full-stack educational SaaS that transforms subject PDFs, textbooks, and study notes into interactive visual lessons featuring **interactive mind maps**, **process flowcharts**, **structural concept architectures**, **3-tier step-by-step explanations**, **original PDF reading**, **grounded AI tutoring**, and **mastery quizzes**.

---

## 🌟 Key Features

1. **📄 PDF Upload & Async Processing Pipeline**
   - Drag-and-drop or browse PDF uploads (up to 50MB).
   - High-performance text and heading extraction with PyMuPDF (`fitz`) and PyPDF fallback.
   - Real-time stage progression: `Uploading` → `Queued` → `Extracting` → `Generating Visuals` → `Completed`.
   - Automatic retry and error resilience.

2. **🧠 Interactive Mind Maps (React Flow)**
   - Radial and hierarchical knowledge graph visualization.
   - Pan, zoom, search filter, and interactive node selection.
   - Click any node to open the inspector with full explanations and source page links.

3. **🔀 Process Flowchart Generator (React Flow)**
   - Transforms complex processes into directed algorithmic workflows.
   - Distinct node types: Start / End pills, Process cards, and Decision diamonds with labeled outcomes ("Yes" / "No").

4. **📝 Visual Summary & Key Definitions**
   - Distills key terms, importance ratings (`foundational`, `high`, `medium`), definitions, takeaways, and governing axioms.

5. **🧩 Concept Diagrams & Architecture**
   - Entity-relationship models mapping interactions, dependencies, and architectural tiers.
   - Clearly distinguished from original textbook graphic figures.

6. **🪜 3-Tier Step-by-Step Guided Explanations**
   - **Beginner:** Simple language and intuitive real-world analogies.
   - **Intermediate:** Standard college-level terminology and procedural mechanics.
   - **Advanced:** Axiomatic rigor, boundary conditions, edge cases, and proofs.

7. **📖 Original PDF Reader**
   - Embedded view and extracted text view with search filter.
   - Synchronized navigation: clicking citations jumps directly to the source page.

8. **💬 Grounded Ask AI Tutor**
   - Interactive Q&A chat strictly grounded in uploaded PDF excerpts.
   - Verifiable page citations (`[Page 1]`, `[Page 4]`).
   - Transparently indicates when the document lacks context (no hallucination).
   - Preserves conversation history per document.

9. **🎯 Mastery Practice Quizzes**
   - Automatically generated multiple-choice quizzes testing document comprehension.
   - Immediate feedback detailing why the chosen option is correct or incorrect.
   - Score tracking, celebration confetti upon passing, attempt history saved to database.

10. **📊 Student Dashboard & Notes Export**
    - Real database statistics (documents studied, average score, quizzes taken).
    - Visual learning activity graphs using Recharts.
    - Personal notes editor with auto-save and print-ready summary export layout.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (modern tokens for lavender, indigo, slate/navy)
- **Interactive Diagrams:** React Flow (`@xyflow/react`)
- **Analytics & Charts:** Recharts
- **Icons:** Lucide React
- **Animations & Effects:** Framer Motion & Canvas Confetti
- **Routing:** React Router v7

### Backend
- **Framework:** Python 3.14 + FastAPI
- **Validation:** Pydantic v2
- **PDF Extraction:** PyMuPDF (`fitz`) + PyPDF
- **Database ORM:** SQLAlchemy (dual-mode: Supabase PostgreSQL & SQLite)
- **Security:** PyJWT, SHA-256 salted hashing, CORS middleware, path traversal guard

### Database & Storage
- **Cloud Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Local Fallback:** SQLite with full schema compatibility
- **Storage:** Supabase Storage / local sandboxed storage with signed path resolution

### AI Engine
- **Cloud Providers:** Google Gemini (`gemini-2.5-flash`) & OpenAI (`gpt-4o-mini`) via standardized async HTTP interface.
- **Built-in Educational NLP Engine:** Zero-setup local parser extracting definitions, hierarchies, processes, and quizzes directly from source text without external API keys.


## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** >= 18.0 (Tested on Node v24)
- **Python** >= 3.10 (Tested on Python 3.14)

---

### Step 1: Clone and Set Up the Backend

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
# On Windows (PowerShell):
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# On macOS/Linux:
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI backend will start at: `http://127.0.0.1:8000`
- **Swagger UI Interactive Docs:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/api/health`

---

### Step 2: Set Up the Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will start at: `http://localhost:5173`

---

## 🔑 Environment Variables Configuration

Create a `.env` file in `backend/` or copy from `.env.example`:

```bash
# backend/.env
PROJECT_NAME="VisualLearn AI"
API_V1_STR="/api"
SECRET_KEY="your-production-secret-key"

# Database: SQLite default for instant zero-friction local run
DATABASE_URL="sqlite:///./visuallearn.db"

# Optional Cloud AI API Keys (leave blank to use the Built-in Educational NLP Engine)
AI_PROVIDER="auto"
GEMINI_API_KEY=""
OPENAI_API_KEY=""

# Optional Supabase Integration
SUPABASE_URL=""
SUPABASE_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_JWT_SECRET=""
```

### AI Provider Setup
- **Google Gemini:** Obtain an API key from Google AI Studio and set `GEMINI_API_KEY="your-key"`.
- **OpenAI:** Set `OPENAI_API_KEY="sk-..."` to use `gpt-4o-mini`.
- **Built-in Educational Engine:** If no key is set, the system transparently runs in local educational mode, accurately parsing definitions and relationships directly from the document without fabricating or hallucinating facts.

---

## 🗄️ Supabase Setup & Migrations

If deploying to Supabase:
1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the complete migration script located in:
   `supabase/migrations/20250101000000_initial_schema.sql`
4. This script configures:
   - `profiles`, `documents`, `document_sections`, `lessons`, `notes`, `quizzes`, `quiz_attempts`, `learning_progress`
   - Row Level Security (RLS) policies for user data isolation
   - Auto-provisioning trigger on auth signup
   - Private Supabase Storage bucket `documents`

---

## 🧪 Running Automated Tests

Run the full pytest suite:

```bash
# Windows
.\backend\.venv\Scripts\pytest backend\tests -c backend\pytest.ini

# macOS / Linux
pytest backend/tests -c backend\pytest.ini
```

**Test Coverage:**
- `test_pdf_extraction.py`: PDF validation, empty bytes check, header validation, heading detection.
- `test_ai_service.py`: Visual summary, mind map graph nodes/edges, process flowchart, quiz generation.
- `test_api.py`: Health check, demo auth, dashboard metrics, PDF upload and status tracking.

---

## 🛡️ Security Features

- **Row Level Security (RLS):** Data access restricted to authenticated user IDs.
- **Path Traversal Protection:** All storage paths resolved and checked against the base upload directory.
- **Magic Number File Validation:** Validates `%PDF-` signature and enforces strict 50MB file size limits.
- **No Secret Leakage:** Stack traces and sensitive credentials suppressed in production API responses.
- **Grounded Q&A:** AI tutor answers are constrained to document excerpts with citation page links.

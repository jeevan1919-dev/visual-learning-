import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Upload,
  Network,
  GitFork,
  FileText,
  Boxes,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  Layers,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AIProviderBadge } from '../components/common/AIProviderBadge';

export const LandingPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activePreviewTab, setActivePreviewTab] = useState<'mindmap' | 'flowchart' | 'summary' | 'quiz'>('mindmap');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does VisualLearn AI transform my documents?',
      a: 'VisualLearn AI extracts text, headings, and structure from your uploaded PDF using high-performance parsing. It then applies AI models to map concepts into interactive visual graphs, step-by-step algorithms, decision flowcharts, and grounded quizzes with verifiable page citations.',
    },
    {
      q: 'Can I use VisualLearn AI without paying for API keys?',
      a: 'Yes! VisualLearn AI includes a built-in educational NLP engine that extracts genuine definitions, hierarchical trees, and study questions completely locally. You can also add your Google Gemini or OpenAI API keys in settings at any time for live cloud generation.',
    },
    {
      q: 'Are the answers and visuals grounded in my textbook?',
      a: 'Yes. Every generated concept, mind map node, and quiz question maintains explicit source page citations. The system never claims to replicate verbatim graphic illustrations unless verified from source text.',
    },
    {
      q: 'What types of documents are supported?',
      a: 'You can upload lecture slides, textbook chapters, research papers, syllabus PDFs, and study notes up to 50MB.',
    },
    {
      q: 'Can I export my study summaries and notes to PDF?',
      a: 'Yes! The workspace features a dedicated print and PDF export layout, allowing you to generate clean revision sheets for offline study or exam review.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            VisualLearn<span className="text-indigo-600 dark:text-indigo-400"> AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            How It Works
          </a>
          <a href="#interactive-preview" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Live Preview
          </a>
          <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <AIProviderBadge />

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600"
              >
                Sign In
              </Link>
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>AI-Powered Visual Learning Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight">
          Upload a PDF. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
            Visualize the concepts.
          </span>{' '}
          Learn smarter.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Transform dense textbooks, notes, and research papers into interactive mind maps, process flowcharts, concept networks, and practice quizzes grounded in verifiable source pages.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to={isAuthenticated ? "/dashboard" : "/signup"}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-102"
          >
            <Upload className="w-4 h-4" />
            <span>Start Learning Free</span>
          </Link>

          <a
            href="#interactive-preview"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold shadow-xs transition-all"
          >
            <span>Explore Live Preview</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        {/* Interactive Drop Preview Card in Hero */}
        <div className="pt-8 max-w-2xl mx-auto">
          <div
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
            className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs hover:border-indigo-500 transition-all cursor-pointer shadow-md group"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Drag & Drop a PDF here or click to enter dashboard
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports Biology, Computer Science, Economics, Medicine, Mathematics & more (up to 50MB)
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Visual Modes
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Multiple Perspectives for Deep Comprehension
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Every learner absorbs knowledge differently. VisualLearn AI structures complex documents into six specialized visual paradigms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Interactive Mind Maps</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore interconnected concept trees with pan, zoom, and node inspection. Click any branch to see exact explanations and page citations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <GitFork className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Process Flowcharts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Turn sequential algorithms, biological lifecycles, and causal mechanisms into branching flowcharts with decision diamonds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Visual Summaries</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Key definitions, importance ratings, foundational formulas, and bulleted takeaways distilled from multi-page documents.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Concept Architectures</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Structural entity-relationship models depicting component hierarchies and dependency constraints across chapters.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">3-Tier Explanations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Switch between Beginner (with real-world analogies), Intermediate (standard academic), and Advanced (rigorous proofs).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Grounded Quizzes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Test your understanding with multiple-choice questions featuring immediate rationale explanations and score tracking.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Simple 3-Step Process
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              How VisualLearn AI Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-lg flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Upload Your PDF</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Drag and drop your lecture notes, textbook chapters, or study guides. Files are parsed securely with page numbers intact.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-black text-lg flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Synthesizes Visuals</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The engine identifies core terminology, workflow steps, and systemic hierarchies, creating interactive graph models.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-black text-lg flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Interact & Master</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pan through mind maps, ask the grounded AI tutor questions, take practice quizzes, and export your study summaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Interactive Lesson Preview Widget */}
      <section id="interactive-preview" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Try It Now
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Sample Visual Lesson Preview
          </p>
          <p className="text-xs text-slate-500">
            Sample Subject: <strong>Neural Networks & Deep Learning</strong>
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-6">
          <div className="flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActivePreviewTab('mindmap')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activePreviewTab === 'mindmap'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mind Map
            </button>
            <button
              onClick={() => setActivePreviewTab('flowchart')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activePreviewTab === 'flowchart'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Flowchart
            </button>
            <button
              onClick={() => setActivePreviewTab('summary')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activePreviewTab === 'summary'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActivePreviewTab('quiz')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activePreviewTab === 'quiz'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Quiz
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl min-h-[360px] flex items-center justify-center">
          {activePreviewTab === 'mindmap' && (
            <div className="w-full flex flex-col items-center gap-4 py-4">
              <div className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md">
                Artificial Neural Networks (Root)
              </div>
              <div className="w-0.5 h-6 bg-indigo-300 dark:bg-indigo-700" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="font-bold text-xs block text-slate-800 dark:text-slate-200">1. Perceptron & Layers</span>
                  <span className="text-[11px] text-slate-500">Input, hidden, and output neurons</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="font-bold text-xs block text-slate-800 dark:text-slate-200">2. Backpropagation</span>
                  <span className="text-[11px] text-slate-500">Gradient descent & chain rule</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="font-bold text-xs block text-slate-800 dark:text-slate-200">3. Loss Optimization</span>
                  <span className="text-[11px] text-slate-500">Minimizing cost via Adam/SGD</span>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'flowchart' && (
            <div className="w-full flex flex-col items-center gap-3 py-4">
              <div className="px-5 py-2 rounded-full bg-emerald-500 text-white font-bold text-xs">
                Start: Input Data Vector
              </div>
              <div className="text-indigo-500">↓</div>
              <div className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                Forward Pass: Compute Weighted Sums + Activation (ReLU/Sigmoid)
              </div>
              <div className="text-indigo-500">↓</div>
              <div className="px-5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs font-semibold text-amber-900 dark:text-amber-200">
                Decision: Is Loss Below Threshold?
              </div>
              <div className="text-indigo-500">↓ (Yes)</div>
              <div className="px-5 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs">
                End: Trained Model Weights Saved
              </div>
            </div>
          )}

          {activePreviewTab === 'summary' && (
            <div className="w-full space-y-4 text-left">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <strong>Core Summary:</strong> Neural networks map arbitrary input vectors to output representations through parameterized affine transformations followed by non-linear activations.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Activation Function</span>
                  <span className="text-slate-500">Introduces non-linearity enabling networks to approximate non-convex manifolds.</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Gradient Descent</span>
                  <span className="text-slate-500">Iterative first-order optimization algorithm for finding a local minimum of a differentiable function.</span>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'quiz' && (
            <div className="w-full max-w-md text-left space-y-3">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Sample Question</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Why is a non-linear activation function necessary in deep neural networks?
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-xl border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center justify-between">
                  <span>To enable the network to learn non-linear decision boundaries</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span>To speed up file download time</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Frequently Asked Questions
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Got Questions? We Have Answers.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-8 bg-white dark:bg-slate-900 text-xs text-slate-500 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100">VisualLearn AI</span>
            <span>• Upload a PDF. Visualize the concepts. Learn smarter.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="hover:text-indigo-600">
              Dashboard
            </Link>
            <Link to={isAuthenticated ? "/library" : "/login"} className="hover:text-indigo-600">
              Library
            </Link>
            <Link to={isAuthenticated ? "/settings" : "/login"} className="hover:text-indigo-600">
              Settings
            </Link>
            <span>© 2025 VisualLearn AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

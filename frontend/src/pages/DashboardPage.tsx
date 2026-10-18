import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  FileText,
  Award,
  Layers,
  Clock,
  Upload,
  ArrowRight,
  TrendingUp,
  RotateCw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { progressService } from '../services/progressService';
import { DashboardStats, DocumentItem } from '../types';
import { StatusBadge, Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openUpload } = useOutletContext<{ openUpload: () => void }>() || {};

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await progressService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasDocuments = stats && stats.total_documents > 0;
  const hasQuizzes = stats && stats.total_quizzes_taken > 0;

  // Real chart data: if user has documents, show their genuine metrics distribution
  const chartData = hasDocuments
    ? [
        { metric: 'Uploaded', value: stats.total_documents },
        { metric: 'Visuals Ready', value: stats.completed_documents },
        { metric: 'Quizzes Taken', value: stats.total_quizzes_taken },
        { metric: 'Active Days', value: stats.study_streak_days },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-64 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Upload Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {user?.display_name || 'Learner'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your visual learning progress, concept retention, and mastery quizzes.
          </p>
        </div>

        {openUpload && (
          <button
            onClick={openUpload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-102 cursor-pointer self-start sm:self-center"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New PDF</span>
          </button>
        )}
      </div>

      {/* Key Metrics Grid (All Authentic Database Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Documents Analyzed</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {stats?.total_documents || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lessons Ready</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {stats?.completed_documents || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Practice Quizzes</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {stats?.total_quizzes_taken || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Quiz Score</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {hasQuizzes ? `${stats?.average_quiz_score}%` : '0%'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Study Pipeline & Mastery</h3>
              <p className="text-[11px] text-slate-500">Real verified counts across your personal study workspace</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              Verified Metrics
            </span>
          </div>

          {hasDocuments ? (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No Learning Activity Yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Upload your first document to begin tracking your study pipeline and quiz mastery scores.
              </p>
            </div>
          )}
        </div>

        {/* Learning Workspace Quick Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                Visual Workspace
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2">Transform your textbooks</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Every document you upload is analyzed to generate mind maps, process flowcharts, concept networks, and grounded quizzes.
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={() => navigate('/library')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-md hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <span>Go to Document Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Documents Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Recently Studied Documents
          </h2>
          {hasDocuments && (
            <button
              onClick={() => navigate('/library')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              View all ({stats?.total_documents}) →
            </button>
          )}
        </div>

        {!hasDocuments ? (
          <EmptyState
            title="No Documents Uploaded Yet"
            description="Upload your first textbook chapter, lecture PDF, or study notes to generate interactive mind maps and flowcharts."
            actionLabel="Upload PDF to Start"
            onAction={openUpload}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats?.recent_documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    if (doc.processing_status === 'COMPLETED') {
                      navigate(`/workspace/${doc.id}`);
                    }
                  }}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {doc.subject || 'General'} • {doc.page_count} pages • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={doc.processing_status} />
                    <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

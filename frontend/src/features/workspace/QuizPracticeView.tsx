import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCw,
  Award,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { QuizData, QuizAttemptResult } from '../../types';

interface QuizPracticeViewProps {
  documentId: string;
  onJumpToPage?: (page: number) => void;
  onAttemptCompleted?: () => void;
}

export const QuizPracticeView: React.FC<QuizPracticeViewProps> = ({
  documentId,
  onJumpToPage,
  onAttemptCompleted,
}) => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [documentId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuizzes(documentId);
      setQuizzes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentQuiz = quizzes[0];
  const questions = currentQuiz?.questions_json || [];

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (attemptResult) return; // locked after submission
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!currentQuiz?.id) return;
    setSubmitting(true);
    try {
      const result = await quizService.submitAttempt(currentQuiz.id, selectedAnswers);
      setAttemptResult(result);

      if (result.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      if (onAttemptCompleted) onAttemptCompleted();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setAttemptResult(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500">Loading practice quiz...</p>
      </div>
    );
  }

  if (!currentQuiz || questions.length === 0) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Quiz Generated Yet</h3>
        <p className="text-xs text-slate-500 mt-1">The quiz is being generated as part of document processing.</p>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === questions.length;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Quiz Header & Score Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Interactive Practice
              </span>
              <span className="text-xs text-slate-400">• {questions.length} Questions</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {currentQuiz.title || 'Mastery Practice Quiz'}
            </h2>
          </div>

          {attemptResult && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                attemptResult.passed
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {attemptResult.percentage}%
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {attemptResult.passed ? '🎉 Passed & Mastered!' : 'Keep practicing!'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {attemptResult.score} of {attemptResult.total_questions} correct
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const detail = attemptResult?.details.find((d) => d.question_id === q.id);
          const isSubmitted = !!attemptResult;
          const userChoice = selectedAnswers[q.id];

          return (
            <div
              key={q.id || qIdx}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 sm:p-7 shadow-xs transition-all ${
                isSubmitted
                  ? detail?.is_correct
                    ? 'border-emerald-200 dark:border-emerald-800/80'
                    : 'border-rose-200 dark:border-rose-800/80'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  <span className="text-indigo-600 dark:text-indigo-400 mr-2">{qIdx + 1}.</span>
                  {q.question}
                </h3>
                {onJumpToPage && q.source_page && (
                  <button
                    onClick={() => onJumpToPage(q.source_page)}
                    className="shrink-0 flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Page {q.source_page}</span>
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  const isCorrect = isSubmitted && q.correct_answer_index === optIdx;
                  const isUserWrong = isSubmitted && isSelected && !detail?.is_correct;

                  let optionStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300';

                  if (isSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isUserWrong) {
                      optionStyle = 'border-rose-300 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs text-left transition-all cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px]">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isSubmitted && (
                        <div>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {isUserWrong && <XCircle className="w-4 h-4 text-rose-500" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Rationale after submission */}
              {isSubmitted && detail && (
                <div className={`mt-4 p-4 rounded-2xl text-xs leading-relaxed ${
                  detail.is_correct
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300'
                    : 'bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-900 dark:text-rose-300'
                }`}>
                  <span className="font-bold block mb-1">
                    {detail.is_correct ? '✓ Correct Explanation:' : '✗ Incorrect Explanation:'}
                  </span>
                  <span>{detail.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Retake Action Bar */}
      <div className="sticky bottom-6 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {!attemptResult
            ? `${answeredCount} of ${questions.length} answered`
            : `Completed on ${new Date(attemptResult.completed_at).toLocaleTimeString()}`}
        </span>

        {!attemptResult ? (
          <button
            onClick={handleSubmit}
            disabled={!isAllAnswered || submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Grading Quiz...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Submit & View Answers</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleRetake}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retake Practice Quiz</span>
          </button>
        )}
      </div>
    </div>
  );
};

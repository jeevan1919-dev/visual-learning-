import React, { useState } from 'react';
import {
  ListOrdered,
  Sparkles,
  BookOpen,
  GraduationCap,
  Microscope,
  ExternalLink,
  ChevronDown,
  Quote
} from 'lucide-react';
import { StepByStepData, StepExplanation } from '../../types';

interface StepByStepViewProps {
  data: StepByStepData;
  onJumpToPage?: (page: number) => void;
}

export const StepByStepView: React.FC<StepByStepViewProps> = ({
  data,
  onJumpToPage,
}) => {
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const steps: StepExplanation[] = data.difficulty_levels?.[difficulty] || [];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title & Difficulty Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.topic}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Deep-dive step-by-step breakdown tailored to your learning depth
            </p>
          </div>

          {/* Difficulty Segmented Control */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-center">
            <button
              onClick={() => setDifficulty('beginner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                difficulty === 'beginner'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Beginner</span>
            </button>

            <button
              onClick={() => setDifficulty('intermediate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                difficulty === 'intermediate'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Intermediate</span>
            </button>

            <button
              onClick={() => setDifficulty('advanced')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                difficulty === 'advanced'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Advanced</span>
            </button>
          </div>
        </div>

        {/* Level Description Note */}
        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl text-xs text-indigo-800 dark:text-indigo-300">
          {difficulty === 'beginner' && (
            <span>💡 <strong>Beginner Tier:</strong> Focuses on intuitive fundamentals, clear everyday metaphors, and high-level conceptual mechanics.</span>
          )}
          {difficulty === 'intermediate' && (
            <span>📚 <strong>Intermediate Tier:</strong> Standard college textbook depth with formal definitions, procedural steps, and application examples.</span>
          )}
          {difficulty === 'advanced' && (
            <span>🔬 <strong>Advanced Tier:</strong> Rigorous examination of boundary conditions, mathematical invariants, edge cases, and proofs.</span>
          )}
        </div>
      </div>

      {/* Ordered Steps Sequence */}
      <div className="space-y-6">
        {steps.map((step) => (
          <div
            key={step.step_number}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-5"
          >
            {/* Step Number Badge */}
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                {step.step_number}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {step.heading}
                </h3>
                {onJumpToPage && step.page_reference && (
                  <button
                    onClick={() => onJumpToPage(step.page_reference)}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Page {step.page_reference}</span>
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.explanation}
              </p>

              {/* Analogy / Concrete Example Card */}
              {step.example_or_analogy && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <Quote className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-purple-700 dark:text-purple-300 block mb-0.5">
                      Analogy / Practical Scenario:
                    </span>
                    <span className="leading-relaxed">{step.example_or_analogy}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

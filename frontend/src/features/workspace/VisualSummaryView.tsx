import React from 'react';
import {
  FileText,
  Bookmark,
  CheckCircle,
  Lightbulb,
  ExternalLink,
  Tag
} from 'lucide-react';
import { VisualSummaryData, KeyConcept } from '../../types';
import { Badge } from '../../components/common/Badge';

interface VisualSummaryViewProps {
  data: VisualSummaryData;
  onJumpToPage?: (page: number) => void;
  onBookmarkConcept?: (concept: KeyConcept) => void;
}

export const VisualSummaryView: React.FC<VisualSummaryViewProps> = ({
  data,
  onJumpToPage,
  onBookmarkConcept,
}) => {
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title & Overview Banner */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="primary" size="sm">
            Visual Summary
          </Badge>
          <span className="text-xs text-slate-400">• Synthesized Study Guide</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
          {data.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {data.overview}
        </p>
      </div>

      {/* Key Concepts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-500" />
            Key Concepts & Definitions ({data.key_concepts?.length || 0})
          </h3>
          <span className="text-xs text-slate-400">Click page to inspect source</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.key_concepts?.map((c, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{c.term}</span>
                  <Badge
                    variant={
                      c.importance === 'foundational'
                        ? 'lavender'
                        : c.importance === 'high'
                        ? 'primary'
                        : 'secondary'
                    }
                    size="sm"
                  >
                    {c.importance}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {c.definition}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                {onJumpToPage && (
                  <button
                    onClick={() => onJumpToPage(c.page_reference)}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Page {c.page_reference}</span>
                  </button>
                )}

                {onBookmarkConcept && (
                  <button
                    onClick={() => onBookmarkConcept(c)}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Bookmark concept"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Takeaways */}
      {data.key_takeaways && data.key_takeaways.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Core Takeaways & Synthesis
          </h3>
          <ul className="space-y-3">
            {data.key_takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Formulas or Rules */}
      {data.formulas_or_rules && data.formulas_or_rules.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-500" />
            Key Axioms & Governing Rules
          </h3>
          <div className="space-y-2">
            {data.formulas_or_rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300"
              >
                {rule}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { DocumentItem } from '../../types';
import { Badge } from '../../components/common/Badge';
import { AIProviderBadge } from '../../components/common/AIProviderBadge';

interface WorkspaceHeaderProps {
  doc: DocumentItem;
  activeMode: string;
  onModeChange: (mode: any) => void;
  onPrintExport?: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  doc,
  activeMode,
  onModeChange,
  onPrintExport,
}) => {
  return (
    <header className="no-print h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/library"
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title="Back to library"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-sm sm:max-w-md">
              {doc.title}
            </h1>
            <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
              {doc.subject || 'General'}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 truncate hidden sm:block">
            {doc.page_count} pages • Visual Learning Suite
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:block">
          <AIProviderBadge />
        </div>

        {onPrintExport && (
          <button
            onClick={onPrintExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
            title="Export / Print summary"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export / Print</span>
          </button>
        )}
      </div>
    </header>
  );
};

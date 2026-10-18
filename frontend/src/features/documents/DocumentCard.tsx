import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MoreVertical,
  Edit2,
  Trash2,
  RotateCw,
  ExternalLink,
  Calendar,
  Layers
} from 'lucide-react';
import { DocumentItem } from '../../types';
import { StatusBadge, Badge } from '../../components/common/Badge';

interface DocumentCardProps {
  doc: DocumentItem;
  onRename: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  onRetry: (doc: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onRename,
  onDelete,
  onRetry,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const formattedDate = new Date(doc.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isCompleted = doc.processing_status === 'COMPLETED';

  return (
    <div
      onClick={() => {
        if (isCompleted) navigate(`/workspace/${doc.id}`);
      }}
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        isCompleted ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700/80' : 'cursor-default'
      }`}
    >
      <div>
        {/* Top Bar: Subject Badge & Status & Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="primary" size="sm">
            {doc.subject || 'General'}
          </Badge>
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <StatusBadge status={doc.processing_status} />

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1 z-30 text-xs animate-in fade-in zoom-in-95"
                  onClick={() => setMenuOpen(false)}
                >
                  {isCompleted && (
                    <button
                      onClick={() => navigate(`/workspace/${doc.id}`)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Lesson
                    </button>
                  )}
                  {doc.processing_status === 'FAILED' && (
                    <button
                      onClick={() => onRetry(doc)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Retry Process
                    </button>
                  )}
                  <button
                    onClick={() => onRename(doc)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Rename
                  </button>
                  <button
                    onClick={() => onDelete(doc)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {doc.title}
        </h3>

        {/* Document Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            {doc.page_count > 0 ? `${doc.page_count} pages` : 'Analyzing'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {(doc.file_size / (1024 * 1024)).toFixed(1)} MB
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>

        {isCompleted ? (
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Study Visuals →
          </span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400 font-medium">Processing...</span>
        )}
      </div>
    </div>
  );
};

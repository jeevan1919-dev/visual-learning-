import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  FileText,
  Maximize2
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import { DocumentSection } from '../../types';

interface PDFReaderViewProps {
  documentId: string;
  pageCount: number;
  initialPage?: number;
  sections?: DocumentSection[];
}

export const PDFReaderView: React.FC<PDFReaderViewProps> = ({
  documentId,
  pageCount,
  initialPage = 1,
  sections = [],
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'embedded' | 'extracted'>('embedded');

  const pdfUrl = documentService.getPdfUrl(documentId);

  useEffect(() => {
    if (initialPage) setCurrentPage(initialPage);
  }, [initialPage]);

  // Find section corresponding to current page
  const activeSection = sections.find(
    (s) => s.page_start <= currentPage && currentPage <= s.page_end
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* PDF Reader Control Bar */}
      <div className="p-3 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
              Page {currentPage} of {pageCount || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(pageCount || 1, p + 1))}
              disabled={currentPage >= (pageCount || 1)}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle Embedded PDF vs Extracted Text */}
          <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setViewMode('embedded')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'embedded'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Document PDF
            </button>
            <button
              onClick={() => setViewMode('extracted')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'extracted'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Extracted Text
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'extracted' && (
            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search text in page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden text-slate-800 dark:text-slate-200"
              />
            </div>
          )}

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* Viewer Main Frame */}
      <div className="flex-1 w-full h-full overflow-hidden relative">
        {viewMode === 'embedded' ? (
          <iframe
            src={`${pdfUrl}#page=${currentPage}`}
            className="w-full h-full border-none"
            title="PDF Document Viewer"
          />
        ) : (
          <div className="max-w-4xl mx-auto p-6 sm:p-10 h-full overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {activeSection?.title || `Page ${currentPage}`}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Extracted text representation • Page {currentPage}
                  </span>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {activeSection?.content ||
                  'No raw text extracted for this section or text is in scanned graphic format.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

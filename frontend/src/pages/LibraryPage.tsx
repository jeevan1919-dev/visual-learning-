import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FolderOpen,
  Search,
  Filter,
  LayoutGrid,
  List,
  Upload,
  ArrowUpDown,
  RotateCw
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { DocumentItem } from '../types';
import { DocumentCard } from '../features/documents/DocumentCard';
import { RenameModal } from '../features/documents/RenameModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/Badge';

const SUBJECT_FILTERS = [
  'all',
  'Computer Science',
  'Biology & Medicine',
  'Physics & Engineering',
  'Mathematics',
  'Business & Economics',
  'General',
];

export const LibraryPage: React.FC = () => {
  const { openUpload } = useOutletContext<{ openUpload: () => void }>() || {};

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'pages'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [renameDoc, setRenameDoc] = useState<DocumentItem | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [search, selectedSubject, statusFilter]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentService.list(search, selectedSubject, statusFilter);
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (doc: DocumentItem) => {
    try {
      await documentService.retryProcessing(doc.id);
      loadDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    try {
      await documentService.delete(deleteDoc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteDoc.id));
      setDeleteDoc(null);
    } catch (err) {
      console.error(err);
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'pages') return b.page_count - a.page_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Document Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and manage your visual study sets.
          </p>
        </div>

        {openUpload && (
          <button
            onClick={openUpload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-102 cursor-pointer self-start sm:self-center"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
        )}
      </div>

      {/* Search, Filter, Sort & View Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-hidden focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* Sort Select */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent outline-hidden text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="date">Newest First</option>
                <option value="title">Alphabetical (A-Z)</option>
                <option value="pages">Most Pages</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {SUBJECT_FILTERS.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sub === 'all' ? 'All Subjects' : sub}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : sortedDocuments.length === 0 ? (
        <EmptyState
          title="No Matching Documents Found"
          description={
            search || selectedSubject !== 'all'
              ? 'Try modifying your search keywords or subject filter.'
              : 'Upload your first PDF to generate visual mind maps and flowcharts.'
          }
          actionLabel="Upload PDF"
          onAction={openUpload}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onRename={(d) => setRenameDoc(d)}
              onDelete={(d) => setDeleteDoc(d)}
              onRetry={(d) => handleRetry(d)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Pages</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-900 dark:text-slate-100">
                    {doc.title}
                  </td>
                  <td className="p-4">{doc.subject || 'General'}</td>
                  <td className="p-4">{doc.page_count}</td>
                  <td className="p-4">
                    <StatusBadge status={doc.processing_status} />
                  </td>
                  <td className="p-4">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button
                      onClick={() => setRenameDoc(doc)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => setDeleteDoc(doc)}
                      className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rename Modal */}
      <RenameModal
        isOpen={!!renameDoc}
        doc={renameDoc}
        onClose={() => setRenameDoc(null)}
        onRenamed={(updated) => {
          setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteDoc}
        title="Delete Document?"
        message={`Are you sure you want to permanently delete "${deleteDoc?.title}"? All generated visual lessons, mind maps, and quiz attempts will be removed.`}
        confirmLabel="Yes, Delete"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDoc(null)}
      />
    </div>
  );
};

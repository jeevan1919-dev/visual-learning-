import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Printer,
  Trash2,
  Plus,
  Save,
  Check,
  FileText
} from 'lucide-react';
import { progressService } from '../../services/progressService';
import { NoteItem, VisualSummaryData } from '../../types';

interface NotesExportViewProps {
  documentId: string;
  documentTitle: string;
  summaryData?: VisualSummaryData | null;
}

export const NotesExportView: React.FC<NotesExportViewProps> = ({
  documentId,
  documentTitle,
  summaryData,
}) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [documentId]);

  const loadNotes = async () => {
    try {
      const data = await progressService.getNotes(documentId);
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setSaving(true);
    try {
      const created = await progressService.createNote(documentId, newNoteContent.trim());
      setNotes((prev) => [created, ...prev]);
      setNewNoteContent('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await progressService.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Action Header */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Notes & Export Suite
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personal learning notes and print-ready summary sheet for {documentTitle}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer self-start sm:self-center"
        >
          <Printer className="w-4 h-4" />
          <span>Export Printable Summary</span>
        </button>
      </div>

      {/* New Note Form */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-indigo-500" />
          Add Study Note or Observation
        </h3>

        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={3}
            placeholder="Jot down notes, exam tips, key formulas or questions..."
            className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl outline-hidden focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newNoteContent.trim() || saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Notes List */}
      {notes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 px-1">
            Your Personal Study Notes ({notes.length})
          </h3>

          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                  <span className="block text-[10px] text-slate-400 pt-1">
                    {new Date(note.created_at).toLocaleDateString()} at{' '}
                    {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="no-print p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print-Ready Summary Sheet (Visible in print or preview) */}
      {summaryData && (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 print:border-none print:p-0">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{documentTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">VisualLearn AI — Comprehensive Visual Learning Summary</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overview</h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {summaryData.overview}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Core Concepts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {summaryData.key_concepts?.map((c, i) => (
                <div key={i} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  <span className="font-bold block text-slate-900 dark:text-slate-100 mb-1">{c.term}</span>
                  <span className="text-slate-600 dark:text-slate-300">{c.definition}</span>
                </div>
              ))}
            </div>
          </div>

          {summaryData.key_takeaways && summaryData.key_takeaways.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Takeaways</h4>
              <ul className="list-disc pl-5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {summaryData.key_takeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

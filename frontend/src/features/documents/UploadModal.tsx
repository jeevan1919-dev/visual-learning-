import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import { DocumentItem, ProcessingStatus } from '../../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: DocumentItem) => void;
}

const SUBJECT_OPTIONS = [
  'General',
  'Computer Science',
  'Biology & Medicine',
  'Physics & Engineering',
  'Mathematics',
  'Business & Economics',
  'History & Social Sciences',
  'Law & Ethics',
];

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload & processing state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdDoc, setCreatedDoc] = useState<DocumentItem | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF documents are supported.');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB limit.');
      return;
    }
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    setError(null);

    try {
      setUploadProgress(50);
      const doc = await documentService.upload(file, title, subject);
      setUploadProgress(100);
      setCreatedDoc(doc);
      setProcessingStatus(doc.processing_status);

      if (onSuccess) onSuccess(doc);

      // Start polling processing status
      pollStatus(doc.id);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document. Please try again.');
      setUploading(false);
    }
  };

  const pollStatus = async (docId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await documentService.getStatus(docId);
        setProcessingStatus(res.status);
        if (res.error) setProcessingError(res.error);

        if (res.status === 'COMPLETED' || res.status === 'FAILED') {
          clearInterval(interval);
          setUploading(false);
        }
      } catch (err) {
        clearInterval(interval);
        setUploading(false);
      }
    }, 1500);
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setSubject('General');
    setError(null);
    setUploading(false);
    setUploadProgress(0);
    setCreatedDoc(null);
    setProcessingStatus(null);
    setProcessingError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleOpenWorkspace = () => {
    if (createdDoc) {
      handleClose();
      navigate(`/workspace/${createdDoc.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Upload Study PDF</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Transform textbook chapters, papers, or lecture notes</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Processing State View */}
        {createdDoc && (
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">
                  {createdDoc.title}
                </span>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-semibold">
                  {processingStatus}
                </span>
              </div>

              {/* Progress Steps Indicator */}
              <div className="space-y-2 mt-4 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>1. File uploaded securely</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  {processingStatus === 'EXTRACTING' ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : processingStatus === 'GENERATING' || processingStatus === 'COMPLETED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px]">2</span>
                  )}
                  <span>2. Extracting text, headings, and pages</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  {processingStatus === 'GENERATING' ? (
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                  ) : processingStatus === 'COMPLETED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px]">3</span>
                  )}
                  <span>3. Synthesizing mind maps, flowcharts & quiz</span>
                </div>
              </div>
            </div>

            {processingStatus === 'COMPLETED' && (
              <button
                onClick={handleOpenWorkspace}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Open Visual Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {processingStatus === 'FAILED' && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                <p className="font-semibold mb-1">Processing encountered an issue:</p>
                <p className="font-mono text-[11px]">{processingError || 'Unknown error occurred.'}</p>
                <button
                  onClick={() => documentService.retryProcessing(createdDoc.id).then(() => pollStatus(createdDoc.id))}
                  className="mt-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Retry Processing
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Form View */}
        {!createdDoc && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30'
                  : file
                  ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">{file.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF
                  </p>
                  <span className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    Click to change file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Click to browse or drag and drop your PDF
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Up to 50MB per document</p>
                </div>
              )}
            </div>

            {/* Title & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Photosynthesis"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject Area
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-indigo-500 text-slate-900 dark:text-slate-100 cursor-pointer"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || uploading}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze & Visualize</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

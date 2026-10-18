import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, RotateCw } from 'lucide-react';
import { documentService } from '../services/documentService';
import { lessonService } from '../services/lessonService';
import {
  DocumentItem,
  DocumentSection,
  VisualSummaryData,
  MindMapData,
  FlowchartData,
  ConceptDiagramData,
  StepByStepData,
} from '../types';
import { WorkspaceHeader } from '../features/workspace/WorkspaceHeader';
import { OutlineSidebar, WorkspaceMode } from '../features/workspace/OutlineSidebar';
import { VisualSummaryView } from '../features/workspace/VisualSummaryView';
import { MindMapView } from '../features/workspace/MindMapView';
import { FlowchartView } from '../features/workspace/FlowchartView';
import { ConceptDiagramView } from '../features/workspace/ConceptDiagramView';
import { StepByStepView } from '../features/workspace/StepByStepView';
import { PDFReaderView } from '../features/workspace/PDFReaderView';
import { AskAIView } from '../features/workspace/AskAIView';
import { QuizPracticeView } from '../features/workspace/QuizPracticeView';
import { NotesExportView } from '../features/workspace/NotesExportView';
import { WorkspaceSkeleton } from '../components/common/LoadingSkeleton';

export const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [activeMode, setActiveMode] = useState<WorkspaceMode>('mindmap');
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>();
  const [targetPdfPage, setTargetPdfPage] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lesson data states
  const [summaryData, setSummaryData] = useState<VisualSummaryData | null>(null);
  const [mindmapData, setMindmapData] = useState<MindMapData | null>(null);
  const [flowchartData, setFlowchartData] = useState<FlowchartData | null>(null);
  const [conceptsData, setConceptsData] = useState<ConceptDiagramData | null>(null);
  const [explanationsData, setExplanationsData] = useState<StepByStepData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadWorkspace(id);
    }
  }, [id]);

  const loadWorkspace = async (docId: string) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await documentService.getById(docId);
      setDocument(doc);

      const secList = await documentService.getSections(docId);
      setSections(secList);

      // Load all visual lesson data concurrently
      const [sum, mm, fc, conc, exp] = await Promise.allSettled([
        lessonService.getSummary(docId),
        lessonService.getMindmap(docId),
        lessonService.getFlowchart(docId),
        lessonService.getConcepts(docId),
        lessonService.getExplanations(docId),
      ]);

      if (sum.status === 'fulfilled') setSummaryData(sum.value);
      if (mm.status === 'fulfilled') setMindmapData(mm.value);
      if (fc.status === 'fulfilled') setFlowchartData(fc.value);
      if (conc.status === 'fulfilled') setConceptsData(conc.value);
      if (exp.status === 'fulfilled') setExplanationsData(exp.value);
    } catch (err: any) {
      setError(err.message || 'Failed to load visual workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleJumpToPage = (page: number) => {
    setTargetPdfPage(page);
    setActiveMode('pdf_reader');
  };

  const handleSelectSection = (sec: DocumentSection) => {
    setActiveSectionId(sec.id);
    setTargetPdfPage(sec.page_start);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Initializing visual workspace...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Unable to Open Workspace</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error || 'Document not found'}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/library')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Back to Library
            </button>
            <button
              onClick={() => id && loadWorkspace(id)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      {/* Workspace Top Header */}
      <WorkspaceHeader
        doc={document}
        activeMode={activeMode}
        onModeChange={(m) => setActiveMode(m)}
        onPrintExport={() => window.print()}
      />

      {/* Main Learning Canvas with Left Outline Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Outline & Mode Navigation */}
        <OutlineSidebar
          activeMode={activeMode}
          onSelectMode={(m) => setActiveMode(m)}
          sections={sections}
          activeSectionId={activeSectionId}
          onSelectSection={handleSelectSection}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Center Main Stage */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-slate-50 dark:bg-slate-950">
          {activeMode === 'summary' && summaryData && (
            <VisualSummaryView
              data={summaryData}
              onJumpToPage={handleJumpToPage}
            />
          )}

          {activeMode === 'mindmap' && mindmapData && (
            <MindMapView
              data={mindmapData}
              onJumpToPage={handleJumpToPage}
            />
          )}

          {activeMode === 'flowchart' && flowchartData && (
            <FlowchartView
              data={flowchartData}
              onJumpToPage={handleJumpToPage}
            />
          )}

          {activeMode === 'concepts' && conceptsData && (
            <ConceptDiagramView
              data={conceptsData}
              onJumpToPage={handleJumpToPage}
            />
          )}

          {activeMode === 'step_by_step' && explanationsData && (
            <StepByStepView
              data={explanationsData}
              onJumpToPage={handleJumpToPage}
            />
          )}

          {activeMode === 'pdf_reader' && (
            <PDFReaderView
              documentId={document.id}
              pageCount={document.page_count}
              initialPage={targetPdfPage}
              sections={sections}
            />
          )}

          {activeMode === 'ask_ai' && (
            <AskAIView
              documentId={document.id}
              documentTitle={document.title}
              onJumpToPage={handleJumpToPage}
            />
          )}

          {activeMode === 'quiz' && (
            <QuizPracticeView
              documentId={document.id}
              onJumpToPage={handleJumpToPage}
            />
          )}

          {activeMode === 'notes' && (
            <NotesExportView
              documentId={document.id}
              documentTitle={document.title}
              summaryData={summaryData}
            />
          )}
        </main>
      </div>
    </div>
  );
};

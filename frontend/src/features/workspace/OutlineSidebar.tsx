import React from 'react';
import {
  FileText,
  Network,
  GitFork,
  Boxes,
  ListOrdered,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Bookmark,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { DocumentSection } from '../../types';

export type WorkspaceMode =
  | 'summary'
  | 'mindmap'
  | 'flowchart'
  | 'concepts'
  | 'step_by_step'
  | 'pdf_reader'
  | 'ask_ai'
  | 'quiz'
  | 'notes';

interface OutlineSidebarProps {
  activeMode: WorkspaceMode;
  onSelectMode: (mode: WorkspaceMode) => void;
  sections: DocumentSection[];
  activeSectionId?: string;
  onSelectSection?: (section: DocumentSection) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const OutlineSidebar: React.FC<OutlineSidebarProps> = ({
  activeMode,
  onSelectMode,
  sections,
  activeSectionId,
  onSelectSection,
  isOpen,
  onToggle,
}) => {
  const modes = [
    { id: 'summary', label: 'Visual Summary', icon: FileText, badge: 'Key Points' },
    { id: 'mindmap', label: 'Interactive Mind Map', icon: Network, badge: 'React Flow' },
    { id: 'flowchart', label: 'Process Flowchart', icon: GitFork, badge: 'Workflow' },
    { id: 'concepts', label: 'Concept Network', icon: Boxes, badge: 'Entities' },
    { id: 'step_by_step', label: 'Step-by-Step', icon: ListOrdered, badge: '3 Levels' },
    { id: 'pdf_reader', label: 'Original PDF Reader', icon: BookOpen, badge: 'Pages' },
    { id: 'ask_ai', label: 'Ask AI Tutor', icon: MessageSquare, badge: 'Grounded' },
    { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle, badge: 'Interactive' },
    { id: 'notes', label: 'Notes & Bookmarks', icon: Bookmark, badge: 'Save' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Floating Toggle button on small screens */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-5 left-5 z-40 p-3 bg-indigo-600 text-white rounded-full shadow-xl"
        title="Toggle learning modes"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Header on mobile */}
          <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Learning Modes
            </span>
            <button onClick={onToggle} className="p-1 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Visual Modes Group */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
              Visual Modes
            </span>
            <div className="mt-2 space-y-1">
              {modes.slice(0, 5).map((m) => {
                const Icon = m.icon;
                const isActive = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMode(m.id as WorkspaceMode);
                      if (window.innerWidth < 1024) onToggle();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 opacity-80" />
                      <span>{m.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Study & Practice Group */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
              Tools & Practice
            </span>
            <div className="mt-2 space-y-1">
              {modes.slice(5).map((m) => {
                const Icon = m.icon;
                const isActive = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMode(m.id as WorkspaceMode);
                      if (window.innerWidth < 1024) onToggle();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 opacity-80" />
                      <span>{m.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Sections Outline */}
          {sections.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
                Document Sections ({sections.length})
              </span>
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
                {sections.map((sec, idx) => (
                  <button
                    key={sec.id}
                    onClick={() => onSelectSection && onSelectSection(sec)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors truncate block ${
                      activeSectionId === sec.id
                        ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    <span className="font-semibold text-slate-400 mr-1.5">{idx + 1}.</span>
                    {sec.title}
                    <span className="text-[10px] text-slate-400 ml-1">
                      (p.{sec.page_start}{sec.page_end !== sec.page_start ? `-${sec.page_end}` : ''})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
